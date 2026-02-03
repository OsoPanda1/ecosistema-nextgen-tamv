// Authentication API - Signup, Login, Password Reset

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME;
const JWT_SECRET = process.env.JWT_SECRET;

exports.handler = async (event) => {
  const method = event.httpMethod;
  const path = event.path;

  try {
    if (method === 'POST' && path === '/auth/signup') {
      return await signup(JSON.parse(event.body));
    }
    
    if (method === 'POST' && path === '/auth/login') {
      return await login(JSON.parse(event.body));
    }
    
    if (method === 'POST' && path === '/auth/refresh') {
      return await refreshToken(JSON.parse(event.body));
    }

    return response(404, { error: { code: 'NOT_FOUND', message: 'Endpoint not found' } });
  } catch (error) {
    console.error('Auth error:', error);
    return response(500, { error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

// Signup new user
async function signup(body) {
  const { email, password, tenantName, fullName } = body;
  
  // Validate input
  if (!email || !password || !tenantName) {
    return response(400, { 
      error: { code: 'INVALID_INPUT', message: 'Email, password, and tenant name are required' } 
    });
  }

  if (password.length < 8) {
    return response(400, { 
      error: { code: 'WEAK_PASSWORD', message: 'Password must be at least 8 characters' } 
    });
  }

  // Check if user already exists
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return response(409, { 
      error: { code: 'USER_EXISTS', message: 'User with this email already exists' } 
    });
  }

  // Create tenant ID
  const tenantId = `tenant_${generateId()}`;
  const userId = `user_${generateId()}`;
  const now = new Date().toISOString();

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Create tenant
  await docClient.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: {
      pk: `Tenant#${tenantId}`,
      sk: 'Metadata',
      tenantId,
      name: tenantName,
      plan: 'free',
      status: 'active',
      createdAt: now,
      updatedAt: now
    }
  }));

  // Create user
  await docClient.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: {
      pk: `User#${userId}`,
      sk: 'Profile',
      userId,
      tenantId,
      email: email.toLowerCase(),
      fullName: fullName || '',
      passwordHash,
      roles: ['owner', 'admin'],
      status: 'active',
      createdAt: now,
      updatedAt: now,
      // GSI for email lookup
      GSI1PK: `Email#${email.toLowerCase()}`,
      GSI1SK: 'User'
    }
  }));

  // Generate JWT token
  const token = generateToken(userId, tenantId, ['owner', 'admin'], email);

  return response(201, {
    success: true,
    user: {
      id: userId,
      email,
      fullName: fullName || '',
      tenantId,
      roles: ['owner', 'admin']
    },
    tenant: {
      id: tenantId,
      name: tenantName,
      plan: 'free'
    },
    token
  });
}

// Login user
async function login(body) {
  const { email, password } = body;
  
  if (!email || !password) {
    return response(400, { 
      error: { code: 'INVALID_INPUT', message: 'Email and password are required' } 
    });
  }

  // Get user by email
  const user = await getUserByEmail(email);
  if (!user) {
    return response(401, { 
      error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } 
    });
  }

  // Verify password
  const validPassword = await bcrypt.compare(password, user.passwordHash);
  if (!validPassword) {
    return response(401, { 
      error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } 
    });
  }

  // Check user status
  if (user.status !== 'active') {
    return response(403, { 
      error: { code: 'ACCOUNT_DISABLED', message: 'Account is disabled' } 
    });
  }

  // Get tenant info
  const tenant = await getTenant(user.tenantId);

  // Generate JWT token
  const token = generateToken(user.userId, user.tenantId, user.roles, user.email);

  return response(200, {
    success: true,
    user: {
      id: user.userId,
      email: user.email,
      fullName: user.fullName,
      tenantId: user.tenantId,
      roles: user.roles
    },
    tenant: {
      id: tenant.tenantId,
      name: tenant.name,
      plan: tenant.plan
    },
    token
  });
}

// Refresh token
async function refreshToken(body) {
  const { token } = body;
  
  if (!token) {
    return response(400, { 
      error: { code: 'INVALID_INPUT', message: 'Token is required' } 
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Generate new token
    const newToken = generateToken(
      decoded.sub,
      decoded.tenantId,
      decoded.roles,
      decoded.email
    );

    return response(200, {
      success: true,
      token: newToken
    });
  } catch (error) {
    return response(401, { 
      error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' } 
    });
  }
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

async function getTenant(tenantId) {
  const result = await docClient.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: {
      pk: `Tenant#${tenantId}`,
      sk: 'Metadata'
    }
  }));

  return result.Item;
}

function generateToken(userId, tenantId, roles, email) {
  return jwt.sign(
    {
      sub: userId,
      tenantId,
      roles,
      email
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
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
