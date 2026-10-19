// Kitten Cake - Product Detail Page Controller
document.addEventListener('DOMContentLoaded', () => {
    initProductPage();
});

let currentProduct = null;
let selectedFlavor = 'Vị Choco';
let selectedFlavorImage = 'tai-nguyen/donut-choco.jpg';
let selectedToppings = [];
let currentQuantity = 1;

async function initProductPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id') || 'menu_1';

    let productData = null;
    let relatedProducts = [];

    try {
        const res = await fetch(`/api/products/${productId}?_t=${Date.now()}`);
        if (res.ok) {
            const json = await res.json();
            if (json.success) {
                productData = json.data;
                relatedProducts = json.related || [];
            }
        }
    } catch (e) {
        console.warn('API /api/products/:id không phản hồi, thử tải từ content.json...');
    }

    if (!productData) {
        try {
            const resContent = await fetch(`data/content.json?_t=${Date.now()}`);
            if (resContent.ok) {
                const data = await resContent.json();
                const items = data?.menu?.items || [];
                productData = items.find(i => i.id === productId) || items[0];
                relatedProducts = items.filter(i => i.id !== productData?.id).slice(0, 3);
            }
        } catch (e) {
            console.error('Không thể tải dữ liệu sản phẩm.');
        }
    }

    if (productData) {
        currentProduct = productData;
        renderProductDetails(productData);
        renderRelatedProducts(relatedProducts);
        setupTabs();
        setupEvents();
        syncFooterContact();
    }
}

async function syncFooterContact() {
    try {
        const res = await fetch(`/api/content?_t=${Date.now()}`);
        if (res.ok) {
            const json = await res.json();
            const g = json?.data?.general;
            if (g) {
                const contactList = document.querySelectorAll('.footer-links')[0];
                if (contactList) {
                    const items = contactList.querySelectorAll('li');
                    if (items[0] && g.address) items[0].innerHTML = `<i class="fas fa-map-marker-alt"></i> ${g.address}`;
                    if (items[1] && g.hotline) items[1].innerHTML = `<i class="fas fa-phone-alt"></i> Hotline: <a href="tel:${g.hotline}" style="color:inherit; text-decoration:none;">${g.hotline}</a>`;
                    if (items[2] && g.email) items[2].innerHTML = `<i class="fas fa-envelope"></i> Email: <a href="mailto:${g.email}" style="color:inherit; text-decoration:none;">${g.email}</a>`;
                }
            }
        }
    } catch (e) {}
}

function renderProductDetails(rawProduct) {
    const isEn = window.KittenI18n && window.KittenI18n.getLang() === 'en';
    const product = isEn && window.KittenI18n ? window.KittenI18n.getTranslatedProduct(rawProduct) : rawProduct;

    // 1. Meta & Title
    document.title = `${product.name} - Kitten Cake ${isEn ? 'District 7' : 'Quận 7'}`;
    const breadcrumbItem = document.getElementById('breadcrumbCurrentItem');
    if (breadcrumbItem) breadcrumbItem.textContent = product.name;

    // 2. Info
    const tagEl = document.getElementById('pdpTag');
    if (tagEl) tagEl.textContent = product.tag || (isEn ? '🍩 Signature Item' : '🍩 Món Bánh');

    const titleEl = document.getElementById('pdpTitle');
    if (titleEl) titleEl.textContent = product.name;

    const badgeEl = document.getElementById('pdpBadge');
    if (badgeEl) {
        if (product.badge) {
            badgeEl.textContent = product.badge;
            badgeEl.style.display = 'inline-block';
        } else {
            badgeEl.style.display = 'none';
        }
    }

    const descEl = document.getElementById('pdpDesc');
    if (descEl) descEl.textContent = product.description;

    // 3. Stock Status
    const stockEl = document.getElementById('pdpStockStatus');
    const btnAdd = document.getElementById('btnAddToCart');
    const btnBuy = document.getElementById('btnBuyNow');
    const isPreOrder = product.stockStatus === 'pre_order' || product.inStock === 'pre_order' || product.isPreOrder === true;

    if (product.inStock === false || product.stockStatus === 'out_of_stock') {
        if (stockEl) {
            stockEl.className = 'pdp-stock-status out-of-stock';
            stockEl.innerHTML = `<i class="fas fa-times-circle"></i> ${isEn ? 'Sold out today' : 'Đã hết hàng hôm nay'}`;
        }
        if (btnAdd) {
            btnAdd.disabled = true;
            btnAdd.innerHTML = `<i class="fas fa-ban"></i> ${isEn ? 'Out of Stock' : 'Tạm hết bánh'}`;
        }
        if (btnBuy) btnBuy.disabled = true;
    } else if (isPreOrder) {
        if (stockEl) {
            stockEl.className = 'pdp-stock-status pre-order';
            stockEl.innerHTML = `<i class="fas fa-calendar-check"></i> ${isEn ? 'Pre-order Available' : 'Nhận đặt trước (Pre-order)'}`;
        }
        if (btnAdd) {
            btnAdd.disabled = false;
            btnAdd.innerHTML = `<i class="fas fa-calendar-plus"></i> <span data-i18n="pdp_btn_preorder">${isEn ? 'Pre-order Cake' : 'Đặt trước bánh'}</span>`;
        }
        if (btnBuy) {
            btnBuy.disabled = false;
            btnBuy.innerHTML = `<i class="fas fa-bolt"></i> <span data-i18n="pdp_btn_preorder_now">${isEn ? 'Pre-order Now' : 'Đặt trước ngay'}</span>`;
        }
    } else {
        if (stockEl) {
            stockEl.className = 'pdp-stock-status in-stock';
            stockEl.innerHTML = `<i class="fas fa-check-circle"></i> ${isEn ? 'Freshly baked in store' : 'Đang nướng sẵn tại tiệm'}`;
        }
        if (btnAdd) {
            btnAdd.disabled = false;
            btnAdd.innerHTML = `<i class="fas fa-cart-plus"></i> <span data-i18n="pdp_btn_add_cart">${isEn ? 'Add to Cart' : 'Thêm vào giỏ hàng'}</span>`;
        }
        if (btnBuy) {
            btnBuy.disabled = false;
            btnBuy.innerHTML = `<i class="fas fa-bolt"></i> <span data-i18n="pdp_btn_buy_now">${isEn ? 'Buy Now' : 'Mua ngay'}</span>`;
        }
    }

    // 4. Image Gallery
    const mainImg = document.getElementById('pdpMainImg');
    const thumbsContainer = document.getElementById('pdpThumbnails');

    const gallery = (product.gallery && product.gallery.length > 0)
        ? product.gallery
        : [product.image || 'tai-nguyen/donut-choco.jpg'];

    if (mainImg) mainImg.src = gallery[0];

    if (thumbsContainer) {
        thumbsContainer.innerHTML = '';
        gallery.forEach((imgUrl, index) => {
            const thumb = document.createElement('div');
            thumb.className = `pdp-thumb-item ${index === 0 ? 'active' : ''}`;
            thumb.setAttribute('data-img', imgUrl);
            thumb.innerHTML = `<img src="${imgUrl}" alt="${product.name} ${index + 1}">`;
            thumb.addEventListener('click', () => {
                selectMainImage(imgUrl);
            });
            thumbsContainer.appendChild(thumb);
        });
    }

    function selectMainImage(imgUrl) {
        if (mainImg) mainImg.src = imgUrl;
        document.querySelectorAll('.pdp-thumb-item').forEach(t => {
            t.classList.toggle('active', t.getAttribute('data-img') === imgUrl);
        });
    }

    // 5. Flavors Selector (Vị Choco, Vani, Matcha, Dâu)
    const flavorContainer = document.getElementById('flavorSelector');
    const flavorDisplay = document.getElementById('selectedFlavorName');

    const defaultFlavors = [
        { name: 'Vị Choco', image: 'tai-nguyen/donut-choco.jpg' },
        { name: 'Vị Vani', image: 'tai-nguyen/donut-vani.jpg' },
        { name: 'Vị Matcha', image: 'tai-nguyen/donut-matcha.jpg' },
        { name: 'Vị Dâu', image: 'tai-nguyen/donut-dau.jpg' }
    ];

    const rawFlavors = (product.flavors && product.flavors.length > 0)
        ? product.flavors
        : defaultFlavors;

    // Chuẩn hóa định dạng mảng object { name, image }
    const flavors = rawFlavors.map(f => {
        if (typeof f === 'string') {
            const fLower = f.toLowerCase();
            let img = 'tai-nguyen/donut-choco.jpg';
            if (fLower.includes('trắng') || fLower.includes('white') || fLower.includes('vani')) img = 'tai-nguyen/donut-vani.jpg';
            else if (fLower.includes('matcha')) img = 'tai-nguyen/donut-matcha.jpg';
            else if (fLower.includes('dâu')) img = 'tai-nguyen/donut-dau.jpg';
            else if (fLower.includes('choco')) img = 'tai-nguyen/donut-choco.jpg';
            return { name: f, image: img };
        }
        return f;
    });

    function getFlavorDisplayName(name) {
        if (window.KittenI18n && window.KittenI18n.getLang() === 'en') {
            if (name.includes('Choco')) return 'Choco Flavor';
            if (name.includes('Vani') || name.includes('White')) return 'Vanilla Flavor';
            if (name.includes('Matcha')) return 'Matcha Flavor';
            if (name.includes('Dâu')) return 'Strawberry Flavor';
        }
        return name;
    }

    function getToppingDisplayName(name) {
        if (window.KittenI18n && window.KittenI18n.getLang() === 'en') {
            if (name.includes('Oreo')) return 'Oreo Crumbs';
            if (name.includes('điều')) return 'Cashew Nuts';
            if (name.includes('Marshmallow')) return 'Marshmallow';
            if (name.includes('chocolate') || name.includes('Socola')) return 'Chocolate Chips';
            if (name.includes('dâu') || name.includes('Dâu')) return 'Dried Strawberry';
            if (name.includes('cốm') || name.includes('Cốm')) return 'Rainbow Sprinkles';
        }
        return name;
    }

    selectedFlavor = flavors[0].name;
    selectedFlavorImage = flavors[0].image || gallery[0];
    if (flavorDisplay) flavorDisplay.textContent = getFlavorDisplayName(selectedFlavor);
    selectMainImage(selectedFlavorImage);

    if (flavorContainer) {
        flavorContainer.innerHTML = '';
        flavors.forEach((flavorObj, index) => {
            const pill = document.createElement('button');
            pill.type = 'button';
            pill.className = `flavor-pill visual-pill ${index === 0 ? 'active' : ''}`;

            const displayName = getFlavorDisplayName(flavorObj.name);

            pill.innerHTML = `
                <img src="${flavorObj.image}" alt="${displayName}" class="flavor-mini-thumb">
                <span>${displayName}</span>
                <i class="fas fa-check checkmark"></i>
            `;

            pill.addEventListener('click', () => {
                document.querySelectorAll('.flavor-pill').forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                selectedFlavor = flavorObj.name;
                selectedFlavorImage = flavorObj.image;
                if (flavorDisplay) flavorDisplay.textContent = getFlavorDisplayName(flavorObj.name);

                // Tự động chuyển đổi hình ảnh minh họa tương ứng với vị đã chọn
                selectMainImage(flavorObj.image);
            });

            flavorContainer.appendChild(pill);
        });
    }

    // 6. Toppings Selector (+3.000đ / loại)
    const toppingsGroup = document.getElementById('pdpToppingsGroup');
    const toppingContainer = document.getElementById('toppingSelector');
    const toppingCountEl = document.getElementById('selectedToppingsCount');

    const defaultToppings = [
        { id: 'top_oreo', name: 'Vụn Oreo', price: 3000 },
        { id: 'top_cashew', name: 'Hạt điều', price: 3000 },
        { id: 'top_marshmallow', name: 'Marshmallow', price: 3000 },
        { id: 'top_choco_chips', name: 'Vụn chocolate', price: 3000 },
        { id: 'top_dried_strawberry', name: 'Dâu tây sấy vụn', price: 3000 },
        { id: 'top_sprinkles', name: 'Hạt cốm', price: 3000 }
    ];

    const toppingsList = (product.toppings && product.toppings.length > 0)
        ? product.toppings
        : (product.id === 'menu_1' ? defaultToppings : []);

    selectedToppings = [];

    if (toppingsList.length === 0) {
        if (toppingsGroup) toppingsGroup.style.display = 'none';
    } else {
        if (toppingsGroup) toppingsGroup.style.display = 'block';
        if (toppingContainer) {
            toppingContainer.innerHTML = '';
            toppingsList.forEach(top => {
                const pill = document.createElement('button');
                pill.type = 'button';
                pill.className = 'topping-pill';
                const dispTopName = getToppingDisplayName(top.name);
                const dispTopPrice = isEn ? '+$0.12' : '+3k';

                pill.innerHTML = `
                    <span class="topping-check"><i class="fas fa-check"></i></span>
                    <span class="topping-name">${dispTopName}</span>
                    <span class="topping-price">${dispTopPrice}</span>
                `;

                pill.addEventListener('click', () => {
                    const idx = selectedToppings.indexOf(top.name);
                    if (idx > -1) {
                        selectedToppings.splice(idx, 1);
                        pill.classList.remove('active');
                    } else {
                        selectedToppings.push(top.name);
                        pill.classList.add('active');
                    }

                    if (toppingCountEl) {
                        toppingCountEl.textContent = `${isEn ? 'Selected:' : 'Đã chọn:'} ${selectedToppings.length}`;
                    }

                    updateSubtotalPreview();
                });

                toppingContainer.appendChild(pill);
            });
        }
    }

    // 7. Details Tab Content
    const details = product.details || {};
    const ingEl = document.getElementById('pdpDetailIngredients');
    if (ingEl) {
        ingEl.textContent = details.ingredients || (isEn 
            ? 'Premium Japanese flour, New Zealand butter, natural yeast, fresh eggs, pure Belgian chocolate.'
            : 'Bột mì Nhật cao cấp, Bơ lạt New Zealand, Men tự nhiên, Trứng gà tươi, Socola Bỉ nguyên chất.');
    }

    const shelfEl = document.getElementById('pdpDetailShelfLife');
    if (shelfEl) {
        shelfEl.textContent = details.shelfLife || (isEn
            ? 'Best enjoyed on the same day, or keep chilled for 2-3 days in refrigerator.'
            : 'Ngon nhất trong ngày, bảo quản mát 2-3 ngày trong ngăn mát tủ lạnh.');
    }

    updateSubtotalPreview();

    if (window.KittenI18n && window.KittenI18n.applyTranslations) {
        window.KittenI18n.applyTranslations();
    }
}

function updateSubtotalPreview() {
    const qtyInput = document.getElementById('pdpQtyInput');
    currentQuantity = parseInt(qtyInput.value, 10) || 1;
    if (currentQuantity < 1) currentQuantity = 1;
    if (currentQuantity > 99) currentQuantity = 99;
    qtyInput.value = currentQuantity;

    const basePrice = Number(currentProduct?.price) || 10000;
    const toppingsExtra = selectedToppings.length * 3000;
    const unitPrice = basePrice + toppingsExtra;

    const isEn = window.KittenI18n && window.KittenI18n.getLang() === 'en';
    const priceFormatter = isEn ? (val) => window.KittenI18n.formatMoney(val) : formatCurrency;

    const priceEl = document.getElementById('pdpPrice');
    if (priceEl) {
        if (toppingsExtra > 0) {
            priceEl.innerHTML = `${priceFormatter(unitPrice)} <small style="font-size:0.9rem; color:#747d8c; font-weight:600;">(${formatCurrency(basePrice)} + ${formatCurrency(toppingsExtra)} topping)</small>`;
        } else {
            priceEl.textContent = priceFormatter(unitPrice);
        }
    }

    const subtotal = unitPrice * currentQuantity;
    const subtotalDisplay = document.getElementById('pdpSubtotalDisplay');
    if (subtotalDisplay) {
        subtotalDisplay.textContent = priceFormatter(subtotal);
    }
}

window.addEventListener('languageChanged', () => {
    if (currentProduct) {
        renderProductDetails(currentProduct);
    }
    if (window._currentRelatedProducts) {
        renderRelatedProducts(window._currentRelatedProducts);
    }
    updateSubtotalPreview();
    if (window.KittenI18n && window.KittenI18n.applyTranslations) {
        window.KittenI18n.applyTranslations();
    }
});

function setupEvents() {
    // Quantity Minus
    const btnMinus = document.getElementById('btnPdpQtyMinus');
    const btnPlus = document.getElementById('btnPdpQtyPlus');
    const qtyInput = document.getElementById('pdpQtyInput');

    if (btnMinus) {
        btnMinus.addEventListener('click', () => {
            if (currentQuantity > 1) {
                currentQuantity--;
                qtyInput.value = currentQuantity;
                updateSubtotalPreview();
            }
        });
    }

    if (btnPlus) {
        btnPlus.addEventListener('click', () => {
            if (currentQuantity < 99) {
                currentQuantity++;
                qtyInput.value = currentQuantity;
                updateSubtotalPreview();
            }
        });
    }

    if (qtyInput) {
        qtyInput.addEventListener('change', updateSubtotalPreview);
    }

    // Add To Cart
    const btnAdd = document.getElementById('btnAddToCart');
    if (btnAdd) {
        btnAdd.addEventListener('click', () => {
            if (!currentProduct || currentProduct.inStock === false || currentProduct.stockStatus === 'out_of_stock') return;

            const basePrice = Number(currentProduct.price) || 10000;
            const toppingsExtra = selectedToppings.length * 3000;
            const finalUnitPrice = basePrice + toppingsExtra;
            const isPreOrder = !!(currentProduct.isPreOrder || currentProduct.stockStatus === 'pre_order' || currentProduct.inStock === 'pre_order');

            window.KittenCart.addItem({
                id: currentProduct.id,
                name: currentProduct.name,
                basePrice: basePrice,
                price: finalUnitPrice,
                flavor: selectedFlavor,
                toppings: [...selectedToppings],
                image: selectedFlavorImage || currentProduct.image || 'tai-nguyen/donut-choco.jpg',
                quantity: currentQuantity,
                isPreOrder: isPreOrder
            }, true);
        });
    }

    // Buy Now
    const btnBuy = document.getElementById('btnBuyNow');
    if (btnBuy) {
        btnBuy.addEventListener('click', () => {
            if (!currentProduct || currentProduct.inStock === false || currentProduct.stockStatus === 'out_of_stock') return;

            const basePrice = Number(currentProduct.price) || 10000;
            const toppingsExtra = selectedToppings.length * 3000;
            const finalUnitPrice = basePrice + toppingsExtra;
            const isPreOrder = !!(currentProduct.isPreOrder || currentProduct.stockStatus === 'pre_order' || currentProduct.inStock === 'pre_order');

            window.KittenCart.addItem({
                id: currentProduct.id,
                name: currentProduct.name,
                basePrice: basePrice,
                price: finalUnitPrice,
                flavor: selectedFlavor,
                toppings: [...selectedToppings],
                image: selectedFlavorImage || currentProduct.image || 'tai-nguyen/donut-choco.jpg',
                quantity: currentQuantity,
                isPreOrder: isPreOrder
            }, false);

            window.location.href = 'cart.html';
        });
    }

    // Mobile nav toggle
    const mobBtn = document.querySelector('.mobile-menu-btn');
    if (mobBtn) {
        mobBtn.addEventListener('click', () => {
            document.querySelector('.nav-list').classList.toggle('active');
        });
    }
}

function setupTabs() {
    const tabBtns = document.querySelectorAll('.pdp-tab-btn');
    const tabContents = document.querySelectorAll('.pdp-tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-tab');

            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const targetContent = document.getElementById(targetId);
            if (targetContent) targetContent.classList.add('active');
        });
    });
}

function renderRelatedProducts(products) {
    window._currentRelatedProducts = products;
    const grid = document.getElementById('relatedProductsGrid');
    if (!grid) return;

    grid.innerHTML = '';
    if (!products || products.length === 0) {
        grid.style.display = 'none';
        return;
    }

    const isEn = window.KittenI18n && window.KittenI18n.getLang() === 'en';
    const priceFormatter = isEn ? (v) => window.KittenI18n.formatMoney(v) : formatCurrency;

    products.forEach(rawItem => {
        const item = isEn && window.KittenI18n ? window.KittenI18n.getTranslatedProduct(rawItem) : rawItem;
        const card = document.createElement('div');
        card.className = `menu-item ${item.isFeatured ? 'featured' : ''}`;
        const subtext = item.unitSubtext || (item.id === 'menu_1' 
            ? (isEn ? 'Flat 10K (~$0.40)' : 'Đồng giá 10K') 
            : ((item.id === 'menu_3' || item.id === 'menu_4') 
                ? (isEn ? 'Chilled Cake' : 'Bánh hũ lạnh') 
                : (isEn ? 'Freshly Baked' : 'Bánh nướng nóng')));

        card.innerHTML = `
            ${item.badge ? `<span class="hot-badge"><i class="fas fa-fire"></i> ${item.badge}</span>` : ''}
            <div class="menu-img">
                <a href="product.html?id=${rawItem.id}">
                    <img src="${item.image}" alt="${item.name}">
                </a>
            </div>
            <div class="menu-info">
                <span class="item-tag">${item.tag || (isEn ? '🍩 Cake' : '🍩 Món Bánh')}</span>
                <h3><a href="product.html?id=${rawItem.id}" style="color:inherit; text-decoration:none;">${item.name}</a></h3>
                <p>${item.description || ''}</p>
                <div class="menu-card-bottom">
                    <div class="menu-price-row">
                        <div class="menu-price">${priceFormatter(item.price)}</div>
                        <span class="menu-price-subtext">${subtext}</span>
                    </div>
                    <div class="menu-card-actions">
                        <a href="product.html?id=${rawItem.id}" class="menu-order-btn btn-view-detail" title="${isEn ? 'View Cake Details' : 'Xem chi tiết bánh'}">
                            <i class="fas fa-eye"></i> ${isEn ? 'Details' : 'Chi tiết'}
                        </a>
                        ${(rawItem.stockStatus === 'pre_order' || rawItem.isPreOrder) ? `
                            <button type="button" class="menu-order-btn btn-quick-add-cart" data-item-id="${rawItem.id}" title="${isEn ? 'Pre-order Cake' : 'Đặt trước bánh'}">
                                <i class="fas fa-calendar-plus"></i> ${isEn ? 'Pre-order' : 'Đặt trước'}
                            </button>
                        ` : `
                            <button type="button" class="menu-order-btn btn-quick-add-cart" data-item-id="${rawItem.id}" title="${isEn ? 'Add to Cart' : 'Thêm vào giỏ hàng'}">
                                <i class="fas fa-cart-plus"></i> ${isEn ? 'Add to Cart' : 'Thêm giỏ'}
                            </button>
                        `}
                    </div>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });

    if (window.KittenI18n && typeof window.KittenI18n.scanAndTranslateDynamic === 'function') {
        window.KittenI18n.scanAndTranslateDynamic(grid);
    }

    // Lắng nghe nút Thêm giỏ từ sản phẩm gợi ý
    grid.addEventListener('click', (e) => {
        const quickAddBtn = e.target.closest('.btn-quick-add-cart');
        if (quickAddBtn) {
            e.preventDefault();
            const itemId = quickAddBtn.getAttribute('data-item-id');
            const targetItem = products.find(p => p.id === itemId);
            if (targetItem && window.KittenCart) {
                let flavorName = isEn ? 'Signature Flavor' : 'Vị Chuẩn Signature';
                let itemImage = targetItem.image || 'tai-nguyen/donut-choco.jpg';
                if (targetItem.flavors && targetItem.flavors.length > 0) {
                    const f0 = targetItem.flavors[0];
                    if (typeof f0 === 'string') {
                        flavorName = f0;
                    } else if (f0 && f0.name) {
                        flavorName = f0.name;
                        if (f0.image) itemImage = f0.image;
                    }
                }
                const isItemPreOrder = !!(targetItem.isPreOrder || targetItem.stockStatus === 'pre_order' || targetItem.inStock === 'pre_order');
                window.KittenCart.addItem({
                    id: targetItem.id,
                    name: targetItem.name,
                    price: targetItem.price,
                    flavor: flavorName,
                    toppings: [],
                    image: itemImage,
                    quantity: 1,
                    isPreOrder: isItemPreOrder
                }, true);
            }
        }
    });
}

function formatCurrency(val) {
    if (isNaN(val)) return '0đ';
    if (window.KittenI18n && typeof window.KittenI18n.formatMoney === 'function') {
        return window.KittenI18n.formatMoney(val);
    }
    return Number(val).toLocaleString('vi-VN') + 'đ';
}

