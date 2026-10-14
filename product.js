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
    }
}

function renderProductDetails(product) {
    // 1. Meta & Title
    document.title = `${product.name} - Kitten Cake Quận 7`;
    const breadcrumbItem = document.getElementById('breadcrumbCurrentItem');
    if (breadcrumbItem) breadcrumbItem.textContent = product.name;

    // 2. Info
    const tagEl = document.getElementById('pdpTag');
    if (tagEl) tagEl.textContent = product.tag || '🍩 Món Bánh';

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

    if (product.inStock === false) {
        if (stockEl) {
            stockEl.className = 'pdp-stock-status out-of-stock';
            stockEl.innerHTML = '<i class="fas fa-times-circle"></i> Đã hết hàng hôm nay';
        }
        if (btnAdd) {
            btnAdd.disabled = true;
            btnAdd.innerHTML = '<i class="fas fa-ban"></i> Tạm hết bánh';
        }
        if (btnBuy) btnBuy.disabled = true;
    } else {
        if (stockEl) {
            stockEl.className = 'pdp-stock-status in-stock';
            stockEl.innerHTML = '<i class="fas fa-check-circle"></i> Đang nướng sẵn tại tiệm';
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
        { name: 'Chocolate Trắng', image: 'tai-nguyen/donut-vani.jpg' },
        { name: 'Matcha', image: 'tai-nguyen/donut-matcha.jpg' },
        { name: 'Dâu', image: 'tai-nguyen/donut-dau.jpg' },
        { name: 'Chocolate', image: 'tai-nguyen/donut-choco.jpg' }
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

    selectedFlavor = flavors[0].name;
    selectedFlavorImage = flavors[0].image || gallery[0];
    if (flavorDisplay) flavorDisplay.textContent = selectedFlavor;
    selectMainImage(selectedFlavorImage);

    if (flavorContainer) {
        flavorContainer.innerHTML = '';
        flavors.forEach((flavorObj, index) => {
            const pill = document.createElement('button');
            pill.type = 'button';
            pill.className = `flavor-pill visual-pill ${index === 0 ? 'active' : ''}`;

            pill.innerHTML = `
                <img src="${flavorObj.image}" alt="${flavorObj.name}" class="flavor-mini-thumb">
                <span>${flavorObj.name}</span>
                <i class="fas fa-check checkmark"></i>
            `;

            pill.addEventListener('click', () => {
                document.querySelectorAll('.flavor-pill').forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                selectedFlavor = flavorObj.name;
                selectedFlavorImage = flavorObj.image;
                if (flavorDisplay) flavorDisplay.textContent = flavorObj.name;

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
                pill.innerHTML = `
                    <span class="topping-check"><i class="fas fa-check"></i></span>
                    <span class="topping-name">${top.name}</span>
                    <span class="topping-price">+3k</span>
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
                        toppingCountEl.textContent = `Đã chọn: ${selectedToppings.length}`;
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
        ingEl.textContent = details.ingredients || 'Bột mì Nhật cao cấp, Bơ lạt New Zealand, Men tự nhiên, Trứng gà tươi, Socola Bỉ nguyên chất và sốt trái cây tươi.';
    }

    const shelfEl = document.getElementById('pdpDetailShelfLife');
    if (shelfEl) {
        shelfEl.textContent = details.shelfLife || 'Ngon nhất trong ngày, bảo quản mát 2-3 ngày trong ngăn mát tủ lạnh.';
    }

    updateSubtotalPreview();
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

    const priceEl = document.getElementById('pdpPrice');
    if (priceEl) {
        if (toppingsExtra > 0) {
            priceEl.innerHTML = `${formatCurrency(unitPrice)} <small style="font-size:0.9rem; color:#747d8c; font-weight:600;">(${formatCurrency(basePrice)} + ${formatCurrency(toppingsExtra)} topping)</small>`;
        } else {
            priceEl.textContent = formatCurrency(unitPrice);
        }
    }

    const subtotal = unitPrice * currentQuantity;
    const subtotalDisplay = document.getElementById('pdpSubtotalDisplay');
    if (subtotalDisplay) {
        subtotalDisplay.textContent = formatCurrency(subtotal);
    }
}

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
            if (!currentProduct || currentProduct.inStock === false) return;

            const basePrice = Number(currentProduct.price) || 10000;
            const toppingsExtra = selectedToppings.length * 3000;
            const finalUnitPrice = basePrice + toppingsExtra;

            window.KittenCart.addItem({
                id: currentProduct.id,
                name: currentProduct.name,
                basePrice: basePrice,
                price: finalUnitPrice,
                flavor: selectedFlavor,
                toppings: [...selectedToppings],
                image: selectedFlavorImage || currentProduct.image || 'tai-nguyen/donut-choco.jpg',
                quantity: currentQuantity
            }, true);
        });
    }

    // Buy Now
    const btnBuy = document.getElementById('btnBuyNow');
    if (btnBuy) {
        btnBuy.addEventListener('click', () => {
            if (!currentProduct || currentProduct.inStock === false) return;

            const basePrice = Number(currentProduct.price) || 10000;
            const toppingsExtra = selectedToppings.length * 3000;
            const finalUnitPrice = basePrice + toppingsExtra;

            window.KittenCart.addItem({
                id: currentProduct.id,
                name: currentProduct.name,
                basePrice: basePrice,
                price: finalUnitPrice,
                flavor: selectedFlavor,
                toppings: [...selectedToppings],
                image: selectedFlavorImage || currentProduct.image || 'tai-nguyen/donut-choco.jpg',
                quantity: currentQuantity
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
    const grid = document.getElementById('relatedProductsGrid');
    if (!grid) return;

    grid.innerHTML = '';
    if (!products || products.length === 0) {
        grid.style.display = 'none';
        return;
    }

    products.forEach(item => {
        const card = document.createElement('div');
        card.className = `menu-item ${item.isFeatured ? 'featured' : ''}`;
        card.innerHTML = `
            ${item.badge ? `<span class="hot-badge"><i class="fas fa-fire"></i> ${item.badge}</span>` : ''}
            <div class="menu-img">
                <a href="product.html?id=${item.id}">
                    <img src="${item.image}" alt="${item.name}">
                </a>
            </div>
            <div class="menu-info">
                <span class="item-tag">${item.tag || '🍩 Món Bánh'}</span>
                <h3><a href="product.html?id=${item.id}" style="color:inherit; text-decoration:none;">${item.name}</a></h3>
                <p>${item.description || ''}</p>
                <div class="menu-card-bottom">
                    <div class="menu-price">${formatCurrency(item.price)}</div>
                    <a href="product.html?id=${item.id}" class="menu-order-btn">
                        <i class="fas fa-eye"></i> Xem bánh
                    </a>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function formatCurrency(val) {
    if (isNaN(val)) return '0đ';
    return Number(val).toLocaleString('vi-VN') + 'đ';
}
