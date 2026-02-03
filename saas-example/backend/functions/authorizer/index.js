// Lambda Authorizer - Validates JWT and injects tenant context

const jwt = require('jsonwebtoken');

exports.handler = async (event) => {
  const token = event.authorizationToken?.replace('Bearer ', '');
  
  if (!token) {
    throw new Error('Unauthorized');
  }

  try {
    // Verify JWT (use your auth provider's public key)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Extract tenant ID and roles from token claims
    const tenantId = decoded.tenantId || decoded['custom:tenantId'];
    const roles = decoded.roles || ['user'];
    
    if (!tenantId) {
      throw new Error('Missing tenant context');
    }

    // Generate IAM policy allowing access
    return {
      principalId: decoded.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [{
          Action: 'execute-api:Invoke',
          Effect: 'Allow',
          Resource: event.methodArn
        }]
      },
      context: {
        // Inject tenant context into all downstream requests
        tenantId: tenantId,
        userId: decoded.sub,
        roles: JSON.stringify(roles),
        email: decoded.email
      }
    };
  } catch (error) {
    console.error('Auth error:', error);
    throw new Error('Unauthorized');
  }
};
