// Kitten Cake CMS - Client-Side Controller
let siteData = null;
let currentEditingMenuItemId = null;
let pendingUploadedImages = {};

// Helper: Format Vietnamese Currency
function formatCurrency(amount) {
    if (isNaN(amount)) return '0 đ';
    return Number(amount).toLocaleString('vi-VN') + ' đ';
}

// Helper: Toast Notifications
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle';
    toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 4000);
}

// Helper: Normalize asset URL
function toAppUrl(url) {
    if (!url) return '/tai-nguyen/donut-signature.jpg';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
    let clean = url;
    if (clean.startsWith('../')) clean = clean.substring(3);
    if (!clean.startsWith('/')) clean = '/' + clean;
    return clean;
}

// Modal helper
window.openModal = function(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
};
window.closeModal = function(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
};

// Check Authentication
function checkAuth() {
    const token = localStorage.getItem('kitten_admin_token');
    if (!token && !window.location.href.includes('login.html')) {
        window.location.href = '/admin/login.html';
    }
}

// Logout
document.getElementById('btnLogout').addEventListener('click', () => {
    if (confirm('Bạn có chắc chắn muốn đăng xuất khỏi trang quản trị?')) {
        localStorage.removeItem('kitten_admin_token');
        localStorage.removeItem('kitten_admin_user');
        window.location.href = '/admin/login.html';
    }
});

// Mobile menu toggle
const mobileToggle = document.getElementById('mobileToggle');
const sidebar = document.getElementById('sidebar');
if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });
}

// Tab Navigation
const menuLinks = document.querySelectorAll('.menu-link');
const tabPanes = document.querySelectorAll('.tab-pane');
const pageTitle = document.getElementById('pageTitle');
const pageSubtitle = document.getElementById('pageSubtitle');

const tabTitles = {
    'tab-dashboard': { title: 'Tổng Quan Hệ Thống TMĐT', subtitle: 'Báo cáo doanh thu, đơn hàng và các hoạt động kinh doanh Kitten Cake.' },
    'tab-categories': { title: 'Quản Lý Danh Mục Bánh', subtitle: 'Phân loại các dòng bánh ngọt: Donut, Bánh nướng, Bánh lạnh, Hộp quà tặng.' },
    'tab-menu': { title: 'Quản Lý Thực Đơn & Món Bánh', subtitle: 'Thêm món mới, điều chỉnh giá, chọn danh mục, quản lý tồn kho và hương vị.' },
    'tab-articles': { title: 'Quản Lý Bài Viết & Mẹo Bánh', subtitle: 'Soạn thảo tin tức, câu chuyện tiệm bánh, mẹo thưởng thức và ưu đãi.' },
    'tab-promo': { title: 'Quản Lý Ưu Đãi Donut Box', subtitle: 'Chương trình khuyến mãi combo dành riêng cho học sinh - sinh viên.' },
    'tab-hero': { title: 'Quản Lý Hero & Banner Cover', subtitle: 'Thay đổi tiêu đề lớn, slogan, huy hiệu vương miện và ảnh dải banner.' },
    'tab-gallery': { title: 'Thư Viện Ảnh Bánh Thực Tế', subtitle: 'Cập nhật những mẻ bánh nướng mới ra lò mỗi ngày tại gian bếp Kitten Cake.' },
    'tab-about': { title: 'Về Kitten Cake & Cam Kết', subtitle: 'Câu chuyện thương hiệu tiệm bánh và các điểm cam kết chất lượng.' },
    'tab-orders': { title: 'Quản Lý Đơn Đặt Bánh & In Phiếu Giao', subtitle: 'Tiếp nhận đơn, cập nhật tiến trình làm bánh, giao hàng và in hóa đơn/phiếu đóng hộp.' },
    'tab-settings': { title: 'Cài Đặt Chung & Thanh Toán VietQR', subtitle: 'Hotline, địa chỉ Quận 7, số tài khoản VPBank, mã VietQR và giờ mở cửa.' },
    'tab-backup': { title: 'Sao Lưu & An Toàn Dữ Liệu', subtitle: 'Tải file backup về máy tính hoặc nạp lại dữ liệu ban đầu.' }
};

function switchTab(tabId) {
    menuLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('data-tab') === tabId);
    });
    tabPanes.forEach(pane => {
        pane.classList.toggle('active', pane.id === tabId);
    });

    if (tabTitles[tabId]) {
        pageTitle.textContent = tabTitles[tabId].title;
        pageSubtitle.textContent = tabTitles[tabId].subtitle;
    }

    if (sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

menuLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const tabId = link.getAttribute('data-tab');
        switchTab(tabId);
    });
});

document.querySelectorAll('.quick-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-target');
        switchTab(target);
    });
});

// Helper: Upload file to server
async function uploadFile(file) {
    const formData = new FormData();
    formData.append('image', file);

    try {
        const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        if (res.ok && data.success) {
            return data.url;
        } else {
            throw new Error(data.error || 'Lỗi khi tải ảnh lên');
        }
    } catch (err) {
        console.warn('API upload failed, creating local object URL:', err);
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(file);
        });
    }
}

// Bind Image Upload Handler to Input
function setupImageUpload(inputId, previewId, onUploaded) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    if (!input || !preview) return;

    input.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Instant local preview
        const localUrl = URL.createObjectURL(file);
        preview.src = localUrl;

        showToast('Đang tải ảnh lên...', 'success');
        try {
            const uploadedUrl = await uploadFile(file);
            preview.src = uploadedUrl;
            if (onUploaded) onUploaded(uploadedUrl);
            showToast('Tải ảnh thành công!', 'success');
        } catch (err) {
            showToast('Lỗi tải ảnh: ' + err.message, 'error');
        }
    });
}

async function loadSiteData() {
    let localData = null;
    let localTime = 0;
    try {
        const raw = localStorage.getItem('kitten_site_data');
        if (raw) {
            localData = JSON.parse(raw);
            localTime = Number(localStorage.getItem('kitten_site_data_time')) || Number(localData?.updatedAt) || 0;
        }
    } catch (e) {}

    try {
        const res = await fetch('/api/content?_t=' + Date.now(), { cache: 'no-store' });
        if (res.ok) {
            const json = await res.json();
            const apiData = json.data;
            const apiTime = Number(apiData?.updatedAt || json.updatedAt) || 0;

            if (localData && localTime > apiTime) {
                siteData = localData;
            } else {
                siteData = apiData;
            }
        } else {
            throw new Error('Không thể tải từ API');
        }
    } catch (err) {
        console.warn('Fetch /api/content failed, attempting local data/content.json or localStorage:', err);
        siteData = localData;
        if (!siteData) {
            try {
                const localRes = await fetch('/data/content.json?_t=' + Date.now(), { cache: 'no-store' });
                siteData = await localRes.json();
            } catch (localErr) {
                try {
                    const relativeRes = await fetch('../data/content.json?_t=' + Date.now(), { cache: 'no-store' });
                    siteData = await relativeRes.json();
                } catch (rErr) {
                    console.error('Fatal: Cannot load content data', rErr);
                }
            }
        }
    }

    if (siteData) {
        populateAllForms();
        updateDashboardStats();
    }
}

// ---------------- POPULATE FORMS ----------------
function populateAllForms() {
    if (!siteData) return;

    // Brand info & Logo
    if (siteData.general) {
        const g = siteData.general;
        document.getElementById('sidebarBrandName').textContent = g.brandName || 'Kitten Cake';
        document.getElementById('sidebarLogo').src = toAppUrl(g.logo || 'tai-nguyen/logo.jpg');
        document.getElementById('setBrandName').value = g.brandName || '';
        document.getElementById('setSiteTitle').value = g.siteTitle || '';
        document.getElementById('setBrandTagline').value = g.brandTagline || '';
        document.getElementById('setLogoPreview').src = toAppUrl(g.logo || 'tai-nguyen/logo.jpg');
        document.getElementById('setAddress').value = g.address || '';
        document.getElementById('setHotline').value = g.hotline || '';
        document.getElementById('setEmail').value = g.email || '';
        document.getElementById('setHeaderOrderLink').value = g.orderButtonLink || '';
        document.getElementById('setCopyright').value = g.copyright || '';

        if (g.openingHours) {
            document.getElementById('setWeekdaysHours').value = g.openingHours.weekdays || '';
            document.getElementById('setWeekendsHours').value = g.openingHours.weekends || '';
        }
        if (g.socialLinks) {
            document.getElementById('setFbUrl').value = g.socialLinks.facebook || '';
            document.getElementById('setInstaUrl').value = g.socialLinks.instagram || '';
            document.getElementById('setTiktokUrl').value = g.socialLinks.tiktok || '';
        }
    }

    // Payment & Shipping Config
    if (siteData.paymentConfig) {
        const p = siteData.paymentConfig;
        if (document.getElementById('setBankId')) document.getElementById('setBankId').value = p.bankId || 'VPB';
        if (document.getElementById('setBankAccountNo')) document.getElementById('setBankAccountNo').value = p.accountNumber || '';
        if (document.getElementById('setBankAccountName')) document.getElementById('setBankAccountName').value = p.accountName || '';
        if (document.getElementById('setPaypalUrl')) document.getElementById('setPaypalUrl').value = p.paypalUrl || 'https://www.paypal.com/paypalme/emmeoVN';
    }
    if (siteData.shippingConfig) {
        const s = siteData.shippingConfig;
        if (document.getElementById('setShipDistrict7')) document.getElementById('setShipDistrict7').value = s.district7Fee || 15000;
        if (document.getElementById('setShipOther')) document.getElementById('setShipOther').value = s.otherDistrictFee || 25000;
        if (document.getElementById('setShipFreeMin')) document.getElementById('setShipFreeMin').value = s.freeShippingMin || 120000;
    }

    // Hero Section
    if (siteData.hero) {
        const h = siteData.hero;
        document.getElementById('heroTitlePart1').value = h.titlePart1 || '';
        document.getElementById('heroTitleHighlight').value = h.titleHighlight || '';
        document.getElementById('heroDesc').value = h.description || '';
        document.getElementById('heroBadgeText').value = h.badgeText || '';
        document.getElementById('heroBtn1Text').value = h.btnPrimaryText || '';
        document.getElementById('heroBtn1Link').value = h.btnPrimaryLink || '';
        document.getElementById('heroBtn2Text').value = h.btnOutlineText || '';
        document.getElementById('heroBtn2Link').value = h.btnOutlineLink || '';
        if (h.image) document.getElementById('heroImgPreview').src = toAppUrl(h.image);
    }

    // Brand Strip
    if (siteData.brandStrip) {
        document.getElementById('brandStripEnabled').checked = siteData.brandStrip.enabled !== false;
        if (siteData.brandStrip.image) {
            document.getElementById('coverBannerPreview').src = toAppUrl(siteData.brandStrip.image);
        }
    }

    // Menu Section Titles & Items
    if (siteData.menu) {
        document.getElementById('menuTitlePart1').value = siteData.menu.sectionTitlePart1 || '';
        document.getElementById('menuTitleHighlight').value = siteData.menu.sectionTitleHighlight || '';
        document.getElementById('menuSectionDesc').value = siteData.menu.sectionDescription || '';
        renderMenuItemsTable();
    }

    // Promo Banner
    if (siteData.promoBanner) {
        const p = siteData.promoBanner;
        document.getElementById('promoEnabled').checked = p.enabled !== false;
        document.getElementById('promoTitle').value = p.title || '';
        document.getElementById('promoDesc').value = p.description || '';
        document.getElementById('promoBtnText').value = p.btnText || '';
        document.getElementById('promoBtnLink').value = p.btnLink || '';
        if (p.image) document.getElementById('promoImgPreview').src = toAppUrl(p.image);
    }

    // Gallery
    if (siteData.gallery) {
        document.getElementById('galleryTitlePart1').value = siteData.gallery.sectionTitlePart1 || '';
        document.getElementById('galleryTitleHighlight').value = siteData.gallery.sectionTitleHighlight || '';
        document.getElementById('gallerySectionDesc').value = siteData.gallery.sectionDescription || '';
        renderGalleryGrid();
    }

    // About Us
    if (siteData.about) {
        const a = siteData.about;
        document.getElementById('aboutTitlePart1').value = a.sectionTitlePart1 || '';
        document.getElementById('aboutTitleHighlight').value = a.sectionTitleHighlight || '';
        document.getElementById('aboutP1').value = a.paragraph1 || '';
        document.getElementById('aboutP2').value = a.paragraph2 || '';
        if (a.image) document.getElementById('aboutImgPreview').src = toAppUrl(a.image);
        renderAboutFeatures();
    }

    // Categories & Articles
    renderCategoriesTable();
    renderArticlesTable();
    populateCategoryDropdowns();

    // Orders
    loadOrders();
}

// ---------------- DASHBOARD STATS ----------------
function updateDashboardStats() {
    if (!siteData) return;
    const menuCount = (siteData.menu && siteData.menu.items) ? siteData.menu.items.length : 0;
    const galCount = (siteData.gallery && siteData.gallery.items) ? siteData.gallery.items.length : 0;
    const isPromoOn = siteData.promoBanner && siteData.promoBanner.enabled !== false;

    const menuEl = document.getElementById('statMenuCount');
    if (menuEl) menuEl.textContent = menuCount;
    const galEl = document.getElementById('statGalleryCount');
    if (galEl) galEl.textContent = galCount;
    const promoEl = document.getElementById('statPromoStatus');
    if (promoEl) {
        promoEl.textContent = isPromoOn ? 'Đang bật' : 'Đang tắt';
        promoEl.style.color = isPromoOn ? '#2ed573' : '#a4b0be';
    }
}

// ---------------- MENU MANAGEMENT ----------------
function renderMenuItemsTable() {
    const tbody = document.getElementById('menuItemsTableBody');
    if (!tbody || !siteData || !siteData.menu) return;

    tbody.innerHTML = '';
    const items = siteData.menu.items || [];

    if (items.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:30px; color:#a4b0be;">Chưa có món bánh nào. Hãy bấm "+ Thêm món mới"!</td></tr>`;
        return;
    }

    items.forEach((item, index) => {
        const tr = document.createElement('tr');
        const isActive = item.status !== 'inactive';
        const imgPath = toAppUrl(item.image);

        const itemFlavors = (Array.isArray(item.flavors) ? item.flavors : []).map(f => {
            if (typeof f === 'string') return { name: f, image: item.image || 'tai-nguyen/donut-signature.jpg' };
            return f;
        });

        let flavorsHtml = '';
        if (itemFlavors.length > 0) {
            flavorsHtml = `
                <div class="admin-flavor-chips-wrap" style="margin-top:6px; display:flex; flex-wrap:wrap; gap:4px;">
                    ${itemFlavors.map(f => {
                        const fImg = toAppUrl(f.image || 'tai-nguyen/donut-signature.jpg');
                        return `
                            <span class="admin-flavor-chip" title="${f.name}">
                                <img src="${fImg}" onerror="this.src='../tai-nguyen/donut-signature.jpg'">
                                <span>${f.name}</span>
                            </span>
                        `;
                    }).join('')}
                </div>
            `;
        }

        tr.innerHTML = `
            <td style="font-weight:700; color:#a4b0be;">#${index + 1}</td>
            <td>
                <div class="item-thumb-title">
                    <img src="${imgPath}" alt="${item.name}" class="item-thumb" onerror="this.src='../tai-nguyen/donut-signature.jpg'">
                    <div class="item-title-text">
                        <h4>${item.name}</h4>
                        <span>${item.description ? item.description.slice(0, 45) + '...' : ''}</span>
                        ${(item.stockStatus === 'pre_order' || item.inStock === 'pre_order' || item.isPreOrder) 
                            ? `<span style="display:inline-block; margin-top:3px; background:#fff3e0; color:#e67e22; border:1px solid #ffd8a8; font-size:11px; padding:2px 8px; border-radius:4px; font-weight:700; cursor:pointer;" onclick="quickCycleStockStatus('${item.id}')" title="Bấm để đổi nhanh tình trạng: Còn bánh ➔ Đặt trước ➔ Hết hàng"><i class="fas fa-calendar-alt"></i> Đặt trước (Pre-order)</span>` 
                            : (item.inStock === false 
                                ? `<span style="display:inline-block; margin-top:3px; background:#ffebee; color:#ff4757; font-size:11px; padding:2px 6px; border-radius:4px; font-weight:700; cursor:pointer;" onclick="quickCycleStockStatus('${item.id}')" title="Bấm để đổi nhanh tình trạng: Còn bánh ➔ Đặt trước ➔ Hết hàng"><i class="fas fa-ban"></i> Hết hàng hôm nay</span>` 
                                : `<span style="display:inline-block; margin-top:3px; background:#e8f8f0; color:#2ed573; font-size:11px; padding:2px 6px; border-radius:4px; font-weight:700; cursor:pointer;" onclick="quickCycleStockStatus('${item.id}')" title="Bấm để đổi nhanh tình trạng: Còn bánh ➔ Đặt trước ➔ Hết hàng"><i class="fas fa-check-circle"></i> Sẵn bánh</span>`)}
                        ${flavorsHtml}
                    </div>
                </div>
            </td>
            <td><span style="background:#f1f2f6; padding:4px 10px; border-radius:6px; font-size:12px; font-weight:600;">${item.tag || 'Bánh ngọt'}</span></td>
            <td><span class="price-tag">${formatCurrency(item.price)}</span></td>
            <td>
                ${item.badge ? `<span class="status-badge badge-hot"><i class="fas fa-fire"></i> ${item.badge}</span>` : '<span style="color:#ced6e0;">—</span>'}
            </td>
            <td>
                <label class="switch">
                    <input type="checkbox" ${isActive ? 'checked' : ''} onchange="toggleMenuItemStatus('${item.id}', this.checked)">
                    <span class="slider"></span>
                </label>
            </td>
            <td>
                <div class="action-btns" style="justify-content:flex-end;">
                    <button class="btn-action" title="Di chuyển lên" onclick="moveMenuItem(${index}, -1)" ${index === 0 ? 'disabled style="opacity:0.4;"' : ''}>
                        <i class="fas fa-arrow-up"></i>
                    </button>
                    <button class="btn-action" title="Di chuyển xuống" onclick="moveMenuItem(${index}, 1)" ${index === items.length - 1 ? 'disabled style="opacity:0.4;"' : ''}>
                        <i class="fas fa-arrow-down"></i>
                    </button>
                    <button class="btn-action" title="Chỉnh sửa món & vị bánh" onclick="openEditMenuModal('${item.id}')">
                        <i class="fas fa-pencil-alt"></i>
                    </button>
                    <button class="btn-action delete" title="Xóa món" onclick="deleteMenuItem('${item.id}')">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.toggleMenuItemStatus = async function(id, isChecked) {
    const item = siteData.menu.items.find(i => i.id === id);
    if (item) {
        item.status = isChecked ? 'active' : 'inactive';
        await saveAllChanges(`Đã ${isChecked ? 'bật bán' : 'tạm dừng bán'} món "${item.name}" và đồng bộ ra trang chủ!`);
    }
};

window.quickCycleStockStatus = async function(id) {
    const item = siteData.menu.items.find(i => i.id === id);
    if (!item) return;

    const current = (item.stockStatus === 'pre_order' || item.inStock === 'pre_order' || item.isPreOrder)
        ? 'pre_order'
        : (item.inStock === false || item.stockStatus === 'out_of_stock' ? 'out_of_stock' : 'in_stock');

    let next = 'in_stock';
    let msg = '';
    if (current === 'in_stock') {
        next = 'pre_order';
        msg = `Đã chuyển món "${item.name}" sang: Đặt trước (Pre-order)`;
    } else if (current === 'pre_order') {
        next = 'out_of_stock';
        msg = `Đã chuyển món "${item.name}" sang: Hết bánh hôm nay (Sold Out)`;
    } else {
        next = 'in_stock';
        msg = `Đã chuyển món "${item.name}" sang: Còn bánh (Bán bình thường)`;
    }

    item.stockStatus = next;
    item.inStock = (next !== 'out_of_stock');
    item.isPreOrder = (next === 'pre_order');

    renderMenuItemsTable();
    await saveAllChanges(msg);
};

window.moveMenuItem = async function(index, direction) {
    const items = siteData.menu.items;
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const temp = items[index];
    items[index] = items[targetIndex];
    items[targetIndex] = temp;

    renderMenuItemsTable();
    await saveAllChanges('Đã thay đổi thứ tự món bánh và đồng bộ ra trang chủ!');
};

window.deleteMenuItem = async function(id) {
    const item = siteData.menu.items.find(i => i.id === id);
    if (!item) return;

    if (confirm(`Bạn có chắc muốn xóa món bánh "${item.name}" khỏi thực đơn?`)) {
        siteData.menu.items = siteData.menu.items.filter(i => i.id !== id);
        renderMenuItemsTable();
        updateDashboardStats();
        await saveAllChanges(`Đã xóa món "${item.name}" và đồng bộ ra trang chủ!`);
    }
};

function updateModalPricePreview() {
    const val = parseInt(document.getElementById('modalMenuPrice').value, 10);
    const previewEl = document.getElementById('modalMenuPriceFormatted');
    if (previewEl) {
        if (!isNaN(val) && val >= 0) {
            previewEl.innerHTML = `<i class="fas fa-tag"></i> <span>Xem trước: ${formatCurrency(val)}</span>`;
            previewEl.style.color = '#2ed573';
        } else {
            previewEl.innerHTML = `<i class="fas fa-exclamation-circle"></i> <span>Vui lòng nhập số tiền hợp lệ</span>`;
            previewEl.style.color = '#ff4757';
        }
    }
}
document.getElementById('modalMenuPrice').addEventListener('input', updateModalPricePreview);

// ---------------- FLAVORS & VARIANT IMAGE MANAGER ----------------
function renderModalFlavorRows(flavorsList) {
    const container = document.getElementById('modalFlavorsContainer');
    if (!container) return;
    container.innerHTML = '';

    const list = (Array.isArray(flavorsList) && flavorsList.length > 0)
        ? flavorsList
        : [{ name: 'Vị Chuẩn Signature', image: 'tai-nguyen/donut-signature.jpg' }];

    list.forEach(flavor => {
        const name = typeof flavor === 'string' ? flavor : (flavor.name || '');
        let img = typeof flavor === 'object' && flavor.image ? flavor.image : 'tai-nguyen/donut-signature.jpg';
        addFlavorRow(name, img);
    });
}

function addFlavorRow(name = '', image = 'tai-nguyen/donut-signature.jpg') {
    const container = document.getElementById('modalFlavorsContainer');
    if (!container) return;

    let cleanImg = image;
    if (cleanImg.startsWith('../')) cleanImg = cleanImg.substring(3);

    const row = document.createElement('div');
    row.className = 'flavor-row-item';

    const imgSrc = toAppUrl(cleanImg);

    row.innerHTML = `
        <div class="flavor-row-thumb-wrap">
            <img class="flavor-row-thumb" src="${imgSrc}" alt="${name}" onerror="this.src='../tai-nguyen/donut-signature.jpg'">
            <label class="flavor-thumb-upload-btn" title="Tải ảnh mới từ máy tính cho vị này">
                <i class="fas fa-camera"></i>
                <input type="file" class="flavor-row-file-input" accept="image/*" style="display:none;">
            </label>
        </div>

        <div class="flavor-field-group" style="flex:1.2;">
            <label>Tên hương vị <span style="color:#ff4757;">*</span></label>
            <input type="text" class="form-control flavor-name-input" value="${name}" placeholder="Ví dụ: Vị Choco, Vani, Matcha..." style="padding:6px 10px; font-size:13px;">
        </div>

        <div class="flavor-field-group" style="flex:1.5;">
            <label>Đường dẫn ảnh biểu trưng</label>
            <div style="display:flex; gap:6px;">
                <input type="text" class="form-control flavor-img-input" value="${cleanImg}" placeholder="tai-nguyen/donut-choco.jpg" style="padding:6px 10px; font-size:12px;">
                <label class="btn btn-sm btn-outline" style="padding:6px 10px; font-size:12px; cursor:pointer; white-space:nowrap; border-color:#ffd1d8; color:#ff6b81;" title="Tải ảnh từ máy">
                    <i class="fas fa-upload"></i> Tải ảnh
                    <input type="file" class="flavor-row-file-btn" accept="image/*" style="display:none;">
                </label>
            </div>
        </div>

        <div class="flavor-row-actions">
            <button type="button" class="btn-action delete btn-remove-flavor" title="Xóa vị này">
                <i class="fas fa-trash-alt"></i>
            </button>
        </div>
    `;

    const thumbImg = row.querySelector('.flavor-row-thumb');
    const imgInput = row.querySelector('.flavor-img-input');
    const nameInput = row.querySelector('.flavor-name-input');
    const fileInputs = row.querySelectorAll('.flavor-row-file-input, .flavor-row-file-btn');
    const removeBtn = row.querySelector('.btn-remove-flavor');

    // Sync input typing to thumbnail
    imgInput.addEventListener('input', () => {
        let val = imgInput.value.trim();
        if (val.startsWith('../')) val = val.substring(3);
        thumbImg.src = toAppUrl(val);
    });

    // Handle file upload for this flavor
    fileInputs.forEach(fi => {
        fi.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Instant preview
            thumbImg.src = URL.createObjectURL(file);
            showToast(`Đang tải ảnh biểu trưng cho vị "${nameInput.value || 'mới'}"...`, 'success');

            try {
                const uploadedUrl = await uploadFile(file);
                imgInput.value = uploadedUrl;
                thumbImg.src = toAppUrl(uploadedUrl);
                showToast(`Đã tải ảnh biểu trưng cho vị "${nameInput.value || 'mới'}" thành công!`, 'success');
            } catch (err) {
                showToast('Lỗi tải ảnh vị: ' + err.message, 'error');
            }
        });
    });

    // Delete row
    removeBtn.addEventListener('click', () => {
        const totalRows = container.querySelectorAll('.flavor-row-item').length;
        if (totalRows <= 1) {
            if (!confirm('Đây là hương vị duy nhất của món bánh. Bạn có chắc muốn xóa không?')) return;
        }
        row.remove();
    });

    container.appendChild(row);
}

// Preset 4 donut flavors
window.presetDonutFlavors = function() {
    renderModalFlavorRows([
        { name: 'Vị Choco', image: 'tai-nguyen/donut-choco.jpg' },
        { name: 'Vị Vani', image: 'tai-nguyen/donut-vani.jpg' },
        { name: 'Vị Matcha', image: 'tai-nguyen/donut-matcha.jpg' },
        { name: 'Vị Dâu', image: 'tai-nguyen/donut-dau.jpg' }
    ]);
    showToast('Đã nạp mẫu 4 vị Donut kèm ảnh biểu trưng!', 'success');
};

// Quick select main dish image
window.quickSelectMainImg = function(url) {
    const preview = document.getElementById('modalMenuImgPreview');
    const urlInput = document.getElementById('modalMenuImgUrl');
    if (preview) preview.src = toAppUrl(url);
    if (urlInput) urlInput.value = url;
    showToast('Đã chọn ảnh đại diện: ' + url, 'success');
};

// Add & Edit Menu Modal Logic
document.getElementById('btnOpenAddMenuModal').addEventListener('click', () => {
    currentEditingMenuItemId = null;
    document.getElementById('menuModalTitle').textContent = 'Thêm Món Bánh Mới';
    document.getElementById('modalMenuId').value = '';
    document.getElementById('modalMenuName').value = '';
    document.getElementById('modalMenuTag').value = '🍩 Món Signature';
    document.getElementById('modalMenuPrice').value = '10000';
    updateModalPricePreview();
    document.getElementById('modalMenuBadge').value = '';
    document.getElementById('modalMenuFeatured').value = 'false';
    document.getElementById('modalMenuInStock').value = 'in_stock';
    document.getElementById('modalMenuShelfLife').value = 'Dùng ngon nhất trong ngày, ngăn mát 2-3 ngày';
    document.getElementById('modalMenuIngredients').value = 'Bột mì Nhật cao cấp, Bơ Anchor, Trứng tươi, Socola Bỉ';
    document.getElementById('modalMenuDesc').value = '';
    
    const defaultImg = 'tai-nguyen/donut-signature.jpg';
    document.getElementById('modalMenuImgPreview').src = toAppUrl(defaultImg);
    const urlInput = document.getElementById('modalMenuImgUrl');
    if (urlInput) urlInput.value = defaultImg;
    document.getElementById('modalMenuOrderLink').value = siteData.general?.socialLinks?.facebook || '';

    // Render default 4 flavors
    presetDonutFlavors();

    openModal('menuModal');
});

window.openEditMenuModal = function(id) {
    const item = siteData.menu.items.find(i => i.id === id);
    if (!item) return;

    currentEditingMenuItemId = id;
    document.getElementById('menuModalTitle').textContent = 'Chỉnh Sửa Món Bánh';
    document.getElementById('modalMenuId').value = item.id;
    document.getElementById('modalMenuName').value = item.name;
    const catSelect = document.getElementById('modalMenuCategory');
    if (catSelect) catSelect.value = item.categoryId || (siteData.categories?.[0]?.id || 'cat_donut');
    const origPriceInput = document.getElementById('modalMenuOriginalPrice');
    if (origPriceInput) origPriceInput.value = item.originalPrice || '';
    document.getElementById('modalMenuTag').value = item.tag || '🍩 Món Signature';
    document.getElementById('modalMenuPrice').value = item.price;
    updateModalPricePreview();
    document.getElementById('modalMenuBadge').value = item.badge || '';
    if (item.stockStatus === 'pre_order' || item.inStock === 'pre_order' || item.isPreOrder) {
        document.getElementById('modalMenuInStock').value = 'pre_order';
    } else if (item.inStock === false || item.stockStatus === 'out_of_stock') {
        document.getElementById('modalMenuInStock').value = 'out_of_stock';
    } else {
        document.getElementById('modalMenuInStock').value = 'in_stock';
    }
    document.getElementById('modalMenuShelfLife').value = item.details?.shelfLife || '';
    document.getElementById('modalMenuIngredients').value = item.details?.ingredients || '';

    document.getElementById('modalMenuDesc').value = item.description || '';
    document.getElementById('modalMenuOrderLink').value = item.orderLink || '';

    const imgPath = toAppUrl(item.image);
    document.getElementById('modalMenuImgPreview').src = imgPath;
    const urlInput = document.getElementById('modalMenuImgUrl');
    if (urlInput) urlInput.value = item.image;

    // Render flavors with their respective images
    let itemFlavors = item.flavors || [];
    if (!Array.isArray(itemFlavors) || itemFlavors.length === 0) {
        itemFlavors = [{ name: 'Vị Chuẩn Signature', image: item.image || 'tai-nguyen/donut-signature.jpg' }];
    } else {
        itemFlavors = itemFlavors.map(f => {
            if (typeof f === 'string') {
                const fLower = f.toLowerCase();
                let fImg = item.image || 'tai-nguyen/donut-signature.jpg';
                if (fLower.includes('choco')) fImg = 'tai-nguyen/donut-choco.jpg';
                else if (fLower.includes('vani') || fLower.includes('trắng')) fImg = 'tai-nguyen/donut-vani.jpg';
                else if (fLower.includes('matcha')) fImg = 'tai-nguyen/donut-matcha.jpg';
                else if (fLower.includes('dâu')) fImg = 'tai-nguyen/donut-dau.jpg';
                return { name: f, image: fImg };
            }
            return f;
        });
    }
    renderModalFlavorRows(itemFlavors);

    openModal('menuModal');
};

// Wire up Buttons for Flavors Manager
const btnAddFlavor = document.getElementById('btnAddFlavorRow');
if (btnAddFlavor) {
    btnAddFlavor.addEventListener('click', () => {
        let currentDishImg = 'tai-nguyen/donut-signature.jpg';
        const urlInput = document.getElementById('modalMenuImgUrl');
        if (urlInput && urlInput.value.trim()) currentDishImg = urlInput.value.trim();
        addFlavorRow('', currentDishImg);
    });
}

const btnPresetFlavors = document.getElementById('btnQuickPresetFlavors');
if (btnPresetFlavors) {
    btnPresetFlavors.addEventListener('click', presetDonutFlavors);
}

// Sync modalMenuImgUrl typing to main preview
const modalImgUrlInput = document.getElementById('modalMenuImgUrl');
if (modalImgUrlInput) {
    modalImgUrlInput.addEventListener('input', () => {
        let val = modalImgUrlInput.value.trim();
        if (val.startsWith('../')) val = val.substring(3);
        const preview = document.getElementById('modalMenuImgPreview');
        if (preview) {
            preview.src = val.startsWith('http') || val.startsWith('data:') ? val : `../${val}`;
        }
    });
}

document.getElementById('btnSaveMenuItem').addEventListener('click', async () => {
    const name = document.getElementById('modalMenuName').value.trim();
    const categoryId = document.getElementById('modalMenuCategory') ? document.getElementById('modalMenuCategory').value : 'cat_donut';
    const originalPrice = document.getElementById('modalMenuOriginalPrice') ? (Number(document.getElementById('modalMenuOriginalPrice').value) || 0) : 0;
    const price = parseInt(document.getElementById('modalMenuPrice').value, 10);
    const tag = document.getElementById('modalMenuTag').value;
    const badge = document.getElementById('modalMenuBadge').value.trim();
    const isFeatured = document.getElementById('modalMenuFeatured').value === 'true';
    const description = document.getElementById('modalMenuDesc').value.trim();
    const orderLink = document.getElementById('modalMenuOrderLink').value.trim();
    const stockStatusVal = document.getElementById('modalMenuInStock').value;
    const inStock = stockStatusVal !== 'out_of_stock';
    const stockStatus = stockStatusVal;
    const isPreOrder = stockStatusVal === 'pre_order';
    const shelfLife = document.getElementById('modalMenuShelfLife').value.trim();
    const ingredients = document.getElementById('modalMenuIngredients').value.trim();

    // Get Main Image URL
    let imageSrc = '';
    const imgUrlField = document.getElementById('modalMenuImgUrl');
    if (imgUrlField && imgUrlField.value.trim()) {
        imageSrc = imgUrlField.value.trim();
    } else {
        imageSrc = document.getElementById('modalMenuImgPreview').getAttribute('src');
    }
    if (imageSrc.startsWith('../')) imageSrc = imageSrc.substring(3);

    // Collect Flavors & Variant Images
    const flavorRows = document.querySelectorAll('#modalFlavorsContainer .flavor-row-item');
    const flavors = [];
    flavorRows.forEach(r => {
        const fNameInput = r.querySelector('.flavor-name-input');
        const fImgInput = r.querySelector('.flavor-img-input');
        const fName = fNameInput ? fNameInput.value.trim() : '';
        let fImg = fImgInput ? fImgInput.value.trim() : '';
        if (fImg.startsWith('../')) fImg = fImg.substring(3);
        if (!fImg) fImg = imageSrc || 'tai-nguyen/donut-signature.jpg';
        if (fName) {
            flavors.push({ name: fName, image: fImg });
        }
    });

    if (flavors.length === 0) {
        flavors.push({ name: 'Vị Chuẩn Signature', image: imageSrc || 'tai-nguyen/donut-signature.jpg' });
    }

    if (!name) {
        alert('Vui lòng nhập tên món bánh!');
        return;
    }
    if (isNaN(price) || price < 0) {
        alert('Vui lòng nhập giá bán hợp lệ!');
        return;
    }

    let actionMsg = '';
    if (currentEditingMenuItemId) {
        // Edit existing
        const item = siteData.menu.items.find(i => i.id === currentEditingMenuItemId);
        if (item) {
            item.name = name;
            item.categoryId = categoryId;
            item.originalPrice = originalPrice;
            item.price = price;
            item.tag = tag;
            item.badge = badge;
            item.isFeatured = isFeatured;
            item.description = description;
            item.orderLink = orderLink;
            item.image = imageSrc;
            item.inStock = inStock;
            item.stockStatus = stockStatus;
            item.isPreOrder = isPreOrder;
            item.flavors = flavors;
            if (!item.details) item.details = {};
            item.details.shelfLife = shelfLife;
            item.details.ingredients = ingredients;
            actionMsg = `🎉 Đã cập nhật món "${name}" và đồng bộ ra trang chủ!`;
        }
    } else {
        // Add new
        const newItem = {
            id: 'menu_' + Date.now(),
            name,
            categoryId,
            originalPrice,
            tag,
            price,
            isFeatured,
            badge,
            description,
            image: imageSrc || 'tai-nguyen/donut-signature.jpg',
            orderLink: orderLink || (siteData.general?.socialLinks?.facebook || '#'),
            status: 'active',
            inStock,
            stockStatus,
            isPreOrder,
            flavors,
            details: {
                shelfLife,
                ingredients
            }
        };
        siteData.menu.items.push(newItem);
        actionMsg = `🎉 Đã thêm món mới "${name}" và đồng bộ ra trang chủ!`;
    }

    closeModal('menuModal');
    renderMenuItemsTable();
    updateDashboardStats();

    // Tự động lưu ngay lập tức lên server và cập nhật file dữ liệu
    await saveAllChanges(actionMsg);
});

// Setup image upload for Menu Modal
setupImageUpload('modalMenuImgInput', 'modalMenuImgPreview', (uploadedUrl) => {
    const urlInput = document.getElementById('modalMenuImgUrl');
    if (urlInput) urlInput.value = uploadedUrl;
});

// ---------------- GALLERY MANAGEMENT ----------------
function renderGalleryGrid() {
    const container = document.getElementById('galleryGridContainer');
    if (!container || !siteData || !siteData.gallery) return;

    container.innerHTML = '';
    const items = siteData.gallery.items || [];

    if (items.length === 0) {
        container.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:30px; color:#a4b0be;">Chưa có ảnh nào trong thư viện. Bấm "+ Thêm ảnh mới" để đăng ảnh!</div>`;
        return;
    }

    items.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'gallery-card';
        const imgPath = toAppUrl(item.image);

        card.innerHTML = `
            <img src="${imgPath}" alt="${item.overlay || 'Bánh Kitten Cake'}" onerror="this.src='../tai-nguyen/donut-varieties.jpg'">
            <button class="gallery-delete-btn" title="Xóa ảnh" onclick="deleteGalleryItem('${item.id}')">
                <i class="fas fa-trash-alt"></i>
            </button>
            <div class="gallery-card-info">
                <input type="text" value="${item.overlay || ''}" placeholder="Dòng chữ chú thích..." onchange="updateGalleryOverlay('${item.id}', this.value)">
            </div>
        `;
        container.appendChild(card);
    });
}

window.updateGalleryOverlay = function(id, newOverlay) {
    const item = siteData.gallery.items.find(i => i.id === id);
    if (item) {
        item.overlay = newOverlay;
        showToast('Đã lưu chú thích ảnh!');
    }
};

window.deleteGalleryItem = async function(id) {
    if (confirm('Bạn có chắc muốn xóa ảnh này khỏi thư viện?')) {
        siteData.gallery.items = siteData.gallery.items.filter(i => i.id !== id);
        renderGalleryGrid();
        updateDashboardStats();
        await saveAllChanges('Đã xóa ảnh thư viện và đồng bộ ra trang chủ!');
    }
};

document.getElementById('btnOpenAddGalleryModal').addEventListener('click', () => {
    document.getElementById('modalGalleryCaption').value = '';
    document.getElementById('modalGalleryImgPreview').src = toAppUrl('tai-nguyen/donut-varieties.jpg');
    openModal('galleryModal');
});

document.getElementById('btnSaveGalleryItem').addEventListener('click', async () => {
    const caption = document.getElementById('modalGalleryCaption').value.trim();
    let imageSrc = document.getElementById('modalGalleryImgPreview').getAttribute('src');
    if (imageSrc.startsWith('../')) imageSrc = imageSrc.substring(3);

    const newItem = {
        id: 'gal_' + Date.now(),
        image: imageSrc || 'tai-nguyen/donut-varieties.jpg',
        overlay: caption || 'Bánh mới ra lò mỗi ngày'
    };

    if (!siteData.gallery.items) siteData.gallery.items = [];
    siteData.gallery.items.push(newItem);

    closeModal('galleryModal');
    renderGalleryGrid();
    updateDashboardStats();
    await saveAllChanges('Đã thêm ảnh mới vào thư viện và đồng bộ ra trang chủ!');
});

setupImageUpload('modalGalleryImgInput', 'modalGalleryImgPreview');

// ---------------- ABOUT US FEATURES CHECKLIST ----------------
function renderAboutFeatures() {
    const container = document.getElementById('aboutFeaturesList');
    if (!container || !siteData || !siteData.about) return;

    container.innerHTML = '';
    const features = siteData.about.features || [];

    features.forEach((feat, index) => {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.gap = '10px';
        row.style.alignItems = 'center';

        row.innerHTML = `
            <i class="fas fa-check-circle" style="color:#2ed573; font-size:18px;"></i>
            <input type="text" class="form-control" value="${feat}" onchange="updateAboutFeature(${index}, this.value)" style="flex:1;">
            <button class="btn-action delete" title="Xóa dòng này" onclick="deleteAboutFeature(${index})">
                <i class="fas fa-times"></i>
            </button>
        `;
        container.appendChild(row);
    });
}

window.updateAboutFeature = async function(index, value) {
    if (siteData.about.features && siteData.about.features[index] !== undefined) {
        siteData.about.features[index] = value;
        await saveAllChanges('Đã lưu cam kết và đồng bộ ra trang chủ!');
    }
};

window.deleteAboutFeature = async function(index) {
    if (siteData.about.features) {
        siteData.about.features.splice(index, 1);
        renderAboutFeatures();
        await saveAllChanges('Đã xóa cam kết và đồng bộ ra trang chủ!');
    }
};

document.getElementById('btnAddFeatureBtn').addEventListener('click', async () => {
    if (!siteData.about.features) siteData.about.features = [];
    siteData.about.features.push('Cam kết chất lượng mới');
    renderAboutFeatures();
    await saveAllChanges('Đã thêm cam kết mới và đồng bộ ra trang chủ!');
});

// Setup other image uploaders
setupImageUpload('promoImgInput', 'promoImgPreview', (url) => {
    if (siteData.promoBanner) siteData.promoBanner.image = url;
});
setupImageUpload('heroImgInput', 'heroImgPreview', (url) => {
    if (siteData.hero) siteData.hero.image = url;
});
setupImageUpload('coverBannerInput', 'coverBannerPreview', (url) => {
    if (siteData.brandStrip) siteData.brandStrip.image = url;
});
setupImageUpload('aboutImgInput', 'aboutImgPreview', (url) => {
    if (siteData.about) siteData.about.image = url;
});
setupImageUpload('setLogoInput', 'setLogoPreview', (url) => {
    if (siteData.general) siteData.general.logo = url;
    document.getElementById('sidebarLogo').src = toAppUrl(url);
});

// ---------------- ORDERS (ĐẶT BÁNH & GIỎ HÀNG ĐA MÓN) ----------------
let currentOrdersList = [];
let currentViewingOrderId = null;

async function loadOrders() {
    try {
        const res = await fetch('/api/orders?_t=' + Date.now());
        const json = await res.json();
        const orders = json.orders || [];
        currentOrdersList = orders;

        const badge = document.getElementById('orderBadge');
        const statOrdersCount = document.getElementById('statOrdersCount');
        const pendingCount = orders.filter(o => o.status === 'pending').length;

        if (pendingCount > 0) {
            badge.style.display = 'inline-block';
            badge.textContent = pendingCount;
        } else {
            badge.style.display = 'none';
        }
        statOrdersCount.textContent = orders.length;

        const tbody = document.getElementById('ordersTableBody');
        tbody.innerHTML = '';

        if (orders.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:30px; color:#a4b0be;">Chưa có đơn đặt bánh nào phát sinh.</td></tr>`;
            return;
        }

        orders.forEach(order => {
            const tr = document.createElement('tr');
            const dateStr = new Date(order.createdAt).toLocaleString('vi-VN');
            const statusMap = {
                'pending': '<span class="status-badge badge-hot"><i class="fas fa-clock"></i> Chờ xác nhận</span>',
                'preparing': '<span class="status-badge" style="background:#e8f4fd; color:#0984e3;"><i class="fas fa-cookie-bite"></i> Đang nướng bánh</span>',
                'delivering': '<span class="status-badge" style="background:#f3e8fd; color:#6c5ce7;"><i class="fas fa-motorcycle"></i> Đang giao</span>',
                'completed': '<span class="status-badge badge-active"><i class="fas fa-check-circle"></i> Đã hoàn thành</span>',
                'cancelled': '<span class="status-badge badge-inactive"><i class="fas fa-times"></i> Đã hủy</span>'
            };

            // Tóm tắt danh sách bánh
            let itemsSummaryHtml = '';
            if (Array.isArray(order.items) && order.items.length > 0) {
                itemsSummaryHtml = order.items.map(i => `
                    <div style="font-size:12px; margin-bottom:3px;">
                        <strong>${i.quantity}x</strong> ${i.name}
                        ${i.flavor ? `<span style="color:#ff6b81; font-weight:600;">(${i.flavor})</span>` : ''}
                        ${Array.isArray(i.toppings) && i.toppings.length > 0 ? `<div style="font-size:11px; color:#e17055; margin-left:14px;"><i class="fas fa-sparkles"></i> Topping: ${i.toppings.join(', ')}</div>` : ''}
                    </div>
                `).join('');
            } else {
                itemsSummaryHtml = `<span style="font-size:12px; color:#747d8c;">${order.note || 'Đặt bánh qua web'}</span>`;
            }

            let paymentBadge = '<span class="status-badge" style="background:#f1f2f6; color:#57606f; font-size:11px;"><i class="fas fa-money-bill-wave"></i> COD</span>';
            if (order.paymentMethod === 'banking') {
                paymentBadge = '<span class="status-badge" style="background:#e8f8f0; color:#2ed573; font-size:11px;"><i class="fas fa-qrcode"></i> VietQR</span>';
            } else if (order.paymentMethod === 'paypal') {
                paymentBadge = '<span class="status-badge" style="background:#e6f3ff; color:#0079C1; font-weight:700; font-size:11px;"><i class="fab fa-paypal"></i> PayPal</span>';
            }

            const addressDisplay = order.address
                ? `<div style="font-size:12px;">${order.address}</div><small style="color:#ff6b81; font-weight:600;">${order.district || 'Q.7'}</small>`
                : `<span style="color:#a4b0be;">${order.district || 'Quận 7'}</span>`;

            tr.innerHTML = `
                <td style="font-size:12px; color:#747d8c; white-space:nowrap;">
                    <strong>#${order.id.slice(-6)}</strong><br>
                    <span>${dateStr}</span>
                </td>
                <td>
                    <strong>${order.customerName}</strong><br>
                    <a href="tel:${order.phone}" style="color:#ff6b81; font-size:12px; font-weight:700; text-decoration:none;">
                        <i class="fas fa-phone-alt"></i> ${order.phone}
                    </a>
                </td>
                <td>${addressDisplay}</td>
                <td>${itemsSummaryHtml}</td>
                <td style="font-weight:700; color:#ff4757; white-space:nowrap;">
                    ${formatCurrency(order.total || order.subtotal || 10000)}
                    ${(order.discount && order.discount > 0) ? `<div style="font-size:11px; color:#2ed573; font-weight:600;"><i class="fas fa-gift"></i> -${formatCurrency(order.discount)}</div>` : ''}
                </td>
                <td>${paymentBadge}</td>
                <td>${statusMap[order.status] || order.status}</td>
                <td style="text-align:right; white-space:nowrap;">
                    <button class="btn-action" title="Xem chi tiết & In phiếu đóng hộp" onclick="openOrderDetailModal('${order.id}')" style="background:#e8f4fd; color:#0984e3;">
                        <i class="fas fa-file-invoice"></i>
                    </button>
                    <button class="btn-action delete" title="Xóa đơn" onclick="deleteOrder('${order.id}')">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.warn('Cannot fetch orders:', err);
    }
}

window.openOrderDetailModal = function(orderId) {
    const order = currentOrdersList.find(o => o.id === orderId);
    if (!order) return;

    currentViewingOrderId = orderId;

    document.getElementById('slipOrderCode').textContent = `PHIẾU ĐÓNG HỘP BÁNH - #${order.id}`;
    document.getElementById('slipCustName').textContent = order.customerName;
    document.getElementById('slipCustPhone').textContent = order.phone;
    document.getElementById('slipCustAddress').textContent = `${order.address || ''} (${order.district || 'Quận 7'})`;
    document.getElementById('slipOrderTime').textContent = new Date(order.createdAt).toLocaleString('vi-VN');
    let methodLabel = 'Tiền mặt COD';
    if (order.paymentMethod === 'banking') methodLabel = 'Chuyển khoản VietQR';
    else if (order.paymentMethod === 'paypal') methodLabel = 'PayPal (emmeoVN)';
    document.getElementById('slipPaymentMethod').textContent = methodLabel;
    document.getElementById('slipOrderNote').textContent = order.note || 'Không có ghi chú thêm.';

    // Render danh sách bánh
    const itemsTbody = document.getElementById('slipItemsTableBody');
    itemsTbody.innerHTML = '';
    const items = order.items || [];

    if (items.length === 0) {
        itemsTbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">1 phần bánh theo ghi chú</td></tr>`;
    } else {
        items.forEach(item => {
            const lineTotal = Number(item.price) * Number(item.quantity);
            const toppingsHtml = (Array.isArray(item.toppings) && item.toppings.length > 0)
                ? `<div style="font-size:11px; color:#e17055; margin-top:3px;"><i class="fas fa-sparkles"></i> Topping: <strong>${item.toppings.join(', ')}</strong></div>`
                : '';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <strong>${item.name}</strong>
                    ${toppingsHtml}
                </td>
                <td><span style="color:#ff6b81; font-weight:600;">${item.flavor || 'Vị chuẩn'}</span></td>
                <td style="text-align:center;"><strong>${item.quantity}</strong></td>
                <td style="text-align:right;">${formatCurrency(item.price)}</td>
                <td style="text-align:right; font-weight:700;">${formatCurrency(lineTotal)}</td>
            `;
            itemsTbody.appendChild(tr);
        });
    }

    document.getElementById('slipSubtotal').textContent = formatCurrency(order.subtotal || order.total || 0);
    document.getElementById('slipShipping').textContent = formatCurrency(order.shippingFee || 0);
    
    const discountEl = document.getElementById('slipDiscount');
    if (order.discount && order.discount > 0) {
        let desc = '';
        if (order.comboFreeDescription) {
            desc = `<br><small style="color:#2ed573; font-weight:600;"><i class="fas fa-gift"></i> ${order.comboFreeDescription}</small>`;
        }
        discountEl.innerHTML = `-${formatCurrency(order.discount)}${desc}`;
    } else {
        discountEl.textContent = '0đ';
    }

    document.getElementById('slipTotal').textContent = formatCurrency(order.total || 0);

    // Trạng thái đơn
    document.getElementById('modalOrderStatusSelect').value = order.status || 'pending';

    openModal('orderDetailModal');
};

const btnUpdateOrder = document.getElementById('btnUpdateOrderStatus');
if (btnUpdateOrder) {
    btnUpdateOrder.addEventListener('click', async () => {
        if (!currentViewingOrderId) return;
        const newStatus = document.getElementById('modalOrderStatusSelect').value;
        await updateOrderStatus(currentViewingOrderId, newStatus);
        closeModal('orderDetailModal');
    });
}

const btnPrintSlip = document.getElementById('btnPrintPackingSlip');
if (btnPrintSlip) {
    btnPrintSlip.addEventListener('click', () => {
        const printContents = document.getElementById('orderModalPrintArea').innerHTML;
        const printWindow = window.open('', '_blank', 'width=650,height=750');
        printWindow.document.write(`
            <html>
                <head>
                    <title>In Phiếu Đóng Hộp - Kitten Cake</title>
                    <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;600;700&display=swap" rel="stylesheet">
                    <style>
                        body { font-family: 'Quicksand', sans-serif; padding: 24px; color: #333; line-height: 1.5; }
                        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
                        th, td { border: 1px solid #ddd; padding: 8px 10px; font-size: 13px; }
                        th { background: #f8f9fa; }
                        .badge { font-weight: 700; color: #ff4757; }
                        @media print {
                            body { padding: 0; }
                        }
                    </style>
                </head>
                <body>
                    ${printContents}
                    <div style="margin-top:24px; text-align:center; font-size:12px; color:#888;">
                        Cảm ơn quý khách đã tin chọn Kitten Cake Quận 7! ❤️
                    </div>
                    <script>
                        window.onload = function() { window.print(); window.close(); }
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    });
}

window.updateOrderStatus = async function(id, status) {
    try {
        await fetch(`/api/orders/${id}/status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        showToast('Cập nhật trạng thái đơn thành công!');
        loadOrders();
    } catch (err) {
        showToast('Lỗi khi đổi trạng thái đơn', 'error');
    }
};

window.deleteOrder = async function(id) {
    if (confirm('Bạn có chắc muốn xóa đơn này?')) {
        try {
            await fetch(`/api/orders/${id}`, { method: 'DELETE' });
            showToast('Đã xóa đơn hàng!');
            loadOrders();
        } catch (err) {
            showToast('Lỗi khi xóa đơn', 'error');
        }
    }
};

document.getElementById('btnRefreshOrders').addEventListener('click', () => {
    loadOrders();
    showToast('Đã làm mới danh sách đơn hàng!');
});

// ---------------- SAVE ALL CHANGES ----------------
async function saveAllChanges(customMessage = '') {
    if (!siteData) return;
    const btn = document.getElementById('btnSaveAll');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...';
    }

    const getVal = (id) => document.getElementById(id) ? document.getElementById(id).value.trim() : null;
    const getChecked = (id) => document.getElementById(id) ? document.getElementById(id).checked : null;

    // Collect General Settings
    if (siteData.general) {
        const bn = getVal('setBrandName'); if (bn !== null) siteData.general.brandName = bn;
        const st = getVal('setSiteTitle'); if (st !== null) siteData.general.siteTitle = st;
        const bt = getVal('setBrandTagline'); if (bt !== null) siteData.general.brandTagline = bt;
        const ad = getVal('setAddress'); if (ad !== null) siteData.general.address = ad;
        const hl = getVal('setHotline'); if (hl !== null) siteData.general.hotline = hl;
        const em = getVal('setEmail'); if (em !== null) siteData.general.email = em;
        const ol = getVal('setHeaderOrderLink'); if (ol !== null) siteData.general.orderButtonLink = ol;
        const cr = getVal('setCopyright'); if (cr !== null) siteData.general.copyright = cr;
        if (!siteData.general.openingHours) siteData.general.openingHours = {};
        const wd = getVal('setWeekdaysHours'); if (wd !== null) siteData.general.openingHours.weekdays = wd;
        const we = getVal('setWeekendsHours'); if (we !== null) siteData.general.openingHours.weekends = we;
        if (!siteData.general.socialLinks) siteData.general.socialLinks = {};
        const fb = getVal('setFbUrl'); if (fb !== null) siteData.general.socialLinks.facebook = fb;
        const ig = getVal('setInstaUrl'); if (ig !== null) siteData.general.socialLinks.instagram = ig;
        const tt = getVal('setTiktokUrl'); if (tt !== null) siteData.general.socialLinks.tiktok = tt;
    }

    // Collect Payment & Shipping Config
    if (!siteData.paymentConfig) siteData.paymentConfig = {};
    const bId = getVal('setBankId'); if (bId !== null) siteData.paymentConfig.bankId = bId;
    const bAcc = getVal('setBankAccountNo'); if (bAcc !== null) siteData.paymentConfig.accountNumber = bAcc;
    const bName = getVal('setBankAccountName'); if (bName !== null) siteData.paymentConfig.accountName = bName;
    const pUrl = getVal('setPaypalUrl'); if (pUrl !== null) siteData.paymentConfig.paypalUrl = pUrl;

    if (!siteData.shippingConfig) siteData.shippingConfig = {};
    const sD7 = getVal('setShipDistrict7'); if (sD7 !== null) siteData.shippingConfig.district7Fee = parseInt(sD7, 10) || 15000;
    const sOth = getVal('setShipOther'); if (sOth !== null) siteData.shippingConfig.otherDistrictFee = parseInt(sOth, 10) || 25000;
    const sMin = getVal('setShipFreeMin'); if (sMin !== null) siteData.shippingConfig.freeShippingMin = parseInt(sMin, 10) || 120000;

    // Collect Hero
    if (siteData.hero) {
        const tp1 = getVal('heroTitlePart1'); if (tp1 !== null) siteData.hero.titlePart1 = tp1;
        const thl = getVal('heroTitleHighlight'); if (thl !== null) siteData.hero.titleHighlight = thl;
        const hd = getVal('heroDesc'); if (hd !== null) siteData.hero.description = hd;
        const hbt = getVal('heroBadgeText'); if (hbt !== null) siteData.hero.badgeText = hbt;
        const bp1t = getVal('heroBtn1Text'); if (bp1t !== null) siteData.hero.btnPrimaryText = bp1t;
        const bp1l = getVal('heroBtn1Link'); if (bp1l !== null) siteData.hero.btnPrimaryLink = bp1l;
        const bot = getVal('heroBtn2Text'); if (bot !== null) siteData.hero.btnOutlineText = bot;
        const bol = getVal('heroBtn2Link'); if (bol !== null) siteData.hero.btnOutlineLink = bol;
    }

    // Brand Strip
    if (siteData.brandStrip) {
        const bse = getChecked('brandStripEnabled'); if (bse !== null) siteData.brandStrip.enabled = bse;
    }

    // Menu Titles
    if (siteData.menu) {
        const mt1 = getVal('menuTitlePart1'); if (mt1 !== null) siteData.menu.sectionTitlePart1 = mt1;
        const mth = getVal('menuTitleHighlight'); if (mth !== null) siteData.menu.sectionTitleHighlight = mth;
        const msd = getVal('menuSectionDesc'); if (msd !== null) siteData.menu.sectionDescription = msd;
    }

    // Promo Banner
    if (siteData.promoBanner) {
        const pe = getChecked('promoEnabled'); if (pe !== null) siteData.promoBanner.enabled = pe;
        const pt = getVal('promoTitle'); if (pt !== null) siteData.promoBanner.title = pt;
        const pd = getVal('promoDesc'); if (pd !== null) siteData.promoBanner.description = pd;
        const pbt = getVal('promoBtnText'); if (pbt !== null) siteData.promoBanner.btnText = pbt;
        const pbl = getVal('promoBtnLink'); if (pbl !== null) siteData.promoBanner.btnLink = pbl;
    }

    // Gallery Titles
    if (siteData.gallery) {
        const gt1 = getVal('galleryTitlePart1'); if (gt1 !== null) siteData.gallery.sectionTitlePart1 = gt1;
        const gth = getVal('galleryTitleHighlight'); if (gth !== null) siteData.gallery.sectionTitleHighlight = gth;
        const gsd = getVal('gallerySectionDesc'); if (gsd !== null) siteData.gallery.sectionDescription = gsd;
    }

    // About Us
    if (siteData.about) {
        const at1 = getVal('aboutTitlePart1'); if (at1 !== null) siteData.about.sectionTitlePart1 = at1;
        const ath = getVal('aboutTitleHighlight'); if (ath !== null) siteData.about.sectionTitleHighlight = ath;
        const ap1 = getVal('aboutP1'); if (ap1 !== null) siteData.about.paragraph1 = ap1;
        const ap2 = getVal('aboutP2'); if (ap2 !== null) siteData.about.paragraph2 = ap2;
    }

    // Cập nhật timestamp sửa đổi
    siteData.updatedAt = Date.now();

    // 1. Luôn lưu vào localStorage ngay lập tức để đồng bộ tức thì sang trang chủ và các trang khác cùng trình duyệt
    try {
        localStorage.setItem('kitten_site_data', JSON.stringify(siteData));
        localStorage.setItem('kitten_site_data_time', siteData.updatedAt.toString());
        localStorage.setItem('kitten_site_data_event', Date.now().toString());
        window.dispatchEvent(new CustomEvent('siteContentUpdated', { detail: siteData }));
    } catch (e) {
        console.warn('Lỗi lưu LocalStorage:', e);
    }

    // 2. Gửi đồng bộ lên máy chủ / Serverless API
    try {
        const res = await fetch('/api/content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(siteData)
        });
        const data = await res.json();
        if (res.ok && data.success) {
            showToast(customMessage || '🎉 Đã lưu toàn bộ thay đổi thành công! Trang chủ và các trang đã được cập nhật.');
        } else {
            throw new Error(data.error || 'Lỗi ghi tệp dữ liệu');
        }
    } catch (err) {
        console.warn('Gửi API server gặp lỗi, đã lưu vào bộ nhớ trình duyệt:', err);
        showToast(customMessage || '🎉 Đã lưu thay đổi vào bộ nhớ máy! Trang chủ đã được cập nhật.');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-save"></i> <span>Lưu tất cả thay đổi</span>';
        }
        updateDashboardStats();
    }
}

document.getElementById('btnSaveAll').addEventListener('click', saveAllChanges);

// ---------------- BACKUP & RESTORE ----------------
document.getElementById('btnDownloadBackup').addEventListener('click', () => {
    window.location.href = '/api/backup';
    showToast('Bản sao lưu đang được tải về máy tính!');
});

document.getElementById('restoreFileInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            const parsed = JSON.parse(event.target.result);
            if (!parsed.general || !parsed.menu) {
                throw new Error('Tệp JSON không đúng cấu trúc của Kitten Cake CMS');
            }

            if (confirm('Bạn có chắc muốn khôi phục nội dung từ tệp sao lưu này? Mọi nội dung hiện tại sẽ được thay thế.')) {
                const res = await fetch('/api/restore', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(parsed)
                });
                const data = await res.json();
                if (res.ok && data.success) {
                    siteData = parsed;
                    populateAllForms();
                    showToast('Khôi phục dữ liệu từ tệp thành công!');
                } else {
                    throw new Error(data.error || 'Lỗi từ máy chủ');
                }
            }
        } catch (err) {
            alert('Lỗi nạp tệp sao lưu: ' + err.message);
        }
    };
    reader.readAsText(file);
});

document.getElementById('btnResetToDefaults').addEventListener('click', async () => {
    if (confirm('CẢNH BÁO: Hành động này sẽ đặt lại toàn bộ thực đơn và thông tin về dữ liệu mặc định ban đầu của tiệm bánh. Bạn có chắc không?')) {
        try {
            const res = await fetch('../data/content.json');
            const defaultData = await res.json();
            siteData = defaultData;
            await saveAllChanges();
            populateAllForms();
            showToast('Đã khôi phục về trạng thái gốc của tiệm bánh!');
        } catch (err) {
            showToast('Không thể nạp dữ liệu gốc: ' + err.message, 'error');
        }
    }
});

// Change Password
document.getElementById('btnChangePassword').addEventListener('click', async () => {
    const currentPassword = document.getElementById('pwdCurrent').value;
    const newPassword = document.getElementById('pwdNew').value;

    if (!currentPassword || !newPassword) {
        alert('Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới!');
        return;
    }

    try {
        const res = await fetch('/api/auth/change-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPassword, newPassword })
        });
        const data = await res.json();
        if (res.ok && data.success) {
            showToast('Đổi mật khẩu thành công! Hãy ghi nhớ mật khẩu mới.');
            document.getElementById('pwdCurrent').value = '';
            document.getElementById('pwdNew').value = '';
        } else {
            alert(data.error || 'Không thể đổi mật khẩu');
        }
    } catch (err) {
        showToast('Lỗi kết nối máy chủ: ' + err.message, 'error');
    }
});

// ========================================================
// CATEGORIES MANAGEMENT CONTROLLER
// ========================================================
function renderCategoriesTable() {
    const tbody = document.getElementById('categoriesTableBody');
    if (!tbody || !siteData) return;

    const categories = siteData.categories || [];
    tbody.innerHTML = '';

    if (categories.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:30px; color:#a4b0be;">Chưa có danh mục nào. Hãy bấm "+ Thêm danh mục mới"!</td></tr>`;
        return;
    }

    categories.forEach(cat => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="text-align:center; font-size:18px; color:#ff6b81;"><i class="fas ${cat.icon || 'fa-cookie'}"></i></td>
            <td><strong>${cat.name}</strong></td>
            <td><code>${cat.slug || ''}</code></td>
            <td>${cat.badge ? `<span class="badge" style="background:#fff0f3; color:#f6416c; font-weight:700;">${cat.badge}</span>` : '<span style="color:#a4b0be;">--</span>'}</td>
            <td style="font-size:12px; color:#57606f;">${cat.description || ''}</td>
            <td style="text-align:right;">
                <button class="btn btn-sm btn-outline" onclick="openEditCategoryModal('${cat.id}')"><i class="fas fa-edit"></i> Sửa</button>
                <button class="btn btn-sm btn-outline text-danger" onclick="deleteCategory('${cat.id}')"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function populateCategoryDropdowns() {
    const catSelect = document.getElementById('modalMenuCategory');
    if (catSelect && siteData) {
        catSelect.innerHTML = '';
        (siteData.categories || []).forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id;
            opt.textContent = c.name;
            catSelect.appendChild(opt);
        });
    }

    const artCatSelect = document.getElementById('modalArtCategory');
    if (artCatSelect && siteData) {
        artCatSelect.innerHTML = '';
        (siteData.blogCategories || []).forEach(b => {
            const opt = document.createElement('option');
            opt.value = b.id;
            opt.textContent = b.name;
            artCatSelect.appendChild(opt);
        });
    }

    const artProdSelect = document.getElementById('modalArtFeaturedProduct');
    if (artProdSelect && siteData && siteData.menu) {
        artProdSelect.innerHTML = '<option value="">-- Không gắn món bánh --</option>';
        (siteData.menu.items || []).forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = `${p.name} (${formatCurrency(p.price)})`;
            artProdSelect.appendChild(opt);
        });
    }
}

const btnOpenAddCat = document.getElementById('btnOpenAddCategoryModal');
if (btnOpenAddCat) {
    btnOpenAddCat.addEventListener('click', () => {
        document.getElementById('categoryModalTitle').textContent = 'Thêm Danh Mục Bánh Mới';
        document.getElementById('modalCatId').value = '';
        document.getElementById('modalCatName').value = '';
        document.getElementById('modalCatSlug').value = '';
        document.getElementById('modalCatIcon').value = 'fa-cookie-bite';
        document.getElementById('modalCatBadge').value = '';
        document.getElementById('modalCatDesc').value = '';
        openModal('categoryModal');
    });
}

window.openEditCategoryModal = function(id) {
    const cat = (siteData.categories || []).find(c => c.id === id);
    if (!cat) return;

    document.getElementById('categoryModalTitle').textContent = 'Chỉnh Sửa Danh Mục Bánh';
    document.getElementById('modalCatId').value = cat.id;
    document.getElementById('modalCatName').value = cat.name;
    document.getElementById('modalCatSlug').value = cat.slug || '';
    document.getElementById('modalCatIcon').value = cat.icon || 'fa-cookie-bite';
    document.getElementById('modalCatBadge').value = cat.badge || '';
    document.getElementById('modalCatDesc').value = cat.description || '';
    openModal('categoryModal');
};

const btnSaveCat = document.getElementById('btnSaveCategory');
if (btnSaveCat) {
    btnSaveCat.addEventListener('click', async () => {
        const id = document.getElementById('modalCatId').value;
        const name = document.getElementById('modalCatName').value.trim();
        const slug = document.getElementById('modalCatSlug').value.trim();
        const icon = document.getElementById('modalCatIcon').value;
        const badge = document.getElementById('modalCatBadge').value.trim();
        const description = document.getElementById('modalCatDesc').value.trim();

        if (!name) {
            alert('Vui lòng nhập tên danh mục bánh!');
            return;
        }

        if (!siteData.categories) siteData.categories = [];

        const catData = {
            id: id || ('cat_' + Date.now()),
            name,
            slug: slug || name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            icon,
            badge,
            description
        };

        const existingIdx = siteData.categories.findIndex(c => c.id === catData.id);
        if (existingIdx >= 0) {
            siteData.categories[existingIdx] = catData;
        } else {
            siteData.categories.push(catData);
        }

        renderCategoriesTable();
        populateCategoryDropdowns();
        closeModal('categoryModal');
        showToast('Đã lưu danh mục bánh thành công!');
    });
}

window.deleteCategory = function(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;
    siteData.categories = (siteData.categories || []).filter(c => c.id !== id);
    renderCategoriesTable();
    populateCategoryDropdowns();
    showToast('Đã xóa danh mục bánh.', 'info');
};

// ========================================================
// ARTICLES & BLOG MANAGEMENT CONTROLLER
// ========================================================
function renderArticlesTable() {
    const tbody = document.getElementById('articlesTableBody');
    if (!tbody || !siteData) return;

    const articles = siteData.articles || [];
    tbody.innerHTML = '';

    if (articles.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:30px; color:#a4b0be;">Chưa có bài viết nào. Hãy bấm "+ Viết bài mới"!</td></tr>`;
        return;
    }

    articles.forEach(art => {
        const tr = document.createElement('tr');
        const imgPath = toAppUrl(art.coverImage || 'tai-nguyen/donut-collection.jpg');
        tr.innerHTML = `
            <td><img src="${imgPath}" alt="${art.title}" style="width:50px; height:40px; object-fit:cover; border-radius:6px;"></td>
            <td><strong>${art.title}</strong></td>
            <td><span class="badge" style="background:#e8f4fd; color:#0984e3; font-weight:700;">${art.categoryName || 'Mẹo Bánh'}</span></td>
            <td>${art.author || 'Kitten Cake'}</td>
            <td>${art.publishDate || ''}</td>
            <td><i class="fas fa-eye" style="color:#a4b0be;"></i> ${art.views || 0}</td>
            <td style="text-align:right;">
                <button class="btn btn-sm btn-outline" onclick="openEditArticleModal('${art.id}')"><i class="fas fa-edit"></i> Sửa</button>
                <button class="btn btn-sm btn-outline text-danger" onclick="deleteArticle('${art.id}')"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

const btnOpenAddArt = document.getElementById('btnOpenAddArticleModal');
if (btnOpenAddArt) {
    btnOpenAddArt.addEventListener('click', () => {
        document.getElementById('articleModalTitle').textContent = 'Soạn Thảo Bài Viết Mới';
        document.getElementById('modalArtId').value = '';
        document.getElementById('modalArtTitle').value = '';
        document.getElementById('modalArtAuthor').value = 'Bếp Trưởng Kitten Cake';
        document.getElementById('modalArtReadTime').value = '3 phút đọc';
        document.getElementById('modalArtExcerpt').value = '';
        document.getElementById('modalArtContent').value = '';
        document.getElementById('modalArtTags').value = 'Donut, Bánh Ngọt, Mẹo Hay';
        document.getElementById('modalArtCoverPreview').src = toAppUrl('tai-nguyen/donut-collection.jpg');
        document.getElementById('modalArtCoverUrl').value = 'tai-nguyen/donut-collection.jpg';
        populateCategoryDropdowns();
        openModal('articleModal');
    });
}

window.openEditArticleModal = function(id) {
    const art = (siteData.articles || []).find(a => a.id === id);
    if (!art) return;

    populateCategoryDropdowns();

    document.getElementById('articleModalTitle').textContent = 'Chỉnh Sửa Bài Viết';
    document.getElementById('modalArtId').value = art.id;
    document.getElementById('modalArtTitle').value = art.title;
    document.getElementById('modalArtCategory').value = art.categoryId || '';
    document.getElementById('modalArtAuthor').value = art.author || '';
    document.getElementById('modalArtReadTime').value = art.readTime || '';
    document.getElementById('modalArtExcerpt').value = art.excerpt || '';
    document.getElementById('modalArtContent').value = art.content || '';
    document.getElementById('modalArtTags').value = (art.tags || []).join(', ');
    document.getElementById('modalArtFeaturedProduct').value = art.featuredProductId || '';

    const imgPath = toAppUrl(art.coverImage || 'tai-nguyen/donut-collection.jpg');
    document.getElementById('modalArtCoverPreview').src = imgPath;
    document.getElementById('modalArtCoverUrl').value = art.coverImage || '';

    openModal('articleModal');
};

const btnSaveArt = document.getElementById('btnSaveArticle');
if (btnSaveArt) {
    btnSaveArt.addEventListener('click', () => {
        const id = document.getElementById('modalArtId').value;
        const title = document.getElementById('modalArtTitle').value.trim();
        const categoryId = document.getElementById('modalArtCategory').value;
        const author = document.getElementById('modalArtAuthor').value.trim();
        const readTime = document.getElementById('modalArtReadTime').value.trim();
        const excerpt = document.getElementById('modalArtExcerpt').value.trim();
        const content = document.getElementById('modalArtContent').value.trim();
        const tagsRaw = document.getElementById('modalArtTags').value.trim();
        const featuredProductId = document.getElementById('modalArtFeaturedProduct').value;
        const coverImage = document.getElementById('modalArtCoverUrl').value.trim() || 'tai-nguyen/donut-collection.jpg';

        if (!title) {
            alert('Vui lòng nhập tiêu đề bài viết!');
            return;
        }

        const catObj = (siteData.blogCategories || []).find(b => b.id === categoryId);
        const categoryName = catObj ? catObj.name : 'Mẹo Bánh & Thưởng Thức';

        const tags = tagsRaw.split(',').map(t => t.trim()).filter(Boolean);

        if (!siteData.articles) siteData.articles = [];

        const artData = {
            id: id || ('art_' + Date.now()),
            slug: title.toLowerCase().replace(/[^a-z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/g, '-').replace(/-+/g, '-'),
            title,
            categoryId,
            categoryName,
            author: author || 'Kitten Cake',
            publishDate: new Date().toISOString().slice(0, 10),
            readTime: readTime || '3 phút đọc',
            featuredProductId,
            coverImage,
            excerpt,
            content,
            tags,
            views: 120
        };

        const existingIdx = siteData.articles.findIndex(a => a.id === artData.id);
        if (existingIdx >= 0) {
            artData.views = siteData.articles[existingIdx].views || 120;
            artData.publishDate = siteData.articles[existingIdx].publishDate || artData.publishDate;
            siteData.articles[existingIdx] = artData;
        } else {
            siteData.articles.unshift(artData);
        }

        renderArticlesTable();
        closeModal('articleModal');
        showToast('Đã lưu bài viết thành công!');
    });
}

window.deleteArticle = function(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;
    siteData.articles = (siteData.articles || []).filter(a => a.id !== id);
    renderArticlesTable();
    showToast('Đã xóa bài viết.', 'info');
};

// Cover Image Upload Handler
const artCoverInput = document.getElementById('modalArtCoverInput');
if (artCoverInput) {
    artCoverInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const url = await uploadImage(file);
        if (url) {
            document.getElementById('modalArtCoverPreview').src = toAppUrl(url);
            document.getElementById('modalArtCoverUrl').value = url;
            showToast('Tải ảnh bài viết lên thành công!');
        }
    });
}

// Initialize on page load
checkAuth();
loadSiteData();
