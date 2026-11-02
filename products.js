// Kitten Cake - Products Catalog Controller
const FALLBACK_CATALOG_DATA = {
    categories: [
        {
            id: "cat_donut",
            slug: "donut-signature",
            name: "Donut Signature 10K",
            icon: "fa-cookie-bite",
            badge: "Hot",
            description: "Donut ruột mềm xốp đồng giá 10k nướng tươi mỗi ngày, ngập tràn vị ngọt ngào."
        },
        {
            id: "cat_baked",
            slug: "banh-nuong-nong",
            name: "Bánh Nướng Nóng",
            icon: "fa-fire-alt",
            badge: "Thơm Giòn",
            description: "Tart trứng vỏ ngàn lớp giòn rụm ngát hương bơ Pháp."
        },
        {
            id: "cat_cold",
            slug: "banh-lanh-hu",
            name: "Bánh Lạnh & Mousse Hũ",
            icon: "fa-ice-cream",
            badge: "Bestseller",
            description: "Oreo Cheesecake béo ngậy, Panna Cotta chua ngọt đóng hũ cực tiện lợi."
        },
        {
            id: "cat_combo",
            slug: "combo-hop-qua",
            name: "Combo & Hộp Quà Tặng",
            icon: "fa-gift",
            badge: "Tiết Kiệm",
            description: "Set bánh hộp mèo Kitten Cake siêu dễ thương cho sinh nhật, tiệc lớp, quà tặng."
        }
    ],
    menu: {
        items: [
            {
                id: "menu_1",
                name: "Donut Xốp Mềm Signature",
                tag: "🍩 Món Signature",
                categoryId: "cat_donut",
                price: 10000,
                originalPrice: 15000,
                rating: 5.0,
                reviewsCount: 128,
                isFeatured: true,
                badge: "Best Seller • Món Chính",
                description: "Món bánh chủ đạo nướng tươi mỗi ngày, ruột mềm xốp phủ socola Bỉ, cốm cầu vồng, dâu tây hoặc matcha ngọt dịu.",
                image: "tai-nguyen/donut-collection-1791974653397.jpg",
                status: "active",
                inStock: true,
                flavors: [
                    { name: "Vị Choco", image: "tai-nguyen/donut-choco.jpg" },
                    { name: "Vị Vani", image: "tai-nguyen/donut-vani.jpg" },
                    { name: "Vị Matcha", image: "tai-nguyen/donut-matcha.jpg" },
                    { name: "Vị Dâu", image: "tai-nguyen/donut-dau.jpg" }
                ],
                details: {
                    shelfLife: "Dùng ngon nhất trong ngày hoặc 2 ngày ngăn mát tủ lạnh.",
                    ingredients: "Bột mì thượng hạng, bơ lạt nguyên chất, trứng gà tươi, men Pháp, sốt chocolate và matcha nhập khẩu."
                }
            },
            {
                id: "menu_2",
                name: "Tart Trứng Béo Ngậy Giòn Rụm",
                tag: "🥧 Bánh Nướng Nóng",
                categoryId: "cat_baked",
                price: 18000,
                originalPrice: 22000,
                rating: 4.9,
                reviewsCount: 94,
                isFeatured: true,
                badge: "Vỏ Ngàn Lớp",
                description: "Lớp vỏ ngàn lớp giòn tan rụm kết hợp cùng nhân kem trứng sữa nướng xém mặt thơm lừng béo ngậy chuẩn vị Hồng Kông.",
                image: "tai-nguyen/tart-trung.jpg",
                status: "active",
                inStock: true,
                flavors: [
                    { name: "Tart Trứng Truyền Thống", image: "tai-nguyen/tart-trung.jpg" }
                ],
                details: {
                    shelfLife: "Ngon nhất khi ăn nóng trong ngày; bảo quản ngăn mát 2 ngày, làm nóng lại bằng nồi chiên không dầu 3 phút.",
                    ingredients: "Bột ngàn lớp cao cấp, lòng đỏ trứng gà tươi, whipping cream, sữa tươi tiệt trùng, bơ Anchor."
                }
            },
            {
                id: "menu_3",
                name: "Oreo Cheesecake",
                tag: "🍰 Bánh Lạnh Hũ",
                categoryId: "cat_cold",
                price: 35000,
                originalPrice: 40000,
                rating: 5.0,
                reviewsCount: 86,
                isFeatured: true,
                badge: "Yêu Thích",
                description: "Sự kết hợp hoàn hảo giữa cream cheese béo ngậy chua dịu và vụn bánh quy Oreo giòn rụm, đóng hũ sạch sẽ tiện lợi.",
                image: "tai-nguyen/oreo-cheesecake.jpg",
                status: "active",
                inStock: true,
                flavors: [
                    { name: "Oreo Vụn Giòn", image: "tai-nguyen/oreo-cheesecake.jpg" }
                ],
                details: {
                    shelfLife: "Bảo quản ngăn mát từ 3 - 5 ngày. Dùng lạnh trực tiếp.",
                    ingredients: "Cream cheese New Zealand, bánh Oreo nguyên bản, whipping cream tươi, bơ lạt, đường ăn kiêng nhẹ."
                }
            },
            {
                id: "menu_4",
                name: "Panna Cotta Trái Cây Thanh Mát",
                tag: "🍮 Tráng Miệng Ý",
                categoryId: "cat_cold",
                price: 25000,
                originalPrice: 30000,
                rating: 4.8,
                reviewsCount: 62,
                isFeatured: false,
                badge: "Thanh Mát",
                description: "Món tráng miệng thanh mát từ nước Ý, pudding sữa mềm mịn tan ngay trên đầu lưỡi cùng sốt mứt trái cây chua ngọt.",
                image: "tai-nguyen/panna-cotta.jpg",
                status: "active",
                inStock: true,
                flavors: [
                    { name: "Sốt Dâu Tây Tươi", image: "tai-nguyen/panna-cotta.jpg" },
                    { name: "Sốt Chanh Dây Chua Ngọt", image: "tai-nguyen/panna-cotta.jpg" },
                    { name: "Sốt Kiwi Xanh", image: "tai-nguyen/panna-cotta.jpg" }
                ],
                details: {
                    shelfLife: "Dùng lạnh, bảo quản ngăn mát tủ lạnh trong 3 ngày.",
                    ingredients: "Sữa tươi Đà Lạt, whipping cream, gelatin hữu cơ, mứt trái cây cô đặc tự nấu không chất bảo quản."
                }
            },
            {
                id: "menu_5",
                name: "Combo Hộp 6 Donut Quà Tặng",
                tag: "🎁 Combo Tiết Kiệm",
                categoryId: "cat_combo",
                price: 50000,
                originalPrice: 60000,
                rating: 5.0,
                reviewsCount: 115,
                isFeatured: true,
                badge: "Mua 5 Tặng 1",
                description: "Hộp quà tặng mèo Kitten Cake siêu cưng gồm 6 chiếc Donut đủ vị (Choco, Vani, Dâu tây, Matcha, Hạnh nhân). Tặng kèm thiệp nhỏ!",
                image: "tai-nguyen/donut-box.jpg",
                status: "active",
                inStock: true,
                flavors: [
                    { name: "Set Mix 6 Vị Đầy Đủ", image: "tai-nguyen/donut-box.jpg" }
                ],
                details: {
                    shelfLife: "Dùng trong 24h - 48h. Thích hợp mang tặng bạn bè, người yêu, sinh nhật.",
                    ingredients: "Đầy đủ các vị signature Donut Kitten Cake."
                }
            },
            {
                id: "menu_6",
                name: "Hộp 4 Tart Trứng Nóng Giòn",
                tag: "🥧 Bánh Nướng Nóng",
                categoryId: "cat_baked",
                price: 65000,
                originalPrice: 72000,
                rating: 4.9,
                reviewsCount: 57,
                isFeatured: false,
                badge: "Tiết Kiệm",
                description: "Set 4 chiếc Tart trứng nướng nóng hổi đóng hộp sang trọng, giòn tan ngàn lớp cho bữa xế văn phòng ấm áp.",
                image: "tai-nguyen/tart-trung.jpg",
                status: "active",
                inStock: true,
                flavors: [
                    { name: "Hộp 4 Chiếc Tiêu Chuẩn", image: "tai-nguyen/tart-trung.jpg" }
                ],
                details: {
                    shelfLife: "Ăn ngon nhất khi còn ấm giòn trong ngày.",
                    ingredients: "Trứng gà tươi, whipping cream, bơ lạt hảo hạng."
                }
            }
        ]
    }
};

let allProducts = [];
let allCategories = [];
let activeCategory = 'all';
let currentSearchTerm = '';
let activePriceFilter = 'all';
let activeSort = 'default';

// Quick Modal State
let currentQuickItem = null;
let selectedFlavor = null;
let quickQuantity = 1;

document.addEventListener('DOMContentLoaded', () => {
    initCatalog();
    setupEventListeners();
    updateCartBadge();
});

// Format Currency
function formatCurrency(amount) {
    if (isNaN(amount)) return '0đ';
    return Number(amount).toLocaleString('vi-VN') + 'đ';
}

// Toast Notification
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-info-circle';
    toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 3500);
}

// Sync Cart Badge
function updateCartBadge() {
    const badge = document.getElementById('cartCountBadge');
    if (!badge) return;
    try {
        const raw = localStorage.getItem('kitten_cart_v2');
        const cart = raw ? JSON.parse(raw) : [];
        const totalCount = cart.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
        if (totalCount > 0) {
            badge.textContent = totalCount;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    } catch (e) {
        badge.style.display = 'none';
    }
}

// Read URL Params (e.g. ?category=cat_donut or ?search=donut)
function parseUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category');
    const q = params.get('search');
    if (cat) activeCategory = cat;
    if (q) {
        currentSearchTerm = q;
        const searchInput = document.getElementById('catalogSearch');
        if (searchInput) searchInput.value = q;
    }
}

async function initCatalog() {
    parseUrlParams();
    let data = null;
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
                data = localData;
            } else {
                data = apiData;
            }
        }
    } catch (e) {
        console.warn('API /api/content error, fallback to localStorage/data.json');
    }

    if (!data && localData) {
        data = localData;
    }

    if (!data) {
        try {
            const resLocal = await fetch('data/content.json?_t=' + Date.now(), { cache: 'no-store' });
            if (resLocal.ok) data = await resLocal.json();
        } catch (e) {
            console.error('Cannot load data file');
        }
    }

    if (!data || !data.menu || !data.menu.items || data.menu.items.length === 0) {
        data = JSON.parse(JSON.stringify(FALLBACK_CATALOG_DATA));
    } else {
        // Chỉ giữ lại các món chính của tiệm: Donut, Tart trứng, Oreo Cheesecake, Panna Cotta
        const validMenuIds = new Set(['menu_1', 'menu_2', 'menu_3', 'menu_4', 'menu_5', 'menu_6']);
        data.menu.items = (data.menu.items || []).filter(item => validMenuIds.has(item.id));
        
        // Nếu thiếu món nào trong 6 món chính thì bổ sung từ fallback
        const existingIds = new Set(data.menu.items.map(p => p.id));
        FALLBACK_CATALOG_DATA.menu.items.forEach(item => {
            if (!existingIds.has(item.id)) {
                data.menu.items.push(item);
            }
        });

        // Chỉ giữ lại các danh mục bánh chính thức
        const validCatIds = new Set(['cat_donut', 'cat_baked', 'cat_cold', 'cat_combo']);
        data.categories = (data.categories || []).filter(c => validCatIds.has(c.id));
        const existingCatIds = new Set(data.categories.map(c => c.id));
        FALLBACK_CATALOG_DATA.categories.forEach(cat => {
            if (!existingCatIds.has(cat.id)) {
                data.categories.push(cat);
            }
        });
    }

    if (data) {
        allCategories = data.categories || [];
        allProducts = data.menu?.items || [];
        renderCategoryChips();
        applyFiltersAndRender();
    }

    // Lắng nghe sự kiện đồng bộ khi tab admin cập nhật
    window.addEventListener('storage', (e) => {
        if (e.key === 'kitten_site_data' && e.newValue) {
            try {
                const updated = JSON.parse(e.newValue);
                allCategories = updated.categories || [];
                allProducts = updated.menu?.items || [];
                renderCategoryChips();
                applyFiltersAndRender();
            } catch (err) {}
        }
    });
}

function renderCategoryChips() {
    const container = document.getElementById('categoryChips');
    if (!container) return;

    // Update 'All' count
    const countAllEl = document.getElementById('chipCountAll');
    if (countAllEl) {
        countAllEl.textContent = allProducts.filter(p => p.status !== 'inactive').length;
    }

    // Render chips
    container.querySelectorAll('.category-chip:not([data-category="all"])').forEach(el => el.remove());

    allCategories.forEach(rawCat => {
        const cat = window.KittenI18n ? window.KittenI18n.getTranslatedCategory(rawCat) : rawCat;
        const count = allProducts.filter(p => p.categoryId === rawCat.id && p.status !== 'inactive').length;
        const chip = document.createElement('button');
        chip.className = `category-chip ${activeCategory === rawCat.id ? 'active' : ''}`;
        chip.setAttribute('data-category', rawCat.id);
        chip.innerHTML = `
            <i class="fas ${cat.icon || 'fa-cookie'}"></i> ${cat.name}
            <span class="chip-count">${count}</span>
        `;
        chip.addEventListener('click', () => {
            selectCategory(rawCat.id);
        });
        container.appendChild(chip);
    });

    // Mark 'all' active if needed
    const allChip = container.querySelector('[data-category="all"]');
    if (allChip) {
        allChip.classList.toggle('active', activeCategory === 'all');
        allChip.onclick = () => selectCategory('all');
    }
}

function selectCategory(catId) {
    activeCategory = catId;
    document.querySelectorAll('.category-chip').forEach(chip => {
        chip.classList.toggle('active', chip.getAttribute('data-category') === catId);
    });
    applyFiltersAndRender();
}

function resetCatalogFilters() {
    activeCategory = 'all';
    currentSearchTerm = '';
    activePriceFilter = 'all';
    activeSort = 'default';

    const searchInput = document.getElementById('catalogSearch');
    if (searchInput) searchInput.value = '';
    const priceSelect = document.getElementById('priceFilter');
    if (priceSelect) priceSelect.value = 'all';
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) sortSelect.value = 'default';

    document.querySelectorAll('.category-chip').forEach(chip => {
        chip.classList.toggle('active', chip.getAttribute('data-category') === 'all');
    });

    applyFiltersAndRender();
}

function applyFiltersAndRender() {
    let filtered = allProducts.filter(p => p.status !== 'inactive');

    // 1. Category Filter
    if (activeCategory && activeCategory !== 'all') {
        filtered = filtered.filter(p => p.categoryId === activeCategory);
    }

    // 2. Search Term
    if (currentSearchTerm.trim()) {
        const q = currentSearchTerm.toLowerCase().trim();
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(q) ||
            (p.description && p.description.toLowerCase().includes(q)) ||
            (p.tag && p.tag.toLowerCase().includes(q))
        );
    }

    // 3. Price Filter
    if (activePriceFilter === 'under-20k') {
        filtered = filtered.filter(p => p.price < 20000);
    } else if (activePriceFilter === '20k-50k') {
        filtered = filtered.filter(p => p.price >= 20000 && p.price <= 50000);
    } else if (activePriceFilter === 'over-50k') {
        filtered = filtered.filter(p => p.price > 50000);
    }

    // 4. Sort
    if (activeSort === 'price-asc') {
        filtered.sort((a, b) => a.price - b.price);
    } else if (activeSort === 'price-desc') {
        filtered.sort((a, b) => b.price - a.price);
    } else if (activeSort === 'rating-desc') {
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (activeSort === 'name-asc') {
        filtered.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    }

    renderProductsGrid(filtered);
}

function renderProductsGrid(items) {
    const grid = document.getElementById('productsGrid');
    const emptyState = document.getElementById('noProductsFound');
    const countEl = document.getElementById('resultsCount');

    if (!grid) return;

    if (countEl) {
        const isEn = window.KittenI18n?.getLang() === 'en';
        countEl.textContent = isEn ? `Showing ${items.length} cakes` : `Hiển thị ${items.length} món bánh`;
    }

    if (items.length === 0) {
        grid.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';
    grid.innerHTML = '';

    items.forEach(rawItem => {
        const isEn = window.KittenI18n?.getLang() === 'en';
        const item = isEn && window.KittenI18n ? window.KittenI18n.getTranslatedProduct(rawItem) : rawItem;
        const card = document.createElement('div');
        card.className = `menu-item ${item.isFeatured ? 'featured' : ''}`;

        // Rating Stars
        const ratingVal = item.rating || 5;
        const reviewsCount = item.reviewsCount || 100;

        const isPreOrder = item.stockStatus === 'pre_order' || item.inStock === 'pre_order' || item.isPreOrder === true || rawItem.stockStatus === 'pre_order' || rawItem.isPreOrder === true;
        const isOutOfStock = item.inStock === false || item.stockStatus === 'out_of_stock' || rawItem.inStock === false || rawItem.stockStatus === 'out_of_stock';

        let stockPillClass = '';
        let stockPillIcon = 'fa-check-circle';
        let stockPillText = isEn ? 'In Stock' : 'Còn bánh';

        if (isOutOfStock) {
            stockPillClass = 'out-of-stock';
            stockPillIcon = 'fa-times-circle';
            stockPillText = isEn ? 'Sold Out' : 'Tạm hết';
        } else if (isPreOrder) {
            stockPillClass = 'pre-order';
            stockPillIcon = 'fa-calendar-alt';
            stockPillText = isEn ? 'Pre-order' : 'Đặt trước';
        }

        card.innerHTML = `
            ${item.badge ? `<span class="hot-badge"><i class="fas fa-fire"></i> ${item.badge}</span>` : ''}
            <div class="menu-img">
                <a href="product.html?id=${rawItem.id}">
                    <img src="${item.image}" alt="${item.name}" loading="lazy">
                </a>
            </div>
            <div class="menu-info">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                    <span class="item-tag">${item.tag || (isEn ? '🍩 Cake' : '🍩 Món Bánh')}</span>
                    <span class="stock-pill ${stockPillClass}">
                        <i class="fas ${stockPillIcon}"></i> <span>${stockPillText}</span>
                    </span>
                </div>
                <h3><a href="product.html?id=${rawItem.id}" style="color:inherit; text-decoration:none;">${item.name}</a></h3>
                
                <div class="card-rating">
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <span>${ratingVal.toFixed(1)} (${reviewsCount})</span>
                </div>

                <p>${item.description || ''}</p>

                <div class="menu-card-bottom">
                    <div class="menu-price-row">
                        <div class="menu-price">${window.KittenI18n ? window.KittenI18n.formatMoney(item.price) : formatCurrency(item.price)}</div>
                        ${item.originalPrice && item.originalPrice > item.price ? `
                            <span class="menu-price-original">${window.KittenI18n ? window.KittenI18n.formatMoney(item.originalPrice) : formatCurrency(item.originalPrice)}</span>
                        ` : ''}
                    </div>
                    <div class="menu-card-actions">
                        <a href="product.html?id=${rawItem.id}" class="menu-order-btn btn-view-detail" title="${isEn ? 'View Cake Details' : 'Xem chi tiết'}">
                            <i class="fas fa-eye"></i> <span data-i18n="menu_btn_details">${isEn ? 'Details' : 'Chi tiết'}</span>
                        </a>
                        ${isOutOfStock ? `
                            <button type="button" class="menu-order-btn btn-quick-add-cart disabled" disabled style="opacity:0.6; cursor:not-allowed;" title="${isEn ? 'Out of Stock' : 'Tạm hết bánh'}">
                                <i class="fas fa-ban"></i> <span>${isEn ? 'Sold Out' : 'Tạm hết'}</span>
                            </button>
                        ` : (isPreOrder ? `
                            <button type="button" class="menu-order-btn btn-quick-add-cart" data-id="${rawItem.id}" title="${isEn ? 'Pre-order Cake' : 'Đặt trước bánh'}">
                                <i class="fas fa-calendar-plus"></i> <span data-i18n="menu_btn_preorder">${isEn ? 'Pre-order' : 'Đặt trước'}</span>
                            </button>
                        ` : `
                            <button type="button" class="menu-order-btn btn-quick-add-cart" data-id="${rawItem.id}" title="${isEn ? 'Add to Cart' : 'Thêm vào giỏ'}">
                                <i class="fas fa-cart-plus"></i> <span data-i18n="menu_btn_add_cart">${isEn ? 'Add to Cart' : 'Thêm giỏ'}</span>
                            </button>
                        `)}
                    </div>
                </div>
            </div>`;

        // Bind quick add
        const addBtn = card.querySelector('.btn-quick-add-cart');
        if (addBtn) {
            addBtn.addEventListener('click', (e) => {
                e.preventDefault();
                openQuickAdd(rawItem);
            });
        }

        grid.appendChild(card);
    });
}

function openQuickAdd(rawItem) {
    const isEn = window.KittenI18n?.getLang() === 'en';
    const item = isEn && window.KittenI18n ? window.KittenI18n.getTranslatedProduct(rawItem) : rawItem;
    currentQuickItem = rawItem;
    quickQuantity = 1;
    selectedFlavor = (item.flavors && item.flavors.length > 0) ? item.flavors[0].name : (isEn ? 'Signature Standard' : 'Vị Tiêu Chuẩn');

    // If item has only 1 flavor or no flavor choices, add directly!
    if (!item.flavors || item.flavors.length <= 1) {
        addToCart(rawItem, selectedFlavor, 1);
        showToast(isEn ? `Added ${item.name} to cart!` : `Đã thêm ${item.name} vào giỏ hàng!`, 'success');
        updateCartBadge();
        return;
    }

    // Otherwise show modal to pick flavor
    const modal = document.getElementById('quickAddModal');
    const title = document.getElementById('quickModalItemName');
    const price = document.getElementById('quickModalPrice');
    const img = document.getElementById('quickModalImg');
    const flavorsContainer = document.getElementById('quickModalFlavors');
    const qtyVal = document.getElementById('quickQtyVal');

    if (title) title.textContent = item.name;
    if (price) price.textContent = window.KittenI18n ? window.KittenI18n.formatMoney(item.price) : formatCurrency(item.price);
    if (img) img.src = item.image;
    if (qtyVal) qtyVal.textContent = quickQuantity;

    if (flavorsContainer) {
        flavorsContainer.innerHTML = '';
        item.flavors.forEach((f, idx) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `btn-flavor-chip ${idx === 0 ? 'active' : ''}`;
            btn.style.cssText = 'padding:8px 12px; border:1.5px solid #ffd1dc; background:#fff; border-radius:10px; font-weight:700; cursor:pointer; font-size:0.88rem; transition:all 0.2s;';
            btn.textContent = f.name;
            if (idx === 0) {
                btn.style.borderColor = 'var(--accent-color)';
                btn.style.background = '#fff0f3';
                btn.style.color = 'var(--accent-color)';
            }
            btn.addEventListener('click', () => {
                selectedFlavor = f.name;
                flavorsContainer.querySelectorAll('button').forEach(b => {
                    b.style.borderColor = '#ffd1dc';
                    b.style.background = '#fff';
                    b.style.color = '#333';
                });
                btn.style.borderColor = 'var(--accent-color)';
                btn.style.background = '#fff0f3';
                btn.style.color = 'var(--accent-color)';
            });
            flavorsContainer.appendChild(btn);
        });
    }

    if (modal) modal.style.display = 'flex';
}

function closeQuickAddModal() {
    const modal = document.getElementById('quickAddModal');
    if (modal) modal.style.display = 'none';
}

function addToCart(item, flavor, quantity) {
    const isPreOrder = !!(item.isPreOrder || item.stockStatus === 'pre_order' || item.inStock === 'pre_order');
    if (window.KittenCart && typeof window.KittenCart.addItem === 'function') {
        window.KittenCart.addItem({
            id: item.id,
            name: item.name,
            flavor: flavor || 'Vị Tiêu Chuẩn',
            price: Number(item.price),
            quantity: Number(quantity),
            image: item.image,
            isPreOrder: isPreOrder
        }, true);
        return;
    }

    try {
        const raw = localStorage.getItem('kitten_cart_v2');
        const cart = raw ? JSON.parse(raw) : [];

        const existingIndex = cart.findIndex(c => c.id === item.id && c.flavor === flavor);
        if (existingIndex >= 0) {
            cart[existingIndex].quantity += Number(quantity);
        } else {
            cart.push({
                id: item.id,
                name: item.name,
                flavor: flavor || 'Vị Tiêu Chuẩn',
                price: Number(item.price),
                basePrice: Number(item.price),
                quantity: Number(quantity),
                image: item.image
            });
        }

        localStorage.setItem('kitten_cart_v2', JSON.stringify(cart));
    } catch (e) {
        console.error('Cannot save cart item', e);
    }
}

function setupEventListeners() {
    // Search input with debounce
    const searchInput = document.getElementById('catalogSearch');
    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                currentSearchTerm = e.target.value;
                applyFiltersAndRender();
            }, 250);
        });
    }

    // Price filter
    const priceFilter = document.getElementById('priceFilter');
    if (priceFilter) {
        priceFilter.addEventListener('change', (e) => {
            activePriceFilter = e.target.value;
            applyFiltersAndRender();
        });
    }

    // Sort select
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            activeSort = e.target.value;
            applyFiltersAndRender();
        });
    }

    // Quick Modal Close
    const closeBtn = document.getElementById('closeQuickModalBtn');
    if (closeBtn) closeBtn.onclick = closeQuickAddModal;

    const modal = document.getElementById('quickAddModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeQuickAddModal();
        });
    }

    // Quantity Buttons
    const minusBtn = document.getElementById('quickQtyMinus');
    const plusBtn = document.getElementById('quickQtyPlus');
    const qtyVal = document.getElementById('quickQtyVal');

    if (minusBtn) {
        minusBtn.onclick = () => {
            if (quickQuantity > 1) {
                quickQuantity--;
                if (qtyVal) qtyVal.textContent = quickQuantity;
            }
        };
    }
    if (plusBtn) {
        plusBtn.onclick = () => {
            quickQuantity++;
            if (qtyVal) qtyVal.textContent = quickQuantity;
        };
    }

    // Confirm Quick Add
    const confirmBtn = document.getElementById('confirmQuickAddBtn');
    if (confirmBtn) {
        confirmBtn.onclick = () => {
            if (currentQuickItem) {
                const isEn = window.KittenI18n?.getLang() === 'en';
                const tItem = isEn && window.KittenI18n ? window.KittenI18n.getTranslatedProduct(currentQuickItem) : currentQuickItem;
                addToCart(currentQuickItem, selectedFlavor, quickQuantity);
                closeQuickAddModal();
                showToast(isEn ? `Added ${quickQuantity}x ${tItem.name} (${selectedFlavor}) to cart!` : `Đã thêm ${quickQuantity}x ${currentQuickItem.name} (${selectedFlavor}) vào giỏ!`, 'success');
                updateCartBadge();
            }
        };
    }

    // Mini Cart / Open Cart click
    const openMiniCartBtn = document.getElementById('openMiniCartBtn');
    if (openMiniCartBtn) {
        openMiniCartBtn.onclick = () => {
            window.location.href = 'cart.html';
        };
    }

    // Mobile nav toggle
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');
    if (mobileBtn && nav) {
        mobileBtn.addEventListener('click', () => {
            nav.classList.toggle('active');
        });
    }

    // Re-render when language changes
    window.addEventListener('languageChanged', () => {
        renderCategoryChips();
        applyFiltersAndRender();
        if (window.KittenI18n && window.KittenI18n.applyTranslations) {
            window.KittenI18n.applyTranslations();
        }
    });
}
