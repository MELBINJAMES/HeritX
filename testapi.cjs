const http = require('http');
http.get('http://localhost/HertiX/user-dashboard/backend/api/items.php', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('Valid JSON, length:', json.length);
    } catch(e) {
      console.log('JSON error:', e.message);
      console.log('Data sample:', data.substring(0, 100));
    }
  });
}).on('error', (e) => {
  console.log('HTTP error:', e.message);
});
