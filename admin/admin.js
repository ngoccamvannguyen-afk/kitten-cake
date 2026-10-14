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

// Modal helper
function openModal(id) {
    document.getElementById(id).classList.add('active');
}
function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

// Check Authentication
function checkAuth() {
    const token = localStorage.getItem('kitten_admin_token');
    if (!token && !window.location.href.includes('login.html')) {
        window.location.href = 'login.html';
    }
}

// Logout
document.getElementById('btnLogout').addEventListener('click', () => {
    if (confirm('Bạn có chắc chắn muốn đăng xuất khỏi trang quản trị?')) {
        localStorage.removeItem('kitten_admin_token');
        localStorage.removeItem('kitten_admin_user');
        window.location.href = 'login.html';
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
    'tab-dashboard': { title: 'Tổng Quan Hệ Thống', subtitle: 'Xin chào! Cập nhật nội dung website Kitten Cake thật nhanh và dễ dàng.' },
    'tab-menu': { title: 'Quản Lý Thực Đơn & Món Bánh', subtitle: 'Thêm món mới, điều chỉnh giá, đổi tag loại bánh và bật/tắt hiển thị món.' },
    'tab-promo': { title: 'Quản Lý Ưu Đãi Donut Box', subtitle: 'Chương trình khuyến mãi combo dành riêng cho học sinh - sinh viên.' },
    'tab-hero': { title: 'Quản Lý Hero & Banner Cover', subtitle: 'Thay đổi tiêu đề lớn, slogan, huy hiệu vương miện và ảnh dải banner.' },
    'tab-gallery': { title: 'Thư Viện Ảnh Bánh Thực Tế', subtitle: 'Cập nhật những mẻ bánh nướng mới ra lò mỗi ngày tại gian bếp Kitten Cake.' },
    'tab-about': { title: 'Về Kitten Cake & Cam Kết', subtitle: 'Câu chuyện thương hiệu tiệm bánh và các điểm cam kết chất lượng.' },
    'tab-orders': { title: 'Yêu Cầu & Đơn Đặt Bánh Nhanh', subtitle: 'Xem danh sách khách hàng đặt bánh trực tuyến qua website.' },
    'tab-settings': { title: 'Cài Đặt Chung & Liên Hệ', subtitle: 'Hotline, địa chỉ Quận 7, email, giờ mở cửa và các kênh mạng xã hội.' },
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

// ---------------- LOAD DATA FROM SERVER ----------------
async function loadSiteData() {
    try {
        const res = await fetch('/api/content');
        if (res.ok) {
            const json = await res.json();
            siteData = json.data;
        } else {
            throw new Error('Không thể tải từ API');
        }
    } catch (err) {
        console.warn('Fetch /api/content failed, attempting local data/content.json:', err);
        try {
            const localRes = await fetch('../data/content.json');
            siteData = await localRes.json();
        } catch (localErr) {
            console.error('Fatal: Cannot load content data', localErr);
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
        document.getElementById('sidebarLogo').src = g.logo ? `../${g.logo}` : '../tai-nguyen/logo.jpg';
        document.getElementById('setBrandName').value = g.brandName || '';
        document.getElementById('setSiteTitle').value = g.siteTitle || '';
        document.getElementById('setBrandTagline').value = g.brandTagline || '';
        document.getElementById('setLogoPreview').src = g.logo ? `../${g.logo}` : '../tai-nguyen/logo.jpg';
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
        if (document.getElementById('setBankId')) document.getElementById('setBankId').value = p.bankId || 'MB';
        if (document.getElementById('setBankAccountNo')) document.getElementById('setBankAccountNo').value = p.accountNumber || '';
        if (document.getElementById('setBankAccountName')) document.getElementById('setBankAccountName').value = p.accountName || '';
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
        if (h.image) document.getElementById('heroImgPreview').src = `../${h.image}`;
    }

    // Brand Strip
    if (siteData.brandStrip) {
        document.getElementById('brandStripEnabled').checked = siteData.brandStrip.enabled !== false;
        if (siteData.brandStrip.image) {
            document.getElementById('coverBannerPreview').src = `../${siteData.brandStrip.image}`;
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
        if (p.image) document.getElementById('promoImgPreview').src = `../${p.image}`;
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
        if (a.image) document.getElementById('aboutImgPreview').src = `../${a.image}`;
        renderAboutFeatures();
    }

    // Orders
    loadOrders();
}

// ---------------- DASHBOARD STATS ----------------
function updateDashboardStats() {
    if (!siteData) return;
    const menuCount = (siteData.menu && siteData.menu.items) ? siteData.menu.items.length : 0;
    const galCount = (siteData.gallery && siteData.gallery.items) ? siteData.gallery.items.length : 0;
    const isPromoOn = siteData.promoBanner && siteData.promoBanner.enabled !== false;

    document.getElementById('statMenuCount').textContent = menuCount;
    document.getElementById('statGalleryCount').textContent = galCount;
    document.getElementById('statPromoStatus').textContent = isPromoOn ? 'Đang bật' : 'Đang tắt';
    document.getElementById('statPromoStatus').style.color = isPromoOn ? '#2ed573' : '#a4b0be';
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
        const imgPath = item.image.startsWith('http') || item.image.startsWith('data:') ? item.image : `../${item.image}`;

        tr.innerHTML = `
            <td style="font-weight:700; color:#a4b0be;">#${index + 1}</td>
            <td>
                <div class="item-thumb-title">
                    <img src="${imgPath}" alt="${item.name}" class="item-thumb" onerror="this.src='../tai-nguyen/donut-signature.jpg'">
                    <div class="item-title-text">
                        <h4>${item.name}</h4>
                        <span>${item.description ? item.description.slice(0, 45) + '...' : ''}</span>
                        ${item.inStock === false ? '<span style="display:inline-block; margin-top:3px; background:#ffebee; color:#ff4757; font-size:11px; padding:2px 6px; border-radius:4px; font-weight:700;"><i class="fas fa-ban"></i> Hết hàng hôm nay</span>' : ''}
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
                    <button class="btn-action" title="Chỉnh sửa món này" onclick="openEditMenuModal('${item.id}')">
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
    document.getElementById('modalMenuFlavors').value = 'Chocolate Trắng, Matcha, Dâu, Chocolate';
    document.getElementById('modalMenuInStock').value = 'true';
    document.getElementById('modalMenuShelfLife').value = 'Dùng ngon nhất trong ngày, ngăn mát 2-3 ngày';
    document.getElementById('modalMenuIngredients').value = 'Bột mì Nhật cao cấp, Bơ Anchor, Trứng tươi, Socola Bỉ';
    document.getElementById('modalMenuDesc').value = '';
    document.getElementById('modalMenuImgPreview').src = '../tai-nguyen/donut-signature.jpg';
    document.getElementById('modalMenuOrderLink').value = siteData.general?.socialLinks?.facebook || '';
    openModal('menuModal');
});

window.openEditMenuModal = function(id) {
    const item = siteData.menu.items.find(i => i.id === id);
    if (!item) return;

    currentEditingMenuItemId = id;
    document.getElementById('menuModalTitle').textContent = 'Chỉnh Sửa Món Bánh';
    document.getElementById('modalMenuId').value = item.id;
    document.getElementById('modalMenuName').value = item.name;
    document.getElementById('modalMenuTag').value = item.tag || '🍩 Món Signature';
    document.getElementById('modalMenuPrice').value = item.price;
    updateModalPricePreview();
    document.getElementById('modalMenuBadge').value = item.badge || '';
    document.getElementById('modalMenuFeatured').value = item.isFeatured ? 'true' : 'false';

    const defaultFlavorsStr = 'Chocolate Trắng, Matcha, Dâu, Chocolate';
    const flavorsStr = (Array.isArray(item.flavors) && item.flavors.length > 0)
        ? item.flavors.join(', ')
        : defaultFlavorsStr;
    document.getElementById('modalMenuFlavors').value = flavorsStr;
    document.getElementById('modalMenuInStock').value = item.inStock !== false ? 'true' : 'false';
    document.getElementById('modalMenuShelfLife').value = item.details?.shelfLife || '';
    document.getElementById('modalMenuIngredients').value = item.details?.ingredients || '';

    document.getElementById('modalMenuDesc').value = item.description || '';
    document.getElementById('modalMenuOrderLink').value = item.orderLink || '';

    const imgPath = item.image.startsWith('http') || item.image.startsWith('data:') ? item.image : `../${item.image}`;
    document.getElementById('modalMenuImgPreview').src = imgPath;

    openModal('menuModal');
};

document.getElementById('btnSaveMenuItem').addEventListener('click', async () => {
    const name = document.getElementById('modalMenuName').value.trim();
    const price = parseInt(document.getElementById('modalMenuPrice').value, 10);
    const tag = document.getElementById('modalMenuTag').value;
    const badge = document.getElementById('modalMenuBadge').value.trim();
    const isFeatured = document.getElementById('modalMenuFeatured').value === 'true';
    const description = document.getElementById('modalMenuDesc').value.trim();
    const orderLink = document.getElementById('modalMenuOrderLink').value.trim();
    const inStock = document.getElementById('modalMenuInStock').value === 'true';
    const flavorsRaw = document.getElementById('modalMenuFlavors').value.trim();
    const shelfLife = document.getElementById('modalMenuShelfLife').value.trim();
    const ingredients = document.getElementById('modalMenuIngredients').value.trim();

    const flavors = flavorsRaw
        ? flavorsRaw.split(',').map(f => f.trim()).filter(Boolean)
        : ['Vị Chuẩn Signature'];

    let imageSrc = document.getElementById('modalMenuImgPreview').getAttribute('src');

    // Clean relative path prefix if needed
    if (imageSrc.startsWith('../')) imageSrc = imageSrc.substring(3);

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
            item.price = price;
            item.tag = tag;
            item.badge = badge;
            item.isFeatured = isFeatured;
            item.description = description;
            item.orderLink = orderLink;
            item.image = imageSrc;
            item.inStock = inStock;
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
            tag,
            price,
            isFeatured,
            badge,
            description,
            image: imageSrc || 'tai-nguyen/donut-signature.jpg',
            orderLink: orderLink || (siteData.general?.socialLinks?.facebook || '#'),
            status: 'active',
            inStock,
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
setupImageUpload('modalMenuImgInput', 'modalMenuImgPreview');

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
        const imgPath = item.image.startsWith('http') || item.image.startsWith('data:') ? item.image : `../${item.image}`;

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
    document.getElementById('modalGalleryImgPreview').src = '../tai-nguyen/donut-varieties.jpg';
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
    document.getElementById('sidebarLogo').src = `../${url}`;
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
                    <div style="font-size:12px; margin-bottom:2px;">
                        <strong>${i.quantity}x</strong> ${i.name}
                        ${i.flavor ? `<span style="color:#ff6b81;">(${i.flavor})</span>` : ''}
                    </div>
                `).join('');
            } else {
                itemsSummaryHtml = `<span style="font-size:12px; color:#747d8c;">${order.note || 'Đặt bánh qua web'}</span>`;
            }

            const paymentBadge = order.paymentMethod === 'banking'
                ? '<span class="status-badge" style="background:#e8f8f0; color:#2ed573; font-size:11px;"><i class="fas fa-qrcode"></i> VietQR</span>'
                : '<span class="status-badge" style="background:#f1f2f6; color:#57606f; font-size:11px;"><i class="fas fa-money-bill-wave"></i> COD</span>';

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
    document.getElementById('slipPaymentMethod').textContent = order.paymentMethod === 'banking' ? 'Chuyển khoản VietQR' : 'Tiền mặt COD';
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
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${item.name}</strong></td>
                <td><span style="color:#ff6b81;">${item.flavor || 'Vị chuẩn'}</span></td>
                <td style="text-align:center;"><strong>${item.quantity}</strong></td>
                <td style="text-align:right;">${formatCurrency(item.price)}</td>
                <td style="text-align:right; font-weight:700;">${formatCurrency(lineTotal)}</td>
            `;
            itemsTbody.appendChild(tr);
        });
    }

    document.getElementById('slipSubtotal').textContent = formatCurrency(order.subtotal || order.total || 0);
    document.getElementById('slipShipping').textContent = formatCurrency(order.shippingFee || 0);
    document.getElementById('slipDiscount').textContent = `-${formatCurrency(order.discount || 0)}`;
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

    // Send to Server
    try {
        const res = await fetch('/api/content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(siteData)
        });
        const data = await res.json();
        if (res.ok && data.success) {
            showToast(customMessage || '🎉 Đã lưu toàn bộ thay đổi thành công! Trang chủ đã được cập nhật.');
        } else {
            throw new Error(data.error || 'Lỗi ghi tệp dữ liệu');
        }
    } catch (err) {
        console.warn('Save API failed, saving to localStorage as fallback:', err);
        localStorage.setItem('kitten_site_data', JSON.stringify(siteData));
        showToast('Đã lưu dữ liệu tạm vào bộ nhớ máy!');
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

// Initialize on page load
checkAuth();
loadSiteData();
