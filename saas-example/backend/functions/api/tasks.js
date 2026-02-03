// Multi-tenant Task API Handler

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand, PutCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME;

exports.handler = async (event) => {
  // Step 1: Extract tenant context from authorizer
  const tenantId = event.requestContext.authorizer.tenantId;
  const userId = event.requestContext.authorizer.userId;
  const roles = JSON.parse(event.requestContext.authorizer.roles);
  
  if (!tenantId) {
    return response(403, { error: { code: 'MISSING_TENANT', message: 'Tenant context required' } });
  }

  const method = event.httpMethod;
  const path = event.path;

  try {
    // Route to appropriate handler
    if (method === 'GET' && path === '/tasks') {
      return await listTasks(tenantId, event.queryStringParameters);
    }
    
    if (method === 'POST' && path === '/tasks') {
      return await createTask(tenantId, userId, JSON.parse(event.body));
    }
    
    if (method === 'GET' && path.startsWith('/tasks/')) {
      const taskId = path.split('/')[2];
      return await getTask(tenantId, taskId);
    }

    return response(404, { error: { code: 'NOT_FOUND', message: 'Endpoint not found' } });
  } catch (error) {
    console.error('Error:', { tenantId, error: error.message });
    return response(500, { error: { code: 'INTERNAL_ERROR', message: 'An error occurred' } });
  }
};

// List tasks for tenant
async function listTasks(tenantId, queryParams) {
  const status = queryParams?.status;
  
  // Query with tenant prefix - ensures tenant isolation
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

  const result = await docClient.send(new QueryCommand(params));
  
  return response(200, {
    tasks: result.Items.map(item => ({
      id: item.sk.split('#')[1],
      tenantId: item.tenantId,
      title: item.title,
      description: item.description,
      status: item.status,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }))
  });
}

// Create new task
async function createTask(tenantId, userId, body) {
  // Step 3: Validate parameters
  if (!body.title) {
    return response(400, { error: { code: 'INVALID_INPUT', message: 'Title is required' } });
  }

  const taskId = generateId();
  const now = new Date().toISOString();
  
  // Step 5: Prefix database operations with tenant ID
  const item = {
    pk: `${tenantId}#Task`,           // Tenant-scoped partition key
    sk: `Task#${taskId}`,             // Sort key
    tenantId: tenantId,
    id: taskId,
    title: body.title,
    description: body.description || '',
    status: 'pending',
    createdBy: userId,
    createdAt: now,
    updatedAt: now
  };

  await docClient.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: item
  }));

  return response(201, {
    id: taskId,
    tenantId: tenantId,
    title: item.title,
    description: item.description,
    status: item.status,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  });
}

// Get specific task
async function getTask(tenantId, taskId) {
  // Always scope to tenant
  const result = await docClient.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: {
      pk: `${tenantId}#Task`,
      sk: `Task#${taskId}`
    }
  }));

  if (!result.Item) {
    return response(404, { error: { code: 'NOT_FOUND', message: 'Task not found' } });
  }

  return response(200, {
    id: result.Item.id,
    tenantId: result.Item.tenantId,
    title: result.Item.title,
    description: result.Item.description,
    status: result.Item.status,
    createdAt: result.Item.createdAt,
    updatedAt: result.Item.updatedAt
  });
}

// Helper functions
function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(body)
  };
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
