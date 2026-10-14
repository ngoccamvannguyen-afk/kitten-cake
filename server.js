const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'content.json');
const BACKUP_FILE = path.join(DATA_DIR, 'content.backup.json');
const UPLOAD_DIR = path.join(__dirname, 'tai-nguyen');

// Ensure directories exist
try {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
} catch (e) {
  // Read-only filesystem in serverless environments like Vercel
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Generate clean safe filename with timestamp
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanBase = path.basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-');
    const uniqueName = `${cleanBase}-${Date.now()}${ext}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif|svg/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) {
      return cb(null, true);
    }
    cb(new Error('Chỉ chấp nhận các định dạng ảnh: JPG, PNG, WEBP, GIF, SVG!'));
  }
});

// Helper: Read content safely
function readContent() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading data file:', err);
    if (fs.existsSync(BACKUP_FILE)) {
      console.log('Restoring from backup...');
      const raw = fs.readFileSync(BACKUP_FILE, 'utf8');
      return JSON.parse(raw);
    }
  }
  return null;
}

// Helper: Save content safely with backup
function saveContent(data) {
  try {
    if (fs.existsSync(DATA_FILE)) {
      fs.copyFileSync(DATA_FILE, BACKUP_FILE);
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error saving data:', err);
    return false;
  }
}

// ---------------- API ROUTES ----------------

// GET /api/content: Public endpoint to fetch site content
app.get('/api/content', (req, res) => {
  const data = readContent();
  if (!data) {
    return res.status(500).json({ error: 'Không thể đọc dữ liệu nội dung.' });
  }
  // Sanitize auth data before sending to client
  const { adminAuth, ...publicContent } = data;
  res.json({ success: true, data: publicContent });
});

// POST /api/content: Save site content (CMS)
app.post('/api/content', (req, res) => {
  const currentData = readContent() || {};
  const updatedContent = req.body;

  if (!updatedContent || typeof updatedContent !== 'object') {
    return res.status(400).json({ error: 'Dữ liệu không hợp lệ.' });
  }

  // Preserve admin credentials & existing orders
  const mergedData = {
    ...currentData,
    ...updatedContent,
    adminAuth: currentData.adminAuth || { username: 'admin', password: '123' },
    orders: currentData.orders || []
  };

  const saved = saveContent(mergedData);
  if (saved) {
    res.json({ success: true, message: 'Lưu thay đổi thành công!' });
  } else {
    res.status(500).json({ error: 'Lỗi ghi tệp dữ liệu lên máy chủ.' });
  }
});

// POST /api/upload: Upload image
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'Chưa có tệp ảnh nào được gửi lên.' });
  }
  const relativeUrl = `tai-nguyen/${req.file.filename}`;
  res.json({
    success: true,
    message: 'Tải ảnh lên thành công!',
    url: relativeUrl,
    filename: req.file.filename,
    size: req.file.size
  });
});

// POST /api/auth/login: Simple & secure login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const data = readContent();
  const auth = (data && data.adminAuth) ? data.adminAuth : { username: 'admin', password: '123' };

  if (username === auth.username && password === auth.password) {
    // Generate a simple session token
    const token = 'kitten_admin_' + Buffer.from(`${username}:${Date.now()}`).toString('base64');
    return res.json({
      success: true,
      message: 'Đăng nhập thành công!',
      token,
      user: { username }
    });
  }

  res.status(401).json({ success: false, error: 'Tên đăng nhập hoặc mật khẩu không chính xác.' });
});

// POST /api/auth/change-password: Change admin credentials
app.post('/api/auth/change-password', (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const data = readContent();
  if (!data) return res.status(500).json({ error: 'Lỗi hệ thống.' });

  const auth = data.adminAuth || { username: 'admin', password: '123' };
  if (auth.password !== currentPassword) {
    return res.status(400).json({ error: 'Mật khẩu hiện tại không đúng!' });
  }

  if (!newPassword || newPassword.length < 3) {
    return res.status(400).json({ error: 'Mật khẩu mới phải có ít nhất 3 ký tự.' });
  }

  data.adminAuth.password = newPassword;
  saveContent(data);
  res.json({ success: true, message: 'Đổi mật khẩu thành công!' });
});

// GET /api/backup: Export content.json for 1-click backup
app.get('/api/backup', (req, res) => {
  const data = readContent();
  if (!data) return res.status(500).json({ error: 'Không thể đọc dữ liệu sao lưu.' });
  
  res.setHeader('Content-Disposition', `attachment; filename=kittencake-backup-${new Date().toISOString().slice(0, 10)}.json`);
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(data, null, 2));
});

// POST /api/restore: 1-click restore from uploaded JSON
app.post('/api/restore', (req, res) => {
  const restoredData = req.body;
  if (!restoredData || !restoredData.general || !restoredData.menu) {
    return res.status(400).json({ error: 'Tệp sao lưu không đúng định dạng chuẩn của Kitten Cake CMS.' });
  }

  const saved = saveContent(restoredData);
  if (saved) {
    res.json({ success: true, message: 'Khôi phục toàn bộ dữ liệu thành công!' });
  } else {
    res.status(500).json({ error: 'Không thể khôi phục dữ liệu.' });
  }
});

// ---------------- ORDERS (Đặt bánh nhanh) ----------------
app.post('/api/orders', (req, res) => {
  const { customerName, phone, note, items } = req.body;
  if (!customerName || !phone) {
    return res.status(400).json({ error: 'Vui lòng cung cấp họ tên và số điện thoại.' });
  }

  const data = readContent();
  if (!data.orders) data.orders = [];

  const newOrder = {
    id: 'ord_' + Date.now(),
    customerName,
    phone,
    note: note || '',
    items: items || [],
    status: 'pending', // pending, completed, cancelled
    createdAt: new Date().toISOString()
  };

  data.orders.unshift(newOrder);
  saveContent(data);

  res.json({
    success: true,
    message: 'Đặt bánh thành công! Tiệm sẽ gọi lại cho bạn sớm nhất.',
    orderId: newOrder.id
  });
});

app.get('/api/orders', (req, res) => {
  const data = readContent();
  res.json({ success: true, orders: (data && data.orders) ? data.orders : [] });
});

app.post('/api/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const data = readContent();
  if (!data.orders) data.orders = [];

  const order = data.orders.find(o => o.id === id);
  if (order) {
    order.status = status;
    saveContent(data);
    return res.json({ success: true, message: 'Cập nhật trạng thái đơn hàng thành công!' });
  }
  res.status(404).json({ error: 'Không tìm thấy đơn hàng.' });
});

app.delete('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const data = readContent();
  if (!data.orders) data.orders = [];

  data.orders = data.orders.filter(o => o.id !== id);
  saveContent(data);
  res.json({ success: true, message: 'Đã xóa đơn hàng.' });
});

// Static serving
app.use('/tai-nguyen', express.static(UPLOAD_DIR));
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// Explicitly serve root files so Vercel's NFT (Node File Trace) includes them in the bundle
app.get('/style.css', (req, res) => {
  res.setHeader('Content-Type', 'text/css; charset=UTF-8');
  res.sendFile(path.join(__dirname, 'style.css'));
});

app.get('/app.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
  res.sendFile(path.join(__dirname, 'app.js'));
});

app.get('/index.html', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=UTF-8');
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.use(express.static(__dirname));

// Fallback for root /
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server locally
if (require.main === module) {
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
