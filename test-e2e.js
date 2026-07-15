const http = require('http');

http.get('http://localhost:5001/health', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Health Check Response:', data);
  });
}).on('error', (err) => {
  console.error('Error connecting to backend:', err.message);
});
