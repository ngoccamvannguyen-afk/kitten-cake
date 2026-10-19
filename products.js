// Kitten Cake - Products Catalog Controller
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
        }, false);
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
