/**
 * SSL Certificate Generator
 * Generates self-signed certificates for development HTTPS
 * 
 * Usage: node utils/generate-ssl.js
 */

const { generateSelfSignedCert } = require('../config/https');

console.log('=================================');
console.log('  SSL Certificate Generator');
console.log('=================================\n');

try {
  generateSelfSignedCert();
  
  console.log('\n✅ SSL Certificate Generation Complete!\n');
  console.log('Next steps:');
  console.log('1. Add to .env file: ENABLE_HTTPS=true');
  console.log('2. Restart server: npm start');
  console.log('3. Access at: https://localhost:5000\n');
  console.log('⚠️  Note: Self-signed certificates will show browser warnings.');
  console.log('   This is normal for development. Click "Advanced" and proceed.\n');
  
} catch (error) {
  console.error('\n❌ Certificate generation failed!');
  console.error('Error:', error.message);
  console.log('\nTroubleshooting:');
  console.log('- Install OpenSSL for Windows');
  console.log('- Or use Git Bash terminal (includes OpenSSL)');
  console.log('- Or manually create certificates\n');
  process.exit(1);
}
