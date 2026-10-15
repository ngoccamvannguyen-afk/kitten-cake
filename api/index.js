const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// URL normalization middleware for Vercel Serverless environment
app.use((req, res, next) => {
  if (!req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }
  next();
});

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'content.json');
const BACKUP_FILE = path.join(DATA_DIR, 'content.backup.json');
const UPLOAD_DIR = path.join(__dirname, '..', 'tai-nguyen');

// Ensure directories exist
try {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
} catch (e) {
  // Read-only filesystem in serverless environments like Vercel
}

// Default bundled data fallback for Vercel serverless packaging
let defaultContent = null;
try {
  defaultContent = require('../data/content.json');
} catch (e) {
  console.log('Default content fallback load:', e?.message);
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
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
  limits: { fileSize: 10 * 1024 * 1024 },
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
      try {
        const raw = fs.readFileSync(BACKUP_FILE, 'utf8');
        return JSON.parse(raw);
      } catch (e) {}
    }
  }
  return defaultContent ? JSON.parse(JSON.stringify(defaultContent)) : null;
}

// Helper: Save content safely with backup
function saveContent(data) {
  try {
    if (fs.existsSync(DATA_FILE)) {
      fs.copyFileSync(DATA_FILE, BACKUP_FILE);
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    defaultContent = data;
    return true;
  } catch (err) {
    console.error('Error saving data to disk, persisting in memory:', err);
    defaultContent = data;
    return true;
  }
}

// ---------------- API ROUTES ----------------

// Health check route
app.get('/api', (req, res) => {
  res.json({ success: true, message: 'Kitten Cake API is running on Vercel!' });
});

// GET /api/content
app.get('/api/content', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  const data = readContent();
  if (!data) {
    return res.status(500).json({ error: 'Không thể đọc dữ liệu nội dung.' });
  }
  const { adminAuth, ...publicContent } = data;
  res.json({ success: true, data: publicContent });
});

// POST /api/content
app.post('/api/content', (req, res) => {
  const currentData = readContent() || {};
  const updatedContent = req.body;

  if (!updatedContent || typeof updatedContent !== 'object') {
    return res.status(400).json({ error: 'Dữ liệu không hợp lệ.' });
  }

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

// POST /api/upload
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

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const data = readContent();
  const auth = (data && data.adminAuth) ? data.adminAuth : { username: 'admin', password: '123' };

  if (username === auth.username && password === auth.password) {
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

// POST /api/auth/change-password
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

// GET /api/backup
app.get('/api/backup', (req, res) => {
  const data = readContent();
  if (!data) return res.status(500).json({ error: 'Không thể đọc dữ liệu sao lưu.' });
  
  res.setHeader('Content-Disposition', `attachment; filename=kittencake-backup-${new Date().toISOString().slice(0, 10)}.json`);
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(data, null, 2));
});

// POST /api/restore
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

// ---------------- PRODUCTS ----------------
// GET /api/products/:id
app.get('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const data = readContent();
  if (!data || !data.menu || !data.menu.items) {
    return res.status(500).json({ error: 'Không thể đọc dữ liệu sản phẩm.' });
  }

  const product = data.menu.items.find(i => i.id === id);
  if (!product) {
    return res.status(404).json({ error: 'Không tìm thấy sản phẩm.' });
  }

  // Related products (other active items in menu)
  const related = data.menu.items
    .filter(i => i.id !== id && i.status !== 'inactive')
    .slice(0, 3);

  res.json({
    success: true,
    data: product,
    related,
    paymentConfig: data.paymentConfig,
    shippingConfig: data.shippingConfig
  });
});

// ---------------- VOUCHER CHECK ----------------
// POST /api/voucher/apply
app.post('/api/voucher/apply', (req, res) => {
  const { code, subtotal } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Vui lòng cung cấp mã voucher.' });
  }

  const data = readContent();
  const vouchers = data?.vouchers || [];
  const found = vouchers.find(v => v.code.toUpperCase() === code.trim().toUpperCase());

  if (!found) {
    return res.status(404).json({ success: false, error: 'Mã giảm giá không tồn tại hoặc đã hết hạn.' });
  }

  let discountAmount = 0;
  if (found.discountPercent) {
    discountAmount = Math.round((subtotal * found.discountPercent) / 100);
  } else if (found.discountFixed) {
    discountAmount = found.discountFixed;
  }

  res.json({
    success: true,
    voucher: {
      code: found.code,
      description: found.description,
      discountAmount: Math.min(discountAmount, subtotal)
    }
  });
});

// ---------------- ORDERS (Đặt bánh & Giỏ hàng đa món) ----------------
app.post('/api/orders', (req, res) => {
  const {
    customerName,
    phone,
    address,
    district,
    note,
    paymentMethod,
    items,
    subtotal,
    shippingFee,
    discount,
    comboDiscount,
    comboFreeDescription,
    total,
    voucherCode
  } = req.body;

  if (!customerName || !phone) {
    return res.status(400).json({ error: 'Vui lòng cung cấp họ tên và số điện thoại.' });
  }

  const data = readContent();
  if (!data.orders) data.orders = [];

  const calculatedSubtotal = Number(subtotal) || 0;
  const calculatedShipping = Number(shippingFee) || 0;
  const calculatedDiscount = Number(discount) || 0;
  const calculatedTotal = Number(total) || (calculatedSubtotal + calculatedShipping - calculatedDiscount);

  const newOrder = {
    id: 'ord_' + Date.now(),
    customerName,
    phone,
    address: address || '',
    district: district || 'Quận 7',
    note: note || '',
    paymentMethod: paymentMethod || 'cod',
    items: Array.isArray(items) ? items : [],
    subtotal: calculatedSubtotal,
    shippingFee: calculatedShipping,
    discount: calculatedDiscount,
    comboDiscount: Number(comboDiscount) || 0,
    comboFreeDescription: comboFreeDescription || '',
    total: calculatedTotal,
    voucherCode: voucherCode || '',
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  data.orders.unshift(newOrder);
  saveContent(data);

  res.json({
    success: true,
    message: 'Đặt bánh thành công! Kitten Cake sẽ gọi lại xác nhận ngay.',
    orderId: newOrder.id,
    order: newOrder
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

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && (err.status === 400 || err.statusCode === 400) && 'body' in err) {
    return res.status(400).json({ success: false, error: 'Dữ liệu JSON không hợp lệ.' });
  }
  console.error('API Error:', err);
  res.status(500).json({ success: false, error: 'Đã xảy ra lỗi máy chủ nội bộ.' });
});

module.exports = app;
