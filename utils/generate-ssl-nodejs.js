/**
 * SSL Certificate Generator (Node.js Native)
 * Uses node-forge library to generate certificates without OpenSSL dependency
 */

const fs = require('fs');
const path = require('path');

// Try to load node-forge, provide installation instructions if missing
let forge;
try {
  forge = require('node-forge');
} catch (error) {
  console.error('\n❌ node-forge is not installed!');
  console.error('\nPlease install it first:');
  console.error('  npm install node-forge --save-dev\n');
  process.exit(1);
}

const sslDir = path.join(__dirname, '..', 'ssl');
const keyPath = path.join(sslDir, 'private.key');
const certPath = path.join(sslDir, 'certificate.crt');

/**
 * Generate self-signed SSL certificate using node-forge
 */
async function generateCertificate() {
  console.log('\n=================================');
  console.log('  SSL Certificate Generator');
  console.log('  (Node.js Native - No OpenSSL)');
  console.log('=================================\n');

  try {
    // Create ssl directory if it doesn't exist
    if (!fs.existsSync(sslDir)) {
      fs.mkdirSync(sslDir, { recursive: true });
      console.log('[SSL] ✓ Created ssl/ directory');
    }

    console.log('[SSL] Generating RSA key pair (4096-bit)...');
    
    // Generate a keypair
    const keys = forge.pki.rsa.generateKeyPair(4096);
    console.log('[SSL] ✓ RSA key pair generated');

    // Create a certificate
    console.log('[SSL] Creating X.509 certificate...');
    const cert = forge.pki.createCertificate();
    
    cert.publicKey = keys.publicKey;
    cert.serialNumber = '01';
    
    // Set validity period (1 year)
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

    // Set certificate attributes
    const attrs = [
      { name: 'countryName', value: 'IN' },
      { name: 'stateOrProvinceName', value: 'Punjab' },
      { name: 'localityName', value: 'Chandigarh' },
      { name: 'organizationName', value: 'ExpenseTracker' },
      { name: 'organizationalUnitName', value: 'Development' },
      { name: 'commonName', value: 'localhost' }
    ];
    
    cert.setSubject(attrs);
    cert.setIssuer(attrs);

    // Add extensions
    cert.setExtensions([
      {
        name: 'basicConstraints',
        cA: true
      },
      {
        name: 'keyUsage',
        keyCertSign: true,
        digitalSignature: true,
        nonRepudiation: true,
        keyEncipherment: true,
        dataEncipherment: true
      },
      {
        name: 'extKeyUsage',
        serverAuth: true,
        clientAuth: true,
        codeSigning: true,
        emailProtection: true,
        timeStamping: true
      },
      {
        name: 'subjectAltName',
        altNames: [
          { type: 2, value: 'localhost' },
          { type: 2, value: '127.0.0.1' },
          { type: 7, ip: '127.0.0.1' }
        ]
      }
    ]);

    // Self-sign certificate
    cert.sign(keys.privateKey, forge.md.sha256.create());
    console.log('[SSL] ✓ Certificate signed');

    // Convert to PEM format
    const pemKey = forge.pki.privateKeyToPem(keys.privateKey);
    const pemCert = forge.pki.certificateToPem(cert);

    // Save to files
    fs.writeFileSync(keyPath, pemKey);
    fs.writeFileSync(certPath, pemCert);

    console.log('\n✅ SSL Certificate generated successfully!\n');
    console.log('Files created:');
    console.log(`  📄 ${keyPath}`);
    console.log(`  📄 ${certPath}`);
    console.log('\nTo enable HTTPS:');
    console.log('  1. Set ENABLE_HTTPS=true in your .env file');
    console.log('  2. Start the server: npm start or npm run start:https\n');
    console.log('⚠️  Note: This is a self-signed certificate for development only.');
    console.log('    Browsers will show a security warning (this is normal).');
    console.log('    For production, use certificates from a trusted CA like Let\'s Encrypt.\n');

  } catch (error) {
    console.error('\n❌ Certificate generation failed!');
    console.error('Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('- Make sure you have write permissions in the project directory');
    console.error('- Check if the ssl/ directory can be created\n');
    process.exit(1);
  }
}

// Run the generator
generateCertificate();
