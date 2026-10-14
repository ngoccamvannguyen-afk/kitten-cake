// Kitten Cake - Frontend Dynamic Engine
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
        const res = await fetch('/api/content');
        if (res.ok) {
            const json = await res.json();
            content = json.data;
        }
    } catch (e) {
        console.warn('API /api/content not reachable, trying local JSON file...');
    }

    if (!content) {
        try {
            const resLocal = await fetch('data/content.json');
            if (resLocal.ok) {
                content = await resLocal.json();
            }
        } catch (e) {
            console.warn('Local data file not loaded, falling back to static HTML content.');
        }
    }

    if (content) {
        applyContentToDOM(content);
    }

    // Show quick admin button if logged in
    setupAdminShortcut();
}

function applyContentToDOM(data) {
    // 1. General & Header
    if (data.general) {
        const g = data.general;
        if (g.siteTitle) document.title = g.siteTitle;

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
            if (g.orderButtonText) headerBtn.innerHTML = `<i class="fa-brands fa-facebook"></i> ${g.orderButtonText}`;
            if (g.orderButtonLink) headerBtn.href = g.orderButtonLink;
        }

        // Footer Tagline & Contact
        const footerTagline = document.querySelector('.footer-brand p');
        if (footerTagline && g.brandTagline) footerTagline.textContent = g.brandTagline;

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
            if (items[0] && g.address) items[0].innerHTML = `<i class="fas fa-map-marker-alt"></i> ${g.address}`;
            if (items[1] && g.hotline) items[1].innerHTML = `<i class="fas fa-phone-alt"></i> Hotline: ${g.hotline}`;
            if (items[2] && g.email) items[2].innerHTML = `<i class="fas fa-envelope"></i> Email: ${g.email}`;
        }

        // Opening Hours
        const hoursList = document.querySelectorAll('.footer-links')[1];
        if (hoursList && g.openingHours) {
            const items = hoursList.querySelectorAll('li');
            if (items[0] && g.openingHours.weekdays) items[0].textContent = g.openingHours.weekdays;
            if (items[1] && g.openingHours.weekends) items[1].textContent = g.openingHours.weekends;
        }

        // Copyright
        const copyrightP = document.querySelector('.footer-bottom p');
        if (copyrightP && g.copyright) copyrightP.textContent = g.copyright;
    }

    // 2. Hero Section
    if (data.hero) {
        const h = data.hero;
        const heroTitle = document.querySelector('.hero-text h1');
        if (heroTitle) {
            heroTitle.innerHTML = `${h.titlePart1 || 'Thiên Đường Donut'} <br><span class="highlight">${h.titleHighlight || 'Đồng Giá Chỉ 10K'}</span>`;
        }

        const heroDesc = document.querySelector('.hero-text p');
        if (heroDesc && h.description) heroDesc.innerHTML = h.description;

        const heroBadge = document.querySelector('.floating-badge');
        if (heroBadge && h.badgeText) {
            heroBadge.innerHTML = `<i class="fas fa-crown"></i> ${h.badgeText}`;
        }

        const heroImg = document.querySelector('.hero-image img');
        if (heroImg && h.image) heroImg.src = h.image;

        const btnPrimary = document.querySelector('.hero-buttons .btn-primary');
        if (btnPrimary) {
            if (h.btnPrimaryText) btnPrimary.innerHTML = `<i class="fas fa-utensils"></i> ${h.btnPrimaryText}`;
            if (h.btnPrimaryLink) btnPrimary.href = h.btnPrimaryLink;
        }

        const btnOutline = document.querySelector('.hero-buttons .btn-outline');
        if (btnOutline) {
            if (h.btnOutlineText) btnOutline.textContent = h.btnOutlineText;
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
            menuTitle.innerHTML = `${m.sectionTitlePart1 || 'Thực Đơn'} <span class="highlight">${m.sectionTitleHighlight || 'Signature'}</span>`;
        }
        const menuDesc = document.querySelector('#menu .section-title p');
        if (menuDesc && m.sectionDescription) menuDesc.textContent = m.sectionDescription;

        const menuGrid = document.querySelector('.menu-grid');
        if (menuGrid && m.items && m.items.length > 0) {
            menuGrid.innerHTML = '';
            m.items.forEach(item => {
                if (item.status === 'inactive') return; // Skip inactive items

                const card = document.createElement('div');
                card.className = `menu-item ${item.isFeatured ? 'featured' : ''}`;

                card.innerHTML = `
                    ${item.badge ? `<span class="hot-badge"><i class="fas fa-fire"></i> ${item.badge}</span>` : ''}
                    <div class="menu-img">
                        <img src="${item.image}" alt="${item.name}">
                    </div>
                    <div class="menu-info">
                        <span class="item-tag">${item.tag || '🍩 Món Bánh'}</span>
                        <h3>${item.name}</h3>
                        <p>${item.description || ''}</p>
                        <div class="menu-card-bottom">
                            <div class="menu-price">${formatCurrency(item.price)}</div>
                            <a href="${item.orderLink || 'https://www.facebook.com/profile.php?id=61594490844705'}" target="_blank" class="menu-order-btn">
                                <i class="fas fa-cart-plus"></i> Đặt ngay
                            </a>
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
                if (title && p.title) title.textContent = p.title;

                const desc = banner.querySelector('.donut-highlight-text p');
                if (desc && p.description) desc.innerHTML = p.description;

                const btn = banner.querySelector('.donut-highlight-action a');
                if (btn) {
                    if (p.btnText) btn.innerHTML = `<i class="fa-brands fa-facebook"></i> ${p.btnText}`;
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
            galTitle.innerHTML = `${g.sectionTitlePart1 || 'Khoảnh Khắc'} <span class="highlight">${g.sectionTitleHighlight || 'Ngọt Ngào'}</span>`;
        }
        const galDesc = document.querySelector('#gallery .section-title p');
        if (galDesc && g.sectionDescription) galDesc.textContent = g.sectionDescription;

        const galleryGrid = document.querySelector('.gallery-grid');
        if (galleryGrid && g.items && g.items.length > 0) {
            galleryGrid.innerHTML = '';
            g.items.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'gallery-item';
                itemDiv.innerHTML = `
                    <img src="${item.image}" alt="${item.overlay || 'Bánh ngọt Kitten Cake'}">
                    <div class="gallery-overlay">${item.overlay || 'Bánh mới nướng mỗi ngày'}</div>
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
            aboutTitle.innerHTML = `${a.sectionTitlePart1 || 'Về'} <span class="highlight">${a.sectionTitleHighlight || 'Kitten Cake'}</span>`;
        }
        const aboutPs = document.querySelectorAll('.about-text > p');
        if (aboutPs[0] && a.paragraph1) aboutPs[0].innerHTML = a.paragraph1;
        if (aboutPs[1] && a.paragraph2) aboutPs[1].innerHTML = a.paragraph2;

        const aboutImg = document.querySelector('.about-image img');
        if (aboutImg && a.image) aboutImg.src = a.image;

        const featList = document.querySelector('.about-features');
        if (featList && a.features && a.features.length > 0) {
            featList.innerHTML = '';
            a.features.forEach(feat => {
                const li = document.createElement('li');
                li.innerHTML = `<i class="fas fa-check-circle"></i> ${feat}`;
                featList.appendChild(li);
            });
        }
    }
}

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
