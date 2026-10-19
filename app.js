// Kitten Cake - Frontend Dynamic Engine
let currentSiteContent = null;

document.addEventListener('DOMContentLoaded', () => {
    initSite();
});

// Helper: Format Vietnamese Currency
function formatCurrency(amount) {
    if (isNaN(amount)) return '0đ';
    return Number(amount).toLocaleString('vi-VN') + 'đ';
}

async function initSite() {
    let content = null;

    try {
        const res = await fetch('/api/content?_t=' + Date.now(), { cache: 'no-store' });
        if (res.ok) {
            const json = await res.json();
            content = json.data;
        }
    } catch (e) {
        console.warn('API /api/content not reachable, trying local JSON file...');
    }

    if (!content) {
        try {
            const resLocal = await fetch('data/content.json?_t=' + Date.now(), { cache: 'no-store' });
            if (resLocal.ok) {
                content = await resLocal.json();
            }
        } catch (e) {
            console.warn('Local data file not loaded, falling back to static HTML content.');
        }
    }

    if (content) {
        currentSiteContent = content;
        applyContentToDOM(content);
        setupQuickOrderModal(content);
    }

    // Show quick admin button if logged in
    setupAdminShortcut();
    setupQuickCartListener();
}

function applyContentToDOM(data) {
    const isEn = window.KittenI18n && window.KittenI18n.getLang() === 'en';

    // 1. General & Header
    if (data.general) {
        const g = data.general;
        if (g.siteTitle) document.title = isEn ? 'Kitten Cake - Lovely Sweet Bakery in District 7' : g.siteTitle;

        // Logo & Brand Name
        document.querySelectorAll('.logo img').forEach(img => {
            if (g.logo) img.src = g.logo;
        });
        const headerBrand = document.querySelector('.header .logo span');
        if (headerBrand && g.brandName) headerBrand.textContent = g.brandName;

        const footerBrand = document.querySelector('.footer-brand .logo span');
        if (footerBrand && g.brandName) footerBrand.textContent = g.brandName;

        // Header Order Button
        const headerBtn = document.querySelector('.header-btn a');
        if (headerBtn) {
            const btnText = isEn ? 'Cart' : (g.orderButtonText || 'Giỏ hàng');
            headerBtn.innerHTML = `<i class="fas fa-shopping-cart"></i> <span>${btnText}</span>`;
            if (g.orderButtonLink) headerBtn.href = g.orderButtonLink;
        }

        // Footer Tagline & Contact
        const footerTagline = document.querySelector('.footer-brand p');
        if (footerTagline) {
            footerTagline.textContent = isEn 
                ? 'A lovely sweet bakery in District 7 - Sending love through every gentle bite.' 
                : (g.brandTagline || 'Tiệm bánh ngọt nhỏ xinh tại Quận 7 - Nơi gửi gắm yêu thương qua từng vị ngọt.');
        }

        // Social Links
        if (g.socialLinks) {
            const fbLink = document.querySelector('.social-links a:nth-child(1)');
            const instaLink = document.querySelector('.social-links a:nth-child(2)');
            const tiktokLink = document.querySelector('.social-links a:nth-child(3)');
            if (fbLink && g.socialLinks.facebook) fbLink.href = g.socialLinks.facebook;
            if (instaLink && g.socialLinks.instagram) instaLink.href = g.socialLinks.instagram;
            if (tiktokLink && g.socialLinks.tiktok) tiktokLink.href = g.socialLinks.tiktok;
        }

        // Contact Info
        const contactList = document.querySelectorAll('.footer-links')[0];
        if (contactList) {
            const items = contactList.querySelectorAll('li');
            const addrVal = isEn ? 'District 7, Ho Chi Minh City, Vietnam' : (g.address || 'Quận 7, TP. Hồ Chí Minh');
            if (items[0]) items[0].innerHTML = `<i class="fas fa-map-marker-alt"></i> ${addrVal}`;
            if (items[1] && g.hotline) items[1].innerHTML = `<i class="fas fa-phone-alt"></i> Hotline: <a href="tel:${g.hotline}" style="color:inherit; text-decoration:none;">${g.hotline}</a>`;
            if (items[2] && g.email) items[2].innerHTML = `<i class="fas fa-envelope"></i> Email: <a href="mailto:${g.email}" style="color:inherit; text-decoration:none;">${g.email}</a>`;
        }

        // Opening Hours
        const hoursList = document.querySelectorAll('.footer-links')[1];
        if (hoursList) {
            const items = hoursList.querySelectorAll('li');
            if (items[0]) items[0].textContent = isEn ? 'Mon - Fri: 08:00 AM - 10:00 PM' : (g.openingHours?.weekdays || 'Thứ 2 - Thứ 6: 08:00 - 22:00');
            if (items[1]) items[1].textContent = isEn ? 'Sat - Sun: 07:30 AM - 10:30 PM' : (g.openingHours?.weekends || 'Thứ 7 - CN: 07:30 - 22:30');
        }

        // Copyright
        const copyrightP = document.querySelector('.footer-bottom p');
        if (copyrightP) {
            copyrightP.innerHTML = `${isEn ? '&copy; 2026 Kitten Cake Bakery. Crafted by Web Specialists.' : (g.copyright || '&copy; 2026 Kitten Cake Bakery.')} • <a href="/admin" target="_blank" style="color:inherit; opacity:0.75; text-decoration:none;"><i class="fas fa-lock"></i> <span>${isEn ? 'CMS Admin' : 'Quản trị CMS'}</span></a>`;
        }
    }

    // 2. Hero Section
    if (data.hero) {
        const h = data.hero;
        const heroTitle = document.querySelector('.hero-text h1');
        if (heroTitle) {
            if (isEn) {
                heroTitle.innerHTML = `Donut Paradise <br><span class="highlight">Flat 10K VND (~$0.40)</span>`;
            } else {
                heroTitle.innerHTML = `${h.titlePart1 || 'Thiên Đường Donut'} <br><span class="highlight">${h.titleHighlight || 'Đồng Giá Chỉ 10K'}</span>`;
            }
        }

        const heroDesc = document.querySelector('.hero-text p');
        if (heroDesc) {
            if (isEn) {
                heroDesc.innerHTML = `Discover the renowned Donuts at <strong>Kitten Cake</strong> in the heart of District 7. Freshly baked, soft and fluffy daily, loaded with sweet toppings at student-friendly prices of just <strong>10,000 VND (~$0.40)</strong> each!`;
            } else {
                heroDesc.innerHTML = h.description;
            }
        }

        const heroBadge = document.querySelector('.floating-badge');
        if (heroBadge) {
            heroBadge.innerHTML = `<i class="fas fa-crown"></i> ${isEn ? 'Signature 10K Donut' : (h.badgeText || 'Donut Signature 10K')}`;
        }

        const heroImg = document.querySelector('.hero-image img');
        if (heroImg && h.image) heroImg.src = h.image;

        const btnPrimary = document.querySelector('.hero-buttons .btn-primary');
        if (btnPrimary) {
            const btnPText = isEn ? 'Explore Cake Menu' : (h.btnPrimaryText || 'Thử Ngay Donut 10K');
            btnPrimary.innerHTML = `<i class="fas fa-utensils"></i> <span>${btnPText}</span>`;
            if (h.btnPrimaryLink) btnPrimary.href = h.btnPrimaryLink;
        }

        const btnOutline = document.querySelector('.hero-buttons .btn-outline');
        if (btnOutline) {
            btnOutline.textContent = isEn ? 'Get Directions' : (h.btnOutlineText || 'Chỉ đường tới tiệm');
            if (h.btnOutlineLink) btnOutline.href = h.btnOutlineLink;
        }
    }

    // 3. Brand Strip (Cover Banner)
    if (data.brandStrip) {
        const strip = document.querySelector('.brand-strip');
        if (strip) {
            if (data.brandStrip.enabled === false) {
                strip.style.display = 'none';
            } else {
                strip.style.display = 'block';
                const img = strip.querySelector('img');
                if (img && data.brandStrip.image) img.src = data.brandStrip.image;
            }
        }
    }

    // 4. Menu Section
    if (data.menu) {
        const m = data.menu;
        const menuTitle = document.querySelector('#menu .section-title h2');
        if (menuTitle) {
            if (isEn) {
                menuTitle.innerHTML = `Signature <span class="highlight">Menu</span>`;
            } else {
                menuTitle.innerHTML = `${m.sectionTitlePart1 || 'Thực Đơn'} <span class="highlight">${m.sectionTitleHighlight || 'Signature'}</span>`;
            }
        }
        const menuDesc = document.querySelector('#menu .section-title p');
        if (menuDesc) {
            menuDesc.textContent = isEn
                ? 'Our unbeatable 10K signature donuts alongside the most sought-after sweet desserts in District 7.'
                : (m.sectionDescription || 'Món chính Donut 10K thơm ngon bất bại cùng các dòng bánh ngọt ngào được giới trẻ Quận 7 săn đón nhất.');
        }

        const menuGrid = document.querySelector('.menu-grid');
        if (menuGrid && m.items && m.items.length > 0) {
            menuGrid.innerHTML = '';
            m.items.forEach(rawItem => {
                if (rawItem.status === 'inactive') return;

                const item = isEn && window.KittenI18n ? window.KittenI18n.getTranslatedProduct(rawItem) : rawItem;
                const isPreOrder = rawItem.stockStatus === 'pre_order' || rawItem.inStock === 'pre_order' || rawItem.isPreOrder === true || item.stockStatus === 'pre_order' || item.isPreOrder === true;
                const isOutOfStock = rawItem.inStock === false || rawItem.stockStatus === 'out_of_stock' || item.inStock === false;

                const card = document.createElement('div');
                card.className = `menu-item ${item.isFeatured ? 'featured' : ''}`;

                const subtext = item.unitSubtext || (item.id === 'menu_1' 
                    ? (isEn ? 'Flat 10K (~$0.40)' : 'Đồng giá 10K') 
                    : (item.id === 'menu_3' || item.id === 'menu_4' 
                        ? (isEn ? 'Chilled Cup' : 'Bánh hũ lạnh') 
                        : (isEn ? 'Freshly Baked' : 'Bánh nướng nóng')));

                card.innerHTML = `
                    ${item.badge ? `<span class="hot-badge"><i class="fas fa-fire"></i> ${item.badge}</span>` : ''}
                    <div class="menu-img">
                        <a href="product.html?id=${item.id}">
                            <img src="${item.image}" alt="${item.name}">
                        </a>
                    </div>
                    <div class="menu-info">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                            <span class="item-tag">${item.tag || (isEn ? '🍩 Signature' : '🍩 Món Bánh')}</span>
                            ${isPreOrder ? `
                                <span class="stock-pill pre-order"><i class="fas fa-calendar-alt"></i> <span>${isEn ? 'Pre-order' : 'Đặt trước'}</span></span>
                            ` : (isOutOfStock ? `
                                <span class="stock-pill out-of-stock"><i class="fas fa-times-circle"></i> <span>${isEn ? 'Sold Out' : 'Tạm hết'}</span></span>
                            ` : '')}
                        </div>
                        <h3><a href="product.html?id=${item.id}" style="color:inherit; text-decoration:none;">${item.name}</a></h3>
                        <p>${item.description || ''}</p>
                        <div class="menu-card-bottom">
                            <div class="menu-price-row">
                                <div class="menu-price">${window.KittenI18n ? window.KittenI18n.formatMoney(item.price) : formatCurrency(item.price)}</div>
                                <span class="menu-price-subtext">${subtext}</span>
                            </div>
                            <div class="menu-card-actions">
                                <a href="product.html?id=${item.id}" class="menu-order-btn btn-view-detail" title="${isEn ? 'View Cake Details' : 'Xem chi tiết'}">
                                    <i class="fas fa-eye"></i> <span>${isEn ? 'Details' : 'Chi tiết'}</span>
                                </a>
                                ${isOutOfStock ? `
                                    <button type="button" class="menu-order-btn btn-quick-add-cart disabled" disabled style="opacity:0.6; cursor:not-allowed;" title="${isEn ? 'Out of Stock' : 'Tạm hết bánh'}">
                                        <i class="fas fa-ban"></i> <span>${isEn ? 'Sold Out' : 'Tạm hết'}</span>
                                    </button>
                                ` : (isPreOrder ? `
                                    <button type="button" class="menu-order-btn btn-quick-add-cart" data-item-id="${item.id}" title="${isEn ? 'Pre-order Cake' : 'Đặt trước bánh'}">
                                        <i class="fas fa-calendar-plus"></i> <span>${isEn ? 'Pre-order' : 'Đặt trước'}</span>
                                    </button>
                                ` : `
                                    <button type="button" class="menu-order-btn btn-quick-add-cart" data-item-id="${item.id}" title="${isEn ? 'Add to Cart' : 'Thêm vào giỏ'}">
                                        <i class="fas fa-cart-plus"></i> <span>${isEn ? 'Add to Cart' : 'Thêm giỏ'}</span>
                                    </button>
                                `)}
                            </div>
                        </div>
                    </div>
                `;
                menuGrid.appendChild(card);
            });
        }
    }

    // 5. Promo Banner
    if (data.promoBanner) {
        const p = data.promoBanner;
        const banner = document.querySelector('.donut-highlight-banner');
        if (banner) {
            if (p.enabled === false) {
                banner.style.display = 'none';
            } else {
                banner.style.display = 'flex';
                const img = banner.querySelector('.donut-highlight-img img');
                if (img && p.image) img.src = p.image;

                const title = banner.querySelector('.donut-highlight-text h3');
                if (title) {
                    title.textContent = isEn ? '🍩 Exclusive Student Offer' : p.title;
                }

                const desc = banner.querySelector('.donut-highlight-text p');
                if (desc) {
                    desc.innerHTML = isEn 
                        ? 'Buy <strong>Combo 5 Donuts and get 1 FREE</strong> (only 50,000 VND / ~$2.00 for 6 donuts) in our charming cat gift box to take home!' 
                        : p.description;
                }

                const btn = banner.querySelector('.donut-highlight-action a');
                if (btn) {
                    const btnText = isEn ? 'Order Combo Box' : (p.btnText || 'Đặt Hộp Combo Ngay');
                    btn.innerHTML = `<i class="fa-brands fa-facebook"></i> <span>${btnText}</span>`;
                    if (p.btnLink) btn.href = p.btnLink;
                }
            }
        }
    }

    // 6. Gallery Section
    if (data.gallery) {
        const g = data.gallery;
        const galTitle = document.querySelector('#gallery .section-title h2');
        if (galTitle) {
            galTitle.innerHTML = isEn 
                ? 'Sweet <span class="highlight">Moments</span>' 
                : `${g.sectionTitlePart1 || 'Khoảnh Khắc'} <span class="highlight">${g.sectionTitleHighlight || 'Ngọt Ngào'}</span>`;
        }
        const galDesc = document.querySelector('#gallery .section-title p');
        if (galDesc) {
            galDesc.textContent = isEn 
                ? 'Fresh oven batches baked daily in the Kitten Cake kitchen, District 7.' 
                : (g.sectionDescription || 'Những mẻ bánh mới ra lò mỗi ngày tại gian bếp Kitten Cake Quận 7.');
        }

        const galleryGrid = document.querySelector('.gallery-grid');
        if (galleryGrid && g.items && g.items.length > 0) {
            galleryGrid.innerHTML = '';
            g.items.forEach(item => {
                let overlayText = item.overlay || 'Bánh mới nướng mỗi ngày';
                if (isEn) {
                    if (overlayText.includes('Donut 6') || overlayText.includes('Hộp quà')) overlayText = 'Charming 6-Flavor Donut Box';
                    else if (overlayText.includes('Tart trứng')) overlayText = 'Crispy Multi-Layer Hot Egg Tart';
                    else if (overlayText.includes('Oreo Cheesecake')) overlayText = 'Convenient Oreo Cheesecake Cup';
                    else if (overlayText.includes('Panna Cotta')) overlayText = 'Refreshing Berry Panna Cotta';
                    else overlayText = 'Freshly Baked Daily Pastry';
                }
                const itemDiv = document.createElement('div');
                itemDiv.className = 'gallery-item';
                itemDiv.innerHTML = `
                    <img src="${item.image}" alt="${overlayText}">
                    <div class="gallery-overlay">${overlayText}</div>
                `;
                galleryGrid.appendChild(itemDiv);
            });
        }
    }

    // 7. About Us Section
    if (data.about) {
        const a = data.about;
        const aboutTitle = document.querySelector('.about-text h2');
        if (aboutTitle) {
            aboutTitle.innerHTML = isEn 
                ? 'About <span class="highlight">Kitten Cake</span>' 
                : `${a.sectionTitlePart1 || 'Về'} <span class="highlight">${a.sectionTitleHighlight || 'Kitten Cake'}</span>`;
        }
        const aboutPs = document.querySelectorAll('.about-text > p');
        if (aboutPs[0]) {
            aboutPs[0].innerHTML = isEn 
                ? 'Tucked away in a tranquil corner of District 7, Kitten Cake provides the coziest sweet spot for youth and dessert lovers in Saigon.' 
                : a.paragraph1;
        }
        if (aboutPs[1]) {
            aboutPs[1].innerHTML = isEn 
                ? 'We are renowned for our <strong>signature 10K donuts freshly baked daily</strong>, soft, fluffy, and packed with delightful flavors. With our cute lazy cat emblem, Kitten Cake brings joy and sweetness at wallet-friendly student prices.' 
                : a.paragraph2;
        }

        const aboutImg = document.querySelector('.about-image img');
        if (aboutImg && a.image) aboutImg.src = a.image;

        const featList = document.querySelector('.about-features');
        if (featList) {
            featList.innerHTML = '';
            const feats = isEn ? [
                'Freshly baked daily donuts, flat 10K VND (~$0.40)',
                'Selected French & New Zealand ingredients, delicate sweetness',
                'Fast delivery across District 7 and Ho Chi Minh City',
                'Packaged in clean, adorable, and eco-friendly cat boxes'
            ] : (a.features || [
                'Donut nướng mới trong ngày, đồng giá chỉ 10K',
                'Nguyên liệu chọn lọc chuẩn Pháp & New Zealand',
                'Giao hàng nhanh tận tay toàn Quận 7 và TP.HCM',
                'Đóng gói hộp mèo xinh xắn, sạch sẽ và thân thiện'
            ]);

            feats.forEach(feat => {
                const li = document.createElement('li');
                li.innerHTML = `<i class="fas fa-check-circle"></i> ${feat}`;
                featList.appendChild(li);
            });
        }
    }

    // 8. Latest Blog Articles on index.html
    if (data.articles) {
        const blogCards = document.querySelectorAll('.blog-grid .blog-card');
        if (blogCards.length > 0) {
            data.articles.slice(0, 3).forEach((art, idx) => {
                const card = blogCards[idx];
                if (!card) return;
                const tArt = isEn && window.KittenI18n ? window.KittenI18n.getTranslatedArticle(art) : art;
                const catBadge = card.querySelector('.blog-card-category');
                if (catBadge) catBadge.textContent = tArt.categoryName || (isEn ? 'Baking Tips' : 'Mẹo Bánh');
                const titleLink = card.querySelector('.blog-card-title a');
                if (titleLink) titleLink.textContent = tArt.title;
                const excerptP = card.querySelector('.blog-card-excerpt');
                if (excerptP) excerptP.textContent = tArt.excerpt;
                const readTimeSpan = card.querySelector('.blog-meta span:nth-child(2)');
                if (readTimeSpan) readTimeSpan.innerHTML = `<i class="fas fa-clock"></i> ${tArt.readTime || (isEn ? '3 min read' : '3 phút đọc')}`;
            });
        }
    }

    // Áp dụng ngôn ngữ hiện tại lên DOM
    if (window.KittenI18n && window.KittenI18n.applyTranslations) {
        window.KittenI18n.applyTranslations();
    }
}

// Lắng nghe sự kiện chuyển đổi ngôn ngữ để re-render dữ liệu ngay tức thì
window.addEventListener('languageChanged', () => {
    if (currentSiteContent) {
        applyContentToDOM(currentSiteContent);
    }
    if (window.KittenI18n && window.KittenI18n.applyTranslations) {
        window.KittenI18n.applyTranslations();
    }
});

// Discreet Quick Admin Access Float Button
function setupAdminShortcut() {
    const floatBtn = document.createElement('a');
    floatBtn.href = '/admin/';
    floatBtn.target = '_blank';
    floatBtn.className = 'admin-shortcut-badge';
    floatBtn.title = 'Mở Trang Quản Trị Website Kitten Cake CMS';
    floatBtn.innerHTML = `<i class="fas fa-cog"></i> <span>Quản trị CMS</span>`;

    const style = document.createElement('style');
    style.textContent = `
        .admin-shortcut-badge {
            position: fixed;
            bottom: 24px;
            right: 24px;
            background: linear-gradient(135deg, #ff6b81 0%, #ff4757 100%);
            color: #ffffff;
            padding: 10px 18px;
            border-radius: 30px;
            font-family: 'Quicksand', sans-serif;
            font-size: 13px;
            font-weight: 700;
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 6px 20px rgba(255, 71, 87, 0.4);
            z-index: 999;
            transition: all 0.25s ease;
            opacity: 0.85;
        }
        .admin-shortcut-badge:hover {
            opacity: 1;
            transform: translateY(-3px) scale(1.05);
            box-shadow: 0 8px 25px rgba(255, 71, 87, 0.6);
            color: #ffffff;
        }
        .admin-shortcut-badge i {
            font-size: 15px;
            animation: spinCog 6s linear infinite;
        }
        @keyframes spinCog {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(floatBtn);
}

// ---------------- QUICK ORDER MODAL LOGIC ----------------
let currentSelectedOrderItem = null;

function setupQuickOrderModal(siteData) {
    const modal = document.getElementById('quickOrderModal');
    if (!modal) return;

    const closeBtn = document.getElementById('btnCloseOrderModal');
    const form = document.getElementById('quickOrderForm');
    const statusMsg = document.getElementById('orderStatusMessage');
    const submitBtn = document.getElementById('btnSubmitOrder');

    function openModalWithItem(item) {
        currentSelectedOrderItem = item;
        const thumb = document.getElementById('orderItemThumb');
        const nameEl = document.getElementById('orderItemName');
        const tagEl = document.getElementById('orderItemTag');
        const priceEl = document.getElementById('orderItemPrice');

        if (thumb) thumb.src = item.image || 'tai-nguyen/donut-signature.jpg';
        if (nameEl) nameEl.textContent = item.name || 'Donut Kitten Cake';
        if (tagEl) tagEl.textContent = item.tag || '🍩 Món Bánh';
        if (priceEl) priceEl.textContent = formatCurrency(item.price || 10000);

        const fbLink = item.orderLink || siteData?.general?.orderButtonLink || 'https://www.facebook.com/profile.php?id=61594490844705';
        const fbBtn = document.getElementById('btnOrderFbLink');
        if (fbBtn) fbBtn.href = fbLink;

        if (statusMsg) {
            statusMsg.style.display = 'none';
            statusMsg.className = 'order-status-msg';
            statusMsg.textContent = '';
        }

        modal.style.display = 'flex';
    }

    function closeModal() {
        modal.style.display = 'none';
        if (form) form.reset();
        const qtyInput = document.getElementById('orderQty');
        if (qtyInput) qtyInput.value = '1';
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Delegate click on buttons
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-open-order');
        if (btn) {
            e.preventDefault();
            const itemId = btn.getAttribute('data-item-id');
            const items = siteData?.menu?.items || [];
            const item = items.find(i => i.id === itemId) || {
                name: 'Donut Signature 10K',
                price: 10000,
                tag: '🍩 Món Signature',
                image: 'tai-nguyen/donut-signature.jpg'
            };
            openModalWithItem(item);
        }
    });

    // Flavor selection pill listener
    document.querySelectorAll('.flavor-radio-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            document.querySelectorAll('.flavor-radio-pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            const r = pill.querySelector('input[type="radio"]');
            if (r) r.checked = true;
        });
    });

    // Payment radio listener in quick modal
    const payRadios = document.querySelectorAll('input[name="quickPayment"]');
    const quickQrBox = document.getElementById('quickVietqrBox');
    payRadios.forEach(r => {
        r.addEventListener('change', () => {
            document.querySelectorAll('.quick-pay-opt').forEach(opt => {
                opt.style.background = '#fff';
                opt.style.borderColor = '#eee';
            });
            const parent = r.closest('.quick-pay-opt');
            if (parent) {
                parent.style.background = '#fff5f7';
                parent.style.borderColor = '#ffccd5';
            }
            if (quickQrBox) {
                quickQrBox.style.display = r.value === 'banking' ? 'block' : 'none';
            }
        });
    });

    // Submit form
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const customerName = document.getElementById('orderCustomerName').value.trim();
            const phone = document.getElementById('orderPhone').value.trim();
            const qty = parseInt(document.getElementById('orderQty').value, 10) || 1;
            const note = document.getElementById('orderNote').value.trim();
            const paymentMethod = document.querySelector('input[name="quickPayment"]:checked')?.value || 'cod';

            if (!customerName || !phone) {
                if (statusMsg) {
                    statusMsg.className = 'order-status-msg error';
                    statusMsg.textContent = 'Vui lòng nhập họ tên và số điện thoại!';
                    statusMsg.style.display = 'block';
                }
                return;
            }

            const chosenFlavor = document.querySelector('input[name="quickFlavor"]:checked')?.value || 'Chocolate';
            const unitPrice = currentSelectedOrderItem?.price || 10000;
            const subtotal = unitPrice * qty;
            const total = subtotal;

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang gửi đơn...';

            const payload = {
                customerName,
                phone,
                note: `${note ? note + ' | ' : ''}Hương vị: ${chosenFlavor} | SL: ${qty} cái | HT: ${paymentMethod === 'banking' ? 'Chuyển khoản VPBank' : 'COD'}`,
                paymentMethod,
                subtotal,
                total,
                items: [{
                    name: currentSelectedOrderItem?.name || 'Bánh Kitten Cake',
                    price: unitPrice,
                    flavor: chosenFlavor,
                    quantity: qty
                }]
            };

            try {
                const res = await fetch('/api/orders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const data = await res.json();
                if (res.ok && data.success) {
                    statusMsg.className = 'order-status-msg success';
                    const payMsg = paymentMethod === 'banking' ? ' Đã lưu đơn hàng! Vui lòng quét mã QR chuyển khoản theo thông tin phía trên.' : ' Kitten Cake sẽ gọi lại cho bạn sớm nhất.';
                    statusMsg.innerHTML = `<i class="fas fa-check-circle"></i> <b>Đặt bánh thành công!</b> #${data.orderId || ''}${payMsg}`;
                    statusMsg.style.display = 'block';
                    form.reset();
                    setTimeout(() => {
                        closeModal();
                    }, paymentMethod === 'banking' ? 5000 : 2500);
                } else {
                    throw new Error(data.error || 'Có lỗi xảy ra khi gửi đơn');
                }
            } catch (err) {
                // Fallback offline
                console.warn('Gửi API nhanh thất bại, lưu fallback offline:', err);
                const localId = 'ord_' + Date.now().toString().slice(-6);
                const fallbackOrder = Object.assign({ id: localId, status: 'pending', createdAt: new Date().toISOString() }, payload);
                try {
                    const rawList = localStorage.getItem('kitten_offline_orders');
                    const list = rawList ? JSON.parse(rawList) : [];
                    list.unshift(fallbackOrder);
                    localStorage.setItem('kitten_offline_orders', JSON.stringify(list));
                } catch(e) {}

                statusMsg.className = 'order-status-msg success';
                const payMsg = paymentMethod === 'banking' ? ' Vui lòng quét mã QR chuyển khoản theo thông tin phía trên nhé.' : ' Tiệm sẽ gọi lại xác nhận ngay!';
                statusMsg.innerHTML = `<i class="fas fa-check-circle"></i> <b>Đặt bánh thành công!</b> #${localId}.${payMsg}`;
                statusMsg.style.display = 'block';
                form.reset();
                setTimeout(() => {
                    closeModal();
                }, paymentMethod === 'banking' ? 5000 : 2500);
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Gửi đơn đặt bánh';
            }
        });
    }
}

// Lắng nghe sự kiện Thêm Giỏ Hàng Nhanh từ thẻ sản phẩm
function setupQuickCartListener() {
    document.addEventListener('click', (e) => {
        const quickAddBtn = e.target.closest('.btn-quick-add-cart');
        if (quickAddBtn) {
            e.preventDefault();
            const itemId = quickAddBtn.getAttribute('data-item-id');
            const items = currentSiteContent?.menu?.items || [];
            const item = items.find(i => i.id === itemId);

            if (item) {
                let flavorName = 'Vị Chuẩn Signature';
                let itemImage = item.image || 'tai-nguyen/donut-choco.jpg';
                if (item.flavors && item.flavors.length > 0) {
                    const f0 = item.flavors[0];
                    if (typeof f0 === 'string') {
                        flavorName = f0;
                    } else if (f0 && f0.name) {
                        flavorName = f0.name;
                        if (f0.image) itemImage = f0.image;
                    }
                }

                if (window.KittenCart) {
                    window.KittenCart.addItem({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        flavor: flavorName,
                        toppings: [],
                        image: itemImage,
                        quantity: 1
                    }, true);
                }
            }
        }
    });
}


