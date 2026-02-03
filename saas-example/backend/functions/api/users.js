// User Management API - CRUD operations for users within a tenant

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand, PutCommand, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const bcrypt = require('bcryptjs');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME;

exports.handler = async (event) => {
  // Extract tenant context from authorizer
  const tenantId = event.requestContext.authorizer.tenantId;
  const userId = event.requestContext.authorizer.userId;
  const roles = JSON.parse(event.requestContext.authorizer.roles);
  
  if (!tenantId) {
    return response(403, { error: { code: 'MISSING_TENANT', message: 'Tenant context required' } });
  }

  const method = event.httpMethod;
  const path = event.path;

  try {
    // Only admins can manage users
    if (!roles.includes('admin') && !roles.includes('owner')) {
      return response(403, { error: { code: 'FORBIDDEN', message: 'Admin access required' } });
    }

    if (method === 'GET' && path === '/users') {
      return await listUsers(tenantId);
    }
    
    if (method === 'POST' && path === '/users') {
      return await createUser(tenantId, userId, JSON.parse(event.body));
    }
    
    if (method === 'GET' && path.startsWith('/users/')) {
      const targetUserId = path.split('/')[2];
      return await getUser(tenantId, targetUserId);
    }
    
    if (method === 'PUT' && path.startsWith('/users/')) {
      const targetUserId = path.split('/')[2];
      return await updateUser(tenantId, targetUserId, JSON.parse(event.body));
    }

    return response(404, { error: { code: 'NOT_FOUND', message: 'Endpoint not found' } });
  } catch (error) {
    console.error('Error:', { tenantId, error: error.message });
    return response(500, { error: { code: 'INTERNAL_ERROR', message: 'An error occurred' } });
  }
};

// List users in tenant
async function listUsers(tenantId) {
  const result = await docClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :tenantId AND begins_with(GSI1SK, :userPrefix)',
    ExpressionAttributeValues: {
      ':tenantId': `Tenant#${tenantId}`,
      ':userPrefix': 'User#'
    }
  }));

  return response(200, {
    users: result.Items.map(item => ({
      id: item.userId,
      email: item.email,
      fullName: item.fullName,
      roles: item.roles,
      status: item.status,
      createdAt: item.createdAt
    }))
  });
}

// Create new user in tenant
async function createUser(tenantId, creatorId, body) {
  const { email, password, fullName, roles } = body;
  
  if (!email || !password) {
    return response(400, { 
      error: { code: 'INVALID_INPUT', message: 'Email and password are required' } 
    });
  }

  // Check if user already exists
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return response(409, { 
      error: { code: 'USER_EXISTS', message: 'User with this email already exists' } 
    });
  }

  const newUserId = `user_${generateId()}`;
  const now = new Date().toISOString();
  const passwordHash = await bcrypt.hash(password, 10);

  await docClient.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: {
      pk: `User#${newUserId}`,
      sk: 'Profile',
      userId: newUserId,
      tenantId,
      email: email.toLowerCase(),
      fullName: fullName || '',
      passwordHash,
      roles: roles || ['user'],
      status: 'active',
      createdBy: creatorId,
      createdAt: now,
      updatedAt: now,
      // GSI for email lookup
      GSI1PK: `Email#${email.toLowerCase()}`,
      GSI1SK: 'User',
      // GSI for tenant users
      GSI2PK: `Tenant#${tenantId}`,
      GSI2SK: `User#${newUserId}`
    }
  }));

  return response(201, {
    id: newUserId,
    email,
    fullName: fullName || '',
    roles: roles || ['user'],
    status: 'active',
    createdAt: now
  });
}

// Get user details
async function getUser(tenantId, targetUserId) {
  const result = await docClient.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: {
      pk: `User#${targetUserId}`,
      sk: 'Profile'
    }
  }));

  if (!result.Item || result.Item.tenantId !== tenantId) {
    return response(404, { error: { code: 'NOT_FOUND', message: 'User not found' } });
  }

  return response(200, {
    id: result.Item.userId,
    email: result.Item.email,
    fullName: result.Item.fullName,
    roles: result.Item.roles,
    status: result.Item.status,
    createdAt: result.Item.createdAt,
    updatedAt: result.Item.updatedAt
  });
}

// Update user
async function updateUser(tenantId, targetUserId, body) {
  const { fullName, roles, status } = body;
  
  // Verify user belongs to tenant
  const user = await docClient.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: {
      pk: `User#${targetUserId}`,
      sk: 'Profile'
    }
  }));

  if (!user.Item || user.Item.tenantId !== tenantId) {
    return response(404, { error: { code: 'NOT_FOUND', message: 'User not found' } });
  }

  const updates = [];
  const values = {};
  const names = {};

  if (fullName !== undefined) {
    updates.push('#fullName = :fullName');
    values[':fullName'] = fullName;
    names['#fullName'] = 'fullName';
  }

  if (roles !== undefined) {
    updates.push('#roles = :roles');
    values[':roles'] = roles;
    names['#roles'] = 'roles';
  }

  if (status !== undefined) {
    updates.push('#status = :status');
    values[':status'] = status;
    names['#status'] = 'status';
  }

  updates.push('#updatedAt = :updatedAt');
  values[':updatedAt'] = new Date().toISOString();
  names['#updatedAt'] = 'updatedAt';

  await docClient.send(new UpdateCommand({
    TableName: TABLE_NAME,
    Key: {
      pk: `User#${targetUserId}`,
      sk: 'Profile'
    },
    UpdateExpression: `SET ${updates.join(', ')}`,
    ExpressionAttributeValues: values,
    ExpressionAttributeNames: names
  }));

  return response(200, {
    success: true,
    message: 'User updated successfully'
  });
}

// Helper functions
async function getUserByEmail(email) {
  const result = await docClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :email',
    ExpressionAttributeValues: {
      ':email': `Email#${email.toLowerCase()}`
    }
  }));

  return result.Items?.[0];
}

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
