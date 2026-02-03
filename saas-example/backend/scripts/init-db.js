// Database initialization script
// Creates sample data for testing

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const bcrypt = require('bcryptjs');

const client = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME || 'task-manager-api-dev-tasks';

async function initializeDatabase() {
  console.log('Initializing database with sample data...');
  
  const tenantId = 'tenant_demo123';
  const userId = 'user_demo456';
  const now = new Date().toISOString();
  const passwordHash = await bcrypt.hash('password123', 10);

  try {
    // Create demo tenant
    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        pk: `Tenant#${tenantId}`,
        sk: 'Metadata',
        tenantId,
        name: 'Demo Company',
        plan: 'pro',
        status: 'active',
        createdAt: now,
        updatedAt: now
      }
    }));
    console.log('✅ Created demo tenant');

    // Create demo user
    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        pk: `User#${userId}`,
        sk: 'Profile',
        userId,
        tenantId,
        email: 'demo@example.com',
        fullName: 'Demo User',
        passwordHash,
        roles: ['owner', 'admin'],
        status: 'active',
        createdAt: now,
        updatedAt: now,
        GSI1PK: 'Email#demo@example.com',
        GSI1SK: 'User',
        GSI2PK: `Tenant#${tenantId}`,
        GSI2SK: `User#${userId}`
      }
    }));
    console.log('✅ Created demo user (email: demo@example.com, password: password123)');

    // Create sample tasks
    const tasks = [
      { title: 'Complete project documentation', description: 'Write comprehensive docs', status: 'pending' },
      { title: 'Review pull requests', description: 'Check team PRs', status: 'pending' },
      { title: 'Deploy to production', description: 'Final deployment', status: 'completed' }
    ];

    for (const task of tasks) {
      const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await docClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          pk: `${tenantId}#Task`,
          sk: `Task#${taskId}`,
          tenantId,
          id: taskId,
          title: task.title,
          description: task.description,
          status: task.status,
          createdBy: userId,
          createdAt: now,
          updatedAt: now
        }
      }));
    }
    console.log('✅ Created sample tasks');

    console.log('\n🎉 Database initialized successfully!');
    console.log('\nDemo credentials:');
    console.log('  Email: demo@example.com');
    console.log('  Password: password123');
    console.log('  Tenant: Demo Company');
    
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}

initializeDatabase()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
