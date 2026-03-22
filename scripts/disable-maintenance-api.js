const http = require('http');

// Configuration
const BASE_URL = 'http://localhost:3000';
const ADMIN_EMAIL = 'admin@example.com'; // Replace with your admin email
const ADMIN_PASSWORD = 'admin123'; // Replace with your admin password

async function loginAsAdmin() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (res.statusCode === 200 && response.token) {
            resolve(response.token);
          } else {
            reject(new Error('Login failed: ' + response.message));
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function disableMaintenanceMode(token) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify([
      { key: 'maintenanceMode', value: false }
    ]);

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/settings',
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (res.statusCode === 200) {
            resolve(response);
          } else {
            reject(new Error('Failed to disable maintenance mode: ' + response.message));
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function main() {
  try {
    console.log('🔐 Logging in as admin...');
    const token = await loginAsAdmin();
    console.log('✅ Login successful');

    console.log('🔧 Disabling maintenance mode...');
    const result = await disableMaintenanceMode(token);
    console.log('✅ Maintenance mode disabled successfully!');
    console.log('Result:', result);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Make sure to:');
    console.log('1. Update ADMIN_EMAIL and ADMIN_PASSWORD in this script');
    console.log('2. Ensure the server is running on localhost:3000');
    console.log('3. Check that admin credentials are correct');
  }
}

main(); 