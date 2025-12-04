const { MongoClient } = require('mongodb');

/**
 * Setup MongoDB Replica Set
 * Run this after starting MongoDB instances
 * 
 * Usage: node utils/setup-replication.js
 */

async function setupReplication() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const client = new MongoClient(uri);
  
  try {
    console.log('🔄 Connecting to MongoDB...');
    await client.connect();
    
    const adminDb = client.db('admin');
    
    console.log('🔄 Initializing replica set...');
    
    // Initialize replica set configuration
    const config = {
      _id: 'expenseTrackerRS',
      members: [
        { 
          _id: 0, 
          host: 'localhost:27017',
          priority: 2  // Highest priority - preferred primary
        },
        { 
          _id: 1, 
          host: 'localhost:27018',
          priority: 1  // Can become primary
        },
        { 
          _id: 2, 
          host: 'localhost:27019',
          priority: 1  // Can become primary
        }
      ]
    };
    
    try {
      const result = await adminDb.command({
        replSetInitiate: config
      });
      
      console.log('✅ Replica set initialized successfully!');
      console.log(result);
      
    } catch (initError) {
      if (initError.codeName === 'AlreadyInitialized') {
        console.log('ℹ️  Replica set already initialized');
        
        // Get current configuration
        const status = await adminDb.command({ replSetGetStatus: 1 });
        console.log('\n📊 Replica Set Status:');
        console.log(`   Set Name: ${status.set}`);
        console.log(`   Members: ${status.members.length}`);
        
        status.members.forEach(member => {
          console.log(`   - ${member.name}: ${member.stateStr} ${member.health === 1 ? '✅' : '❌'}`);
        });
        
      } else {
        throw initError;
      }
    }
    
    // Wait for replica set to stabilize
    console.log('\n⏳ Waiting for replica set to stabilize (10 seconds)...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Verify replica set status
    console.log('\n🔍 Verifying replica set...');
    const status = await adminDb.command({ replSetGetStatus: 1 });
    
    if (status.ok === 1) {
      console.log('✅ Replica set is operational!');
      console.log(`\n📊 Replica Set Details:`);
      console.log(`   Name: ${status.set}`);
      console.log(`   Date: ${status.date}`);
      console.log(`   Members: ${status.members.length}`);
      console.log('\n👥 Member Status:');
      
      status.members.forEach((member, index) => {
        const icon = member.stateStr === 'PRIMARY' ? '👑' : 
                     member.stateStr === 'SECONDARY' ? '📋' : '❓';
        console.log(`   ${icon} ${member.name}`);
        console.log(`      State: ${member.stateStr}`);
        console.log(`      Health: ${member.health === 1 ? 'Healthy ✅' : 'Unhealthy ❌'}`);
        console.log(`      Uptime: ${Math.floor(member.uptime / 60)} minutes`);
      });
      
      // Update connection string message
      console.log('\n📝 Use this connection string in your .env:');
      console.log('   MONGODB_URI=mongodb://localhost:27017,localhost:27018,localhost:27019/expense_tracker?replicaSet=expenseTrackerRS');
      
      // Write concern recommendation
      console.log('\n💡 Recommended Write Concern:');
      console.log('   w: "majority"  - Wait for majority of nodes');
      console.log('   j: true        - Wait for journal commit');
      console.log('   wtimeout: 5000 - Timeout after 5 seconds');
      
      console.log('\n✅ Setup Complete!');
      
    } else {
      console.error('❌ Replica set verification failed');
    }
    
  } catch (error) {
    console.error('❌ Replication setup failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Ensure all MongoDB instances are running');
    console.error('   2. Check that ports 27017, 27018, 27019 are available');
    console.error('   3. Verify bind_ip settings allow localhost connections');
    console.error('   4. Run: mongod --replSet expenseTrackerRS --port 27017 --dbpath /data/rs1');
    process.exit(1);
  } finally {
    await client.close();
  }
}

// Run setup
console.log('🚀 MongoDB Replica Set Setup\n');
console.log('Prerequisites:');
console.log('   1. MongoDB instances running on ports 27017, 27018, 27019');
console.log('   2. Each instance started with --replSet expenseTrackerRS flag\n');

setupReplication().catch(console.error);
