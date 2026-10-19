const express = require('express');
const path = require('path');
const app = require('./api/index.js');

const PORT = process.env.PORT || 3000;

// Static serving for local development
app.use('/tai-nguyen', express.static(path.join(__dirname, 'tai-nguyen')));
app.use('/data', express.static(path.join(__dirname, 'data')));
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// Admin routes & assets fallback
app.get(['/admin', '/admin/'], (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Content-Type', 'text/html; charset=UTF-8');
  res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

app.get(['/admin/login', '/admin/login.html'], (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Content-Type', 'text/html; charset=UTF-8');
  res.sendFile(path.join(__dirname, 'admin', 'login.html'));
});

app.get(['/admin.css', '/admin/admin.css'], (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Content-Type', 'text/css; charset=UTF-8');
  res.sendFile(path.join(__dirname, 'admin', 'admin.css'));
});

app.get(['/admin.js', '/admin/admin.js'], (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
  res.sendFile(path.join(__dirname, 'admin', 'admin.js'));
});

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

app.get('/i18n.js', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
  res.sendFile(path.join(__dirname, 'i18n.js'));
});

app.get(['/products', '/products.html'], (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Content-Type', 'text/html; charset=UTF-8');
  res.sendFile(path.join(__dirname, 'products.html'));
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

app.get(['/blog', '/blog.html'], (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Content-Type', 'text/html; charset=UTF-8');
  res.sendFile(path.join(__dirname, 'blog.html'));
});

app.get(['/post', '/post.html'], (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Content-Type', 'text/html; charset=UTF-8');
  res.sendFile(path.join(__dirname, 'post.html'));
});

app.get(['/order-tracking', '/order-tracking.html', '/tracking', '/tracking.html'], (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Content-Type', 'text/html; charset=UTF-8');
  res.sendFile(path.join(__dirname, 'order-tracking.html'));
});

app.get('/index.html', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Content-Type', 'text/html; charset=UTF-8');
  res.sendFile(path.join(__dirname, 'index.html'));
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
