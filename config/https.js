const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

/**
 * Create HTTPS server with SSL/TLS support
 * Falls back to HTTP if certificates are not available
 */
const createSecureServer = (app) => {
  const sslKeyPath = process.env.SSL_KEY_PATH || path.join(__dirname, '..', 'ssl', 'private.key');
  const sslCertPath = process.env.SSL_CERT_PATH || path.join(__dirname, '..', 'ssl', 'certificate.crt');
  
  // Check if SSL certificates exist
  const hasSSL = fs.existsSync(sslKeyPath) && fs.existsSync(sslCertPath);
  
  if (hasSSL && process.env.ENABLE_HTTPS === 'true') {
    try {
      const options = {
        key: fs.readFileSync(sslKeyPath),
        cert: fs.readFileSync(sslCertPath),
        // TLS configuration for security
        minVersion: 'TLSv1.2',
        ciphers: [
          'ECDHE-ECDSA-AES128-GCM-SHA256',
          'ECDHE-RSA-AES128-GCM-SHA256',
          'ECDHE-ECDSA-AES256-GCM-SHA384',
          'ECDHE-RSA-AES256-GCM-SHA384',
          'DHE-RSA-AES128-GCM-SHA256',
          'DHE-RSA-AES256-GCM-SHA384'
        ].join(':'),
        honorCipherOrder: true
      };

      const httpsServer = https.createServer(options, app);
      console.log('[HTTPS] SSL/TLS certificates loaded successfully');
      console.log('[HTTPS] TLS 1.2/1.3 enabled with strong cipher suites');
      return httpsServer;

    } catch (error) {
      console.error('[HTTPS] Error loading SSL certificates:', error.message);
      console.log('[HTTP] Falling back to HTTP server');
      return http.createServer(app);
    }
  } else {
    if (!hasSSL) {
      console.log('[HTTP] SSL certificates not found - using HTTP');
      console.log('[HTTP] To enable HTTPS, generate certificates:');
      console.log('[HTTP]   npm run generate:ssl');
    } else {
      console.log('[HTTP] HTTPS disabled in environment');
    }
    return http.createServer(app);
  }
};

/**
 * Generate self-signed SSL certificate for development
 */
const generateSelfSignedCert = () => {
  const { execSync } = require('child_process');
  const sslDir = path.join(__dirname, '..', 'ssl');
  
  // Create SSL directory if it doesn't exist
  if (!fs.existsSync(sslDir)) {
    fs.mkdirSync(sslDir, { recursive: true });
    console.log('[SSL] Created ssl/ directory');
  }

  try {
    console.log('[SSL] Generating self-signed certificate...');
    
    // Generate private key and certificate
    execSync(`openssl req -x509 -newkey rsa:4096 -keyout "${path.join(sslDir, 'private.key')}" -out "${path.join(sslDir, 'certificate.crt')}" -days 365 -nodes -subj "/C=IN/ST=Punjab/L=Chandigarh/O=ExpenseTracker/OU=Development/CN=localhost"`, {
      stdio: 'inherit'
    });

    console.log('[SSL] Self-signed certificate generated successfully!');
    console.log('[SSL] Certificate valid for 365 days');
    console.log('[SSL] Files created:');
    console.log('[SSL]   - ssl/private.key');
    console.log('[SSL]   - ssl/certificate.crt');
    console.log('[SSL] Set ENABLE_HTTPS=true in .env to use HTTPS');

  } catch (error) {
    console.error('[SSL] Error generating certificate:', error.message);
    console.log('[SSL] Make sure OpenSSL is installed:');
    console.log('[SSL]   Windows: https://slproweb.com/products/Win32OpenSSL.html');
    console.log('[SSL]   Or use Git Bash which includes OpenSSL');
    throw error;
  }
};

/**
 * Get server protocol and port information
 */
const getServerInfo = (server) => {
  const isHTTPS = server instanceof https.Server;
  const defaultPort = isHTTPS ? 443 : 5000;
  const port = process.env.PORT || defaultPort;
  const protocol = isHTTPS ? 'https' : 'http';
  
  return { 
    httpsEnabled: isHTTPS, 
    port, 
    protocol 
  };
};

module.exports = {
  createSecureServer,
  generateSelfSignedCert,
  getServerInfo
};
