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
  const apiEndpoints = [
    '/content', '/orders', '/auth', '/products', '/voucher',
    '/upload', '/backup', '/restore', '/categories', '/articles', '/blog-categories'
  ];
  const isHtmlOrStatic = req.url.includes('.html') || req.url.includes('.js') || req.url.includes('.css');
  if (!isHtmlOrStatic && apiEndpoints.some(ep => req.url === ep || req.url.startsWith(ep + '/') || req.url.startsWith(ep + '?'))) {
    req.url = '/api' + req.url;
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
  // Read-only filesystem in serverless environments
}

// Default bundled data fallback
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

let inMemoryContent = null;

// Helper: Read content safely
function readContent() {
  if (inMemoryContent) {
    return JSON.parse(JSON.stringify(inMemoryContent));
  }
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      inMemoryContent = parsed;
      return parsed;
    }
  } catch (err) {
    console.error('Error reading data file:', err);
    if (fs.existsSync(BACKUP_FILE)) {
      try {
        const raw = fs.readFileSync(BACKUP_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        inMemoryContent = parsed;
        return parsed;
      } catch (e) {}
    }
  }
  if (defaultContent) {
    inMemoryContent = JSON.parse(JSON.stringify(defaultContent));
    return inMemoryContent;
  }
  return null;
}

// Helper: Save content safely with backup
function saveContent(data) {
  data.updatedAt = Date.now();
  inMemoryContent = JSON.parse(JSON.stringify(data));
  try {
    if (fs.existsSync(DATA_FILE)) {
      try { fs.copyFileSync(DATA_FILE, BACKUP_FILE); } catch (e) {}
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.warn('Filesystem read-only (serverless instance), cached in-memory:', err.message);
    return true;
  }
}

// ---------------- API ROUTES ----------------

// Health check route
app.get('/api', (req, res) => {
  res.json({ success: true, message: 'Kitten Cake E-Commerce API is running!' });
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
  res.json({ success: true, data: publicContent, updatedAt: data.updatedAt || Date.now() });
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
    res.json({ success: true, message: 'Lưu thay đổi thành công!', updatedAt: mergedData.updatedAt });
  } else {
    res.status(500).json({ error: 'Không thể lưu dữ liệu.' });
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

// ---------------- CATEGORIES CRUD ----------------
app.get('/api/categories', (req, res) => {
  const data = readContent();
  res.json({ success: true, data: data?.categories || [] });
});

app.post('/api/categories', (req, res) => {
  const data = readContent();
  if (!data) return res.status(500).json({ error: 'Lỗi đọc dữ liệu.' });
  if (!data.categories) data.categories = [];

  const category = req.body;
  if (!category.name) {
    return res.status(400).json({ error: 'Tên danh mục không được để trống.' });
  }

  if (!category.id) {
    category.id = 'cat_' + Date.now();
  }
  if (!category.slug) {
    category.slug = category.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  }

  const index = data.categories.findIndex(c => c.id === category.id);
  if (index >= 0) {
    data.categories[index] = { ...data.categories[index], ...category };
  } else {
    data.categories.push(category);
  }

  saveContent(data);
  res.json({ success: true, message: 'Lưu danh mục thành công!', category });
});

app.delete('/api/categories/:id', (req, res) => {
  const { id } = req.params;
  const data = readContent();
  if (!data || !data.categories) return res.status(404).json({ error: 'Không tìm thấy danh mục.' });

  data.categories = data.categories.filter(c => c.id !== id);
  saveContent(data);
  res.json({ success: true, message: 'Đã xóa danh mục.' });
});

// ---------------- PRODUCTS (CATALOG & DETAIL) ----------------
app.get('/api/products', (req, res) => {
  const data = readContent();
  if (!data || !data.menu || !data.menu.items) {
    return res.status(500).json({ error: 'Không thể đọc dữ liệu sản phẩm.' });
  }

  let items = [...data.menu.items];
  const { category, search, sort, featured } = req.query;

  // Filter by category
  if (category && category !== 'all') {
    items = items.filter(i => i.categoryId === category || i.tag?.includes(category));
  }

  // Filter by search keyword
  if (search) {
    const q = search.toLowerCase().trim();
    items = items.filter(i => 
      i.name.toLowerCase().includes(q) || 
      (i.description && i.description.toLowerCase().includes(q)) ||
      (i.tag && i.tag.toLowerCase().includes(q))
    );
  }

  // Filter by featured
  if (featured === 'true') {
    items = items.filter(i => i.isFeatured);
  }

  // Sort
  if (sort === 'price-asc') {
    items.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-desc') {
    items.sort((a, b) => b.price - a.price);
  } else if (sort === 'name-asc') {
    items.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  } else if (sort === 'rating-desc') {
    items.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  res.json({
    success: true,
    total: items.length,
    data: items,
    categories: data.categories || []
  });
});

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

  // Related products (same category or active items)
  const related = data.menu.items
    .filter(i => i.id !== id && i.status !== 'inactive' && (!product.categoryId || i.categoryId === product.categoryId || true))
    .slice(0, 4);

  res.json({
    success: true,
    data: product,
    related,
    categories: data.categories || [],
    paymentConfig: data.paymentConfig,
    shippingConfig: data.shippingConfig
  });
});

// POST /api/products (Create / Update product)
app.post('/api/products', (req, res) => {
  const data = readContent();
  if (!data) return res.status(500).json({ error: 'Lỗi đọc dữ liệu.' });
  if (!data.menu) data.menu = { items: [] };
  if (!data.menu.items) data.menu.items = [];

  const product = req.body;
  if (!product.name || !product.price) {
    return res.status(400).json({ error: 'Tên bánh và giá bán là bắt buộc.' });
  }

  if (!product.id) {
    product.id = 'menu_' + Date.now();
  }

  const index = data.menu.items.findIndex(i => i.id === product.id);
  if (index >= 0) {
    data.menu.items[index] = { ...data.menu.items[index], ...product };
  } else {
    data.menu.items.push(product);
  }

  saveContent(data);
  res.json({ success: true, message: 'Lưu sản phẩm thành công!', product });
});

// DELETE /api/products/:id
app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const data = readContent();
  if (!data || !data.menu || !data.menu.items) return res.status(404).json({ error: 'Không tìm thấy sản phẩm.' });

  data.menu.items = data.menu.items.filter(i => i.id !== id);
  saveContent(data);
  res.json({ success: true, message: 'Đã xóa món bánh.' });
});

// ---------------- ARTICLES & BLOG CRUD ----------------
app.get('/api/blog-categories', (req, res) => {
  const data = readContent();
  res.json({ success: true, data: data?.blogCategories || [] });
});

app.get('/api/articles', (req, res) => {
  const data = readContent();
  let articles = data?.articles ? [...data.articles] : [];
  const { category, search } = req.query;

  if (category && category !== 'all') {
    articles = articles.filter(a => a.categoryId === category || a.slug === category);
  }

  if (search) {
    const q = search.toLowerCase().trim();
    articles = articles.filter(a => 
      a.title.toLowerCase().includes(q) ||
      (a.excerpt && a.excerpt.toLowerCase().includes(q)) ||
      (a.content && a.content.toLowerCase().includes(q))
    );
  }

  res.json({
    success: true,
    total: articles.length,
    data: articles,
    categories: data?.blogCategories || []
  });
});

app.get('/api/articles/:idOrSlug', (req, res) => {
  const { idOrSlug } = req.params;
  const data = readContent();
  const articles = data?.articles || [];

  const article = articles.find(a => a.id === idOrSlug || a.slug === idOrSlug);
  if (!article) {
    return res.status(404).json({ error: 'Không tìm thấy bài viết.' });
  }

  // Increment views
  article.views = (article.views || 0) + 1;
  saveContent(data);

  // Related articles (same category)
  const related = articles
    .filter(a => a.id !== article.id && (!article.categoryId || a.categoryId === article.categoryId))
    .slice(0, 3);

  // Featured product in article if any
  let featuredProduct = null;
  if (article.featuredProductId && data.menu?.items) {
    featuredProduct = data.menu.items.find(p => p.id === article.featuredProductId) || null;
  }

  res.json({
    success: true,
    data: article,
    related,
    featuredProduct,
    categories: data?.blogCategories || []
  });
});

app.post('/api/articles', (req, res) => {
  const data = readContent();
  if (!data) return res.status(500).json({ error: 'Lỗi đọc dữ liệu.' });
  if (!data.articles) data.articles = [];

  const article = req.body;
  if (!article.title) {
    return res.status(400).json({ error: 'Tiêu đề bài viết không được để trống.' });
  }

  if (!article.id) {
    article.id = 'art_' + Date.now();
  }
  if (!article.slug) {
    article.slug = article.title
      .toLowerCase()
      .replace(/[^a-z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/g, '-')
      .replace(/-+/g, '-');
  }
  if (!article.publishDate) {
    article.publishDate = new Date().toISOString().slice(0, 10);
  }

  const index = data.articles.findIndex(a => a.id === article.id);
  if (index >= 0) {
    data.articles[index] = { ...data.articles[index], ...article };
  } else {
    data.articles.unshift(article);
  }

  saveContent(data);
  res.json({ success: true, message: 'Lưu bài viết thành công!', article });
});

app.delete('/api/articles/:id', (req, res) => {
  const { id } = req.params;
  const data = readContent();
  if (!data || !data.articles) return res.status(404).json({ error: 'Không tìm thấy bài viết.' });

  data.articles = data.articles.filter(a => a.id !== id);
  saveContent(data);
  res.json({ success: true, message: 'Đã xóa bài viết.' });
});

// ---------------- VOUCHER CHECK ----------------
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

  // Generate short readable order ID like KC-72819
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const orderId = `KC-${randomSuffix}`;

  const newOrder = {
    id: orderId,
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
    status: 'pending', // pending -> baking -> delivering -> completed -> cancelled
    createdAt: new Date().toISOString()
  };

  data.orders.unshift(newOrder);
  saveContent(data);

  // VietQR Dynamic image url for bank transfer
  const vietQrUrl = `https://img.vietqr.io/image/VPB-1821004654-compact2.png?amount=${calculatedTotal}&addInfo=${encodeURIComponent(orderId)}&accountName=${encodeURIComponent("NGUYEN NGOC CAM VAN")}`;

  res.json({
    success: true,
    message: 'Đặt bánh thành công! Kitten Cake sẽ gọi lại xác nhận ngay.',
    orderId: newOrder.id,
    order: newOrder,
    vietQrUrl
  });
});

// GET /api/orders (Admin listing)
app.get('/api/orders', (req, res) => {
  const data = readContent();
  res.json({ success: true, orders: (data && data.orders) ? data.orders : [] });
});

// GET /api/orders/track (Customer tracking by phone or order ID)
app.get('/api/orders/track', (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ error: 'Vui lòng cung cấp số điện thoại hoặc mã đơn hàng.' });
  }

  const cleanQuery = query.trim().toUpperCase();
  const cleanPhone = query.trim().replace(/[^0-9]/g, '');

  const data = readContent();
  const allOrders = data?.orders || [];

  const matched = allOrders.filter(o => {
    const oId = (o.id || '').toUpperCase();
    const oPhone = (o.phone || '').replace(/[^0-9]/g, '');
    return oId === cleanQuery || (cleanPhone.length >= 7 && oPhone.includes(cleanPhone));
  });

  res.json({
    success: true,
    query,
    count: matched.length,
    orders: matched
  });
});

// GET /api/orders/:id
app.get('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const data = readContent();
  const order = data?.orders?.find(o => o.id === id);
  if (!order) {
    return res.status(404).json({ error: 'Không tìm thấy đơn hàng.' });
  }
  res.json({ success: true, order });
});

// POST /api/orders/:id/status
app.post('/api/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const data = readContent();
  if (!data.orders) data.orders = [];

  const order = data.orders.find(o => o.id === id);
  if (order) {
    order.status = status;
    saveContent(data);
    return res.json({ success: true, message: 'Cập nhật trạng thái đơn hàng thành công!', order });
  }
  res.status(404).json({ error: 'Không tìm thấy đơn hàng.' });
});

// DELETE /api/orders/:id
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
