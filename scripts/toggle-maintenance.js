const http = require('http');

// Configuration
const BASE_URL = 'http://localhost:3000';

function toggleMaintenanceMode(enable = false) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify([
      { key: 'maintenanceMode', value: enable }
    ]);

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/settings',
      method: 'PATCH',
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
          if (res.statusCode === 200) {
            resolve(response);
          } else {
            reject(new Error('Failed to update maintenance mode: ' + response.message));
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
  const action = process.argv[2]; // 'on' or 'off'
  
  if (!action || (action !== 'on' && action !== 'off')) {
    console.log('Usage: node scripts/toggle-maintenance.js [on|off]');
    console.log('Examples:');
    console.log('  node scripts/toggle-maintenance.js on   # Enable maintenance mode');
    console.log('  node scripts/toggle-maintenance.js off  # Disable maintenance mode');
    return;
  }

  const enable = action === 'on';
  
  try {
    console.log(`🔧 ${enable ? 'Enabling' : 'Disabling'} maintenance mode...`);
    const result = await toggleMaintenanceMode(enable);
    console.log(`✅ Maintenance mode ${enable ? 'enabled' : 'disabled'} successfully!`);
    console.log('Result:', result.message);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main(); 