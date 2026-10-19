// Kitten Cake - Article Detail Controller
let currentArticle = null;
let currentFeaturedProduct = null;

document.addEventListener('DOMContentLoaded', () => {
    initPostDetail();
    setupPostEvents();
    updateCartBadge();
});

function formatCurrency(amount) {
    if (isNaN(amount)) return '0đ';
    if (window.KittenI18n && typeof window.KittenI18n.formatMoney === 'function') {
        return window.KittenI18n.formatMoney(amount);
    }
    return Number(amount).toLocaleString('vi-VN') + 'đ';
}

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

async function initPostDetail() {
    const params = new URLSearchParams(window.location.search);
    const postParam = params.get('id') || params.get('slug') || 'art_1';

    let localData = null;
    let localTime = 0;
    const savedLocal = localStorage.getItem('kitten_site_data');
    if (savedLocal) {
        try {
            localData = JSON.parse(savedLocal);
            localTime = parseInt(localStorage.getItem('kitten_site_data_time') || '0', 10);
        } catch(e) {}
    }

    let loadedFromApi = false;
    try {
        const res = await fetch(`/api/articles/${postParam}?_t=` + Date.now(), { cache: 'no-store' });
        if (res.ok) {
            const json = await res.json();
            if (!localData || localTime <= (json.updatedAt || 0)) {
                currentArticle = json.data;
                currentFeaturedProduct = json.featuredProduct;
                window._currentRelatedArticles = json.related;
                renderArticle(currentArticle, json.related);
                loadedFromApi = true;
            }
        }
    } catch (e) {
        console.warn('API error, fallback to local content.json');
    }

    if (!loadedFromApi) {
        let data = localData;
        if (!data) {
            try {
                const resLocal = await fetch('data/content.json?_t=' + Date.now(), { cache: 'no-store' });
                if (resLocal.ok) data = await resLocal.json();
            } catch (e) {
                console.error('Cannot load local data');
            }
        }

        if (data && data.articles) {
            currentArticle = data.articles.find(a => a.id === postParam || a.slug === postParam) || data.articles[0];
            if (currentArticle && currentArticle.featuredProductId && data.menu?.items) {
                currentFeaturedProduct = data.menu.items.find(p => p.id === currentArticle.featuredProductId);
            }
            const related = data.articles.filter(a => a.id !== currentArticle?.id).slice(0, 3);
            window._currentRelatedArticles = related;
            renderArticle(currentArticle, related);
        }
    }

    window.addEventListener('storage', (e) => {
        if (e.key === 'kitten_site_data' || e.key === 'kitten_site_data_event') {
            const raw = localStorage.getItem('kitten_site_data');
            if (raw) {
                try {
                    const fresh = JSON.parse(raw);
                    if (fresh && fresh.articles) {
                        const updatedArt = fresh.articles.find(a => a.id === postParam || a.slug === postParam);
                        if (updatedArt) {
                            currentArticle = updatedArt;
                            if (currentArticle.featuredProductId && fresh.menu?.items) {
                                currentFeaturedProduct = fresh.menu.items.find(p => p.id === currentArticle.featuredProductId);
                            }
                            const related = fresh.articles.filter(a => a.id !== currentArticle.id).slice(0, 3);
                            renderArticle(currentArticle, related);
                        }
                    }
                } catch(err) {}
            }
        }
    });

    window.addEventListener('siteContentUpdated', () => {
        const raw = localStorage.getItem('kitten_site_data');
        if (raw) {
            try {
                const fresh = JSON.parse(raw);
                if (fresh && fresh.articles) {
                    const updatedArt = fresh.articles.find(a => a.id === postParam || a.slug === postParam);
                    if (updatedArt) {
                        currentArticle = updatedArt;
                        if (currentArticle.featuredProductId && fresh.menu?.items) {
                            currentFeaturedProduct = fresh.menu.items.find(p => p.id === currentArticle.featuredProductId);
                        }
                        const related = fresh.articles.filter(a => a.id !== currentArticle.id).slice(0, 3);
                        renderArticle(currentArticle, related);
                    }
                }
            } catch(err) {}
        }
    });
}

function renderArticle(rawArt, related) {
    if (!rawArt) return;

    window._currentRelatedArticles = related;
    const isEn = window.KittenI18n && window.KittenI18n.getLang() === 'en';
    const art = isEn && window.KittenI18n ? window.KittenI18n.getTranslatedArticle(rawArt) : rawArt;

    document.title = `${art.title} - Kitten Cake Bakery`;

    const bcTitle = document.getElementById('postBreadcrumbTitle');
    if (bcTitle) bcTitle.textContent = art.title;

    const catBadge = document.getElementById('postCategoryBadge');
    if (catBadge) {
        catBadge.textContent = art.categoryName || (isEn ? 'Baking Tips' : 'Mẹo Bánh');
    }

    const titleEl = document.getElementById('postTitle');
    if (titleEl) titleEl.textContent = art.title;

    const dateEl = document.getElementById('postPublishDate');
    if (dateEl) dateEl.textContent = art.publishDate || '';

    const authorEl = document.getElementById('postAuthor');
    if (authorEl) authorEl.textContent = art.author || 'Kitten Cake';

    const readTimeEl = document.getElementById('postReadTime');
    if (readTimeEl) {
        readTimeEl.textContent = art.readTime || (isEn ? '3 min read' : '3 phút đọc');
    }

    const viewsEl = document.getElementById('postViews');
    if (viewsEl) viewsEl.textContent = (art.views || 250);

    const coverImg = document.getElementById('postCoverImg');
    if (coverImg && art.coverImage) coverImg.src = art.coverImage;

    const contentBody = document.getElementById('postContentBody');
    if (contentBody) contentBody.innerHTML = art.content || '';

    // Render Shoppable Product inside article
    const shoppableBox = document.getElementById('postShoppableBox');
    if (shoppableBox && currentFeaturedProduct) {
        shoppableBox.style.display = 'flex';
        const tProd = isEn && window.KittenI18n ? window.KittenI18n.getTranslatedProduct(currentFeaturedProduct) : currentFeaturedProduct;
        const img = document.getElementById('shoppableImg');
        const name = document.getElementById('shoppableName');
        const price = document.getElementById('shoppablePrice');
        const detailLink = document.getElementById('shoppableDetailLink');
        const addBtn = document.getElementById('shoppableAddCartBtn');

        if (img) img.src = currentFeaturedProduct.image;
        if (name) name.textContent = tProd.name;
        if (price) price.textContent = window.KittenI18n ? window.KittenI18n.formatMoney(currentFeaturedProduct.price) : formatCurrency(currentFeaturedProduct.price);
        if (detailLink) {
            detailLink.href = `product.html?id=${currentFeaturedProduct.id}`;
            detailLink.textContent = isEn ? 'View Cake Details' : 'Xem chi tiết bánh';
        }

        if (addBtn) {
            addBtn.innerHTML = `<i class="fas fa-cart-plus"></i> <span>${isEn ? 'Order Delivery Now' : 'Đặt giao ngay'}</span>`;
            addBtn.onclick = () => {
                addToCartQuick(currentFeaturedProduct);
                showToast(isEn ? `Added ${tProd.name} to cart!` : `Đã thêm ${currentFeaturedProduct.name} vào giỏ hàng!`, 'success');
                updateCartBadge();
            };
        }
    }

    // Render Tags
    const tagsContainer = document.getElementById('postTagsList');
    if (tagsContainer && art.tags) {
        tagsContainer.innerHTML = '';
        art.tags.forEach(t => {
            const span = document.createElement('span');
            span.style.cssText = 'background:#fcebed; color:#f6416c; padding:4px 10px; border-radius:12px; font-size:0.8rem; font-weight:700;';
            span.textContent = `#${t}`;
            tagsContainer.appendChild(span);
        });
    }

    // Render Related Articles
    const relatedContainer = document.getElementById('relatedArticlesList');
    if (relatedContainer && related && related.length > 0) {
        relatedContainer.innerHTML = '';
        related.forEach(rawR => {
            const r = isEn && window.KittenI18n ? window.KittenI18n.getTranslatedArticle(rawR) : rawR;
            const item = document.createElement('div');
            item.style.cssText = 'display:flex; gap:12px; align-items:center;';
            item.innerHTML = `
                <img src="${r.coverImage}" alt="${r.title}" style="width:70px; height:70px; object-fit:cover; border-radius:10px; flex-shrink:0;">
                <div>
                    <h4 style="font-size:0.92rem; margin:0 0 4px 0; line-height:1.4;">
                        <a href="post.html?id=${rawR.id}" style="color:#222; text-decoration:none; transition:color 0.2s;">${r.title}</a>
                    </h4>
                    <span style="font-size:0.75rem; color:#888;"><i class="fas fa-calendar-alt"></i> ${r.publishDate}</span>
                </div>
            `;
            relatedContainer.appendChild(item);
        });
    }
}

function addToCartQuick(prod) {
    if (window.KittenCart && typeof window.KittenCart.addItem === 'function') {
        window.KittenCart.addItem({
            id: prod.id,
            name: prod.name,
            flavor: (prod.flavors && prod.flavors.length > 0) ? prod.flavors[0].name : 'Vị Tiêu Chuẩn',
            price: Number(prod.price),
            quantity: 1,
            image: prod.image
        }, false);
        return;
    }

    try {
        const raw = localStorage.getItem('kitten_cart_v2');
        const cart = raw ? JSON.parse(raw) : [];
        const flavor = (prod.flavors && prod.flavors.length > 0) ? prod.flavors[0].name : 'Vị Tiêu Chuẩn';
        const existing = cart.find(c => c.id === prod.id && c.flavor === flavor);
        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({
                id: prod.id,
                name: prod.name,
                flavor,
                price: Number(prod.price),
                basePrice: Number(prod.price),
                quantity: 1,
                image: prod.image
            });
        }
        localStorage.setItem('kitten_cart_v2', JSON.stringify(cart));
    } catch (e) {
        console.error(e);
    }
}

function setupPostEvents() {
    const copyBtn = document.getElementById('btnCopyPostLink');
    if (copyBtn) {
        copyBtn.onclick = () => {
            navigator.clipboard.writeText(window.location.href);
            showToast('Đã sao chép liên kết bài viết!', 'success');
        };
    }

    const openMiniCartBtn = document.getElementById('openMiniCartBtn');
    if (openMiniCartBtn) {
        openMiniCartBtn.onclick = () => window.location.href = 'cart.html';
    }

    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');
    if (mobileBtn && nav) {
        mobileBtn.addEventListener('click', () => {
            nav.classList.toggle('active');
        });
    }
}

// Lắng nghe sự kiện chuyển đổi ngôn ngữ để render lại tức thời
window.addEventListener('languageChanged', () => {
    if (currentArticle) {
        renderArticle(currentArticle, window._currentRelatedArticles);
    }
    if (window.KittenI18n && typeof window.KittenI18n.applyTranslations === 'function') {
        window.KittenI18n.applyTranslations();
    }
});
