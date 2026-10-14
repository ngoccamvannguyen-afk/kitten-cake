const express = require('express');
const path = require('path');
const app = require('./api/index.js');

const PORT = process.env.PORT || 3000;

// Static serving for local development
app.use('/tai-nguyen', express.static(path.join(__dirname, 'tai-nguyen')));
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// Serve root static files
app.get('/style.css', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Content-Type', 'text/css; charset=UTF-8');
  res.sendFile(path.join(__dirname, 'style.css'));
});

app.get('/app.js', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
  res.sendFile(path.join(__dirname, 'app.js'));
});

app.get('/product.js', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
  res.sendFile(path.join(__dirname, 'product.js'));
});

app.get('/cart.js', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
  res.sendFile(path.join(__dirname, 'cart.js'));
});

app.get('/index.html', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Content-Type', 'text/html; charset=UTF-8');
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get(['/product', '/product.html'], (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Content-Type', 'text/html; charset=UTF-8');
  res.sendFile(path.join(__dirname, 'product.html'));
});

app.get(['/cart', '/cart.html'], (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Content-Type', 'text/html; charset=UTF-8');
  res.sendFile(path.join(__dirname, 'cart.html'));
});

app.use(express.static(__dirname));

// Fallback for root /
app.get('/', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server locally
if (require.main === module) {
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });

  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🍰 KITTEN CAKE CMS SERVER RUNNING!`);
    console.log(`👉 Trang chủ khách xem : http://localhost:${PORT}`);
    console.log(`👉 Trang quản trị (CMS): http://localhost:${PORT}/admin`);
    console.log(`🔐 Tài khoản mặc định : admin / 123`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
