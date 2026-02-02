const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const eventbridge = new AWS.EventBridge();

const TABLE_NAME = process.env.TASKS_TABLE || 'tasks-table';

/**
 * Multi-tenant Task API Handler
 * Demonstrates core SaaS patterns: tenant isolation, RBAC, usage tracking
 */
exports.handler = async (event) => {
  try {
    // STEP 1: Extract tenant context from authorizer (NEVER trust request body)
    const tenantId = event.requestContext.authorizer.tenantId;
    const userId = event.requestContext.authorizer.userId;
    const roles = JSON.parse(event.requestContext.authorizer.roles || '["user"]');
    
    if (!tenantId) {
      return errorResponse(403, 'MISSING_TENANT', 'Tenant context required');
    }

    // STEP 2: Route to appropriate handler
    const method = event.httpMethod;
    const pathParameters = event.pathParameters || {};
    
    switch (method) {
      case 'GET':
        if (pathParameters.taskId) {
          return await getTask(tenantId, pathParameters.taskId);
        } else {
          return await listTasks(tenantId, event.queryStringParameters || {});
        }
      
      case 'POST':
        return await createTask(tenantId, userId, JSON.parse(event.body || '{}'));
      
      case 'PUT':
        return await updateTask(tenantId, userId, pathParameters.taskId, JSON.parse(event.body || '{}'), roles);
      
      case 'DELETE':
        return await deleteTask(tenantId, pathParameters.taskId, roles);
      
      default:
        return errorResponse(405, 'METHOD_NOT_ALLOWED', 'Method not supported');
    }

  } catch (error) {
    console.error('Task API error:', error);
    return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error');
  }
};

/**
 * List tasks for tenant with pagination and filtering
 */
async function listTasks(tenantId, queryParams) {
  const { status, page = 1, pageSize = 20 } = queryParams;
  
  // CRITICAL: All queries scoped to tenant
  const params = {
    TableName: TABLE_NAME,
    KeyConditionExpression: 'pk = :pk',
    ExpressionAttributeValues: {
      ':pk': `${tenantId}#Task`
    }
  };

  // Add status filter if provided
  if (status) {
    params.FilterExpression = '#status = :status';
    params.ExpressionAttributeNames = { '#status': 'status' };
    params.ExpressionAttributeValues[':status'] = status;
  }

  const result = await dynamodb.query(params).promise();
  
  // Simple pagination (in production, use DynamoDB pagination tokens)
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + parseInt(pageSize);
  const paginatedTasks = result.Items.slice(startIndex, endIndex);

  return {
    statusCode: 200,
    headers: corsHeaders(),
    body: JSON.stringify({
      tasks: paginatedTasks.map(formatTask),
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        total: result.Items.length,
        hasNext: endIndex < result.Items.length
      }
    })
  };
}

/**
 * Get single task by ID (tenant-scoped)
 */
async function getTask(tenantId, taskId) {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      pk: `${tenantId}#Task`,
      sk: `Task#${taskId}`
    }
  };

  const result = await dynamodb.get(params).promise();
  
  if (!result.Item) {
    return errorResponse(404, 'TASK_NOT_FOUND', 'Task not found');
  }

  return {
    statusCode: 200,
    headers: corsHeaders(),
    body: JSON.stringify(formatTask(result.Item))
  };
}

/**
 * Create new task and track usage for billing
 */
async function createTask(tenantId, userId, taskData) {
  const { title, description, priority = 'medium', dueDate } = taskData;
  
  if (!title || title.length > 200) {
    return errorResponse(400, 'INVALID_TITLE', 'Title is required and must be under 200 characters');
  }

  const taskId = uuidv4();
  const now = new Date().toISOString();
  
  const task = {
    pk: `${tenantId}#Task`,
    sk: `Task#${taskId}`,
    id: taskId,
    title,
    description: description || '',
    status: 'pending',
    priority,
    createdBy: userId,
    createdAt: now,
    updatedAt: now,
    dueDate: dueDate || null,
    // GSI for time-based queries
    GSI1PK: tenantId,
    GSI1SK: `Task#${now}`
  };

  // Save task
  await dynamodb.put({
    TableName: TABLE_NAME,
    Item: task
  }).promise();

  // STEP 3: Track usage for billing (publish to EventBridge)
  await trackUsage(tenantId, userId, 'task_created', {
    taskId,
    timestamp: now
  });

  return {
    statusCode: 201,
    headers: corsHeaders(),
    body: JSON.stringify(formatTask(task))
  };
}

/**
 * Update task (with permission check)
 */
async function updateTask(tenantId, userId, taskId, updates, roles) {
  // Get existing task
  const existing = await dynamodb.get({
    TableName: TABLE_NAME,
    Key: {
      pk: `${tenantId}#Task`,
      sk: `Task#${taskId}`
    }
  }).promise();

  if (!existing.Item) {
    return errorResponse(404, 'TASK_NOT_FOUND', 'Task not found');
  }

  // STEP 4: Check permissions (users can only edit their own tasks, admins can edit any)
  const isAdmin = roles.includes('admin');
  const isOwner = existing.Item.createdBy === userId;
  
  if (!isAdmin && !isOwner) {
    return errorResponse(403, 'FORBIDDEN', 'You can only edit your own tasks');
  }

  // Update task
  const updatedTask = {
    ...existing.Item,
    ...updates,
    updatedAt: new Date().toISOString()
  };

  await dynamodb.put({
    TableName: TABLE_NAME,
    Item: updatedTask
  }).promise();

  return {
    statusCode: 200,
    headers: corsHeaders(),
    body: JSON.stringify(formatTask(updatedTask))
  };
}

/**
 * Delete task (admin only)
 */
async function deleteTask(tenantId, taskId, roles) {
  // STEP 5: Role-based access control
  if (!roles.includes('admin')) {
    return errorResponse(403, 'FORBIDDEN', 'Only admins can delete tasks');
  }

  await dynamodb.delete({
    TableName: TABLE_NAME,
    Key: {
      pk: `${tenantId}#Task`,
      sk: `Task#${taskId}`
    }
  }).promise();

  return {
    statusCode: 204,
    headers: corsHeaders(),
    body: ''
  };
}

/**
 * Track usage events for billing
 */
async function trackUsage(tenantId, userId, eventType, metadata) {
  const usageEvent = {
    Source: 'task-management-saas',
    DetailType: 'Usage Event',
    Detail: JSON.stringify({
      tenantId,
      userId,
      eventType,
      timestamp: new Date().toISOString(),
      metadata
    })
  };

  try {
    await eventbridge.putEvents({
      Entries: [usageEvent]
    }).promise();
    
    console.log(`Usage tracked: ${eventType} for tenant ${tenantId}`);
  } catch (error) {
    console.error('Failed to track usage:', error);
    // Don't fail the request if usage tracking fails
  }
}

/**
 * Format task for API response (remove internal fields)
 */
function formatTask(task) {
  const { pk, sk, GSI1PK, GSI1SK, ...publicTask } = task;
  return publicTask;
}

/**
 * Standard error response
 */
function errorResponse(statusCode, code, message) {
  return {
    statusCode,
    headers: corsHeaders(),
    body: JSON.stringify({
      error: { code, message }
    })
  };
}

/**
 * CORS headers for browser requests
 */
function corsHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };
}