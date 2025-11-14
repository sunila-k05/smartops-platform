const http = require('http');

http.get('http://localhost:5000/health', (res) => {
  let data = '';
  res.on('data', (d) => data += d);
  res.on('end', () => {
    console.log('health response:', data);
    process.exit(0);
  });
}).on('error', (e) => {
  console.error('error', e);
  process.exit(1);
});
