const jwt = require('jsonwebtoken');

/**
 * Lambda Authorizer - Validates JWT and injects tenant context
 * This is the security boundary for multi-tenant isolation
 */
exports.handler = async (event) => {
  try {
    // Extract token from Authorization header
    const token = event.authorizationToken?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error('No token provided');
    }

    // Verify JWT (in production, use proper secret from AWS Secrets Manager)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Extract tenant and user information
    const tenantId = decoded.tenantId;
    const userId = decoded.sub;
    const roles = decoded.roles || ['user'];
    
    if (!tenantId) {
      throw new Error('Token missing tenant information');
    }

    // Generate policy allowing access to API
    const policy = {
      principalId: userId,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: event.methodArn
          }
        ]
      },
      // CRITICAL: Inject tenant context into all subsequent Lambda functions
      context: {
        tenantId: tenantId,
        userId: userId,
        roles: JSON.stringify(roles),
        email: decoded.email || ''
      }
    };

    console.log(`Authorized user ${userId} for tenant ${tenantId}`);
    return policy;

  } catch (error) {
    console.error('Authorization failed:', error.message);
    throw new Error('Unauthorized');
  }
};