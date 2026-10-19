// Kitten Cake - Blog Controller
let allArticles = [];
let allBlogCategories = [];
let activeBlogCategory = 'all';
let currentSearchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
    initBlog();
    setupBlogEvents();
    updateCartBadge();
});

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

async function initBlog() {
    let data = null;
    let localTime = 0;
    const savedLocal = localStorage.getItem('kitten_site_data');
    if (savedLocal) {
        try {
            data = JSON.parse(savedLocal);
            localTime = parseInt(localStorage.getItem('kitten_site_data_time') || '0', 10);
        } catch(e) {}
    }

    try {
        const res = await fetch('/api/content?_t=' + Date.now(), { cache: 'no-store' });
        if (res.ok) {
            const json = await res.json();
            const apiTime = json.updatedAt || 0;
            if (!data || apiTime >= localTime) {
                data = json.data;
            }
        }
    } catch (e) {
        console.warn('Cannot fetch from /api/content');
    }

    if (!data) {
        try {
            const resLocal = await fetch('data/content.json?_t=' + Date.now(), { cache: 'no-store' });
            if (resLocal.ok) data = await resLocal.json();
        } catch (e) {
            console.error('Cannot load local data');
        }
    }

    if (data) {
        allBlogCategories = data.blogCategories || [];
        allArticles = data.articles || [];

        // Check URL params
        const params = new URLSearchParams(window.location.search);
        const cat = params.get('category');
        if (cat) activeBlogCategory = cat;

        renderBlogCategories();
        applyBlogFilters();
    }

    // Lắng nghe cập nhật từ trang quản trị
    window.addEventListener('storage', (e) => {
        if (e.key === 'kitten_site_data' || e.key === 'kitten_site_data_event') {
            const raw = localStorage.getItem('kitten_site_data');
            if (raw) {
                try {
                    const fresh = JSON.parse(raw);
                    if (fresh) {
                        allBlogCategories = fresh.blogCategories || [];
                        allArticles = fresh.articles || [];
                        renderBlogCategories();
                        applyBlogFilters();
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
                if (fresh) {
                    allBlogCategories = fresh.blogCategories || [];
                    allArticles = fresh.articles || [];
                    renderBlogCategories();
                    applyBlogFilters();
                }
            } catch(err) {}
        }
    });
}

function renderBlogCategories() {
    const container = document.getElementById('blogCategoryChips');
    if (!container) return;

    // Remove existing dynamic chips
    container.querySelectorAll('.category-chip:not([data-category="all"])').forEach(el => el.remove());

    const isEn = window.KittenI18n?.getLang() === 'en';

    allBlogCategories.forEach(rawCat => {
        const cat = window.KittenI18n ? window.KittenI18n.getTranslatedBlogCategory(rawCat) : rawCat;
        const chip = document.createElement('button');
        chip.className = `category-chip ${activeBlogCategory === rawCat.id ? 'active' : ''}`;
        chip.setAttribute('data-category', rawCat.id);
        chip.innerHTML = `<i class="fas ${cat.icon || 'fa-tag'}"></i> ${cat.name}`;
        chip.addEventListener('click', () => {
            selectBlogCategory(rawCat.id);
        });
        container.appendChild(chip);
    });

    const allChip = container.querySelector('[data-category="all"]');
    if (allChip) {
        allChip.classList.toggle('active', activeBlogCategory === 'all');
        allChip.onclick = () => selectBlogCategory('all');
    }
}

function selectBlogCategory(catId) {
    activeBlogCategory = catId;
    document.querySelectorAll('#blogCategoryChips .category-chip').forEach(chip => {
        chip.classList.toggle('active', chip.getAttribute('data-category') === catId);
    });
    applyBlogFilters();
}

function resetBlogFilters() {
    activeBlogCategory = 'all';
    currentSearchQuery = '';
    const input = document.getElementById('blogSearchInput');
    if (input) input.value = '';

    document.querySelectorAll('#blogCategoryChips .category-chip').forEach(chip => {
        chip.classList.toggle('active', chip.getAttribute('data-category') === 'all');
    });

    applyBlogFilters();
}

function applyBlogFilters() {
    let filtered = [...allArticles];

    // Filter by Category
    if (activeBlogCategory && activeBlogCategory !== 'all') {
        filtered = filtered.filter(a => a.categoryId === activeBlogCategory);
    }

    // Filter by Search Query
    if (currentSearchQuery.trim()) {
        const q = currentSearchQuery.toLowerCase().trim();
        filtered = filtered.filter(a =>
            a.title.toLowerCase().includes(q) ||
            (a.excerpt && a.excerpt.toLowerCase().includes(q)) ||
            (a.content && a.content.toLowerCase().includes(q))
        );
    }

    renderFeaturedBanner(filtered);
    renderBlogGrid(filtered);
}

function renderFeaturedBanner(articles) {
    const banner = document.getElementById('featuredArticleBanner');
    if (!banner) return;

    if (articles.length === 0 || activeBlogCategory !== 'all' || currentSearchQuery.trim()) {
        banner.style.display = 'none';
        return;
    }

    const isEn = window.KittenI18n?.getLang() === 'en';
    const rawFeatured = articles[0];
    const featured = isEn && window.KittenI18n ? window.KittenI18n.getTranslatedArticle(rawFeatured) : rawFeatured;
    banner.style.display = 'block';
    banner.innerHTML = `
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); align-items:center;">
            <div style="height:320px; overflow:hidden;">
                <img src="${featured.coverImage}" alt="${featured.title}" style="width:100%; height:100%; object-fit:cover;">
            </div>
            <div style="padding: 35px 30px;">
                <span class="post-header-badge"><i class="fas fa-crown"></i> ${isEn ? 'Featured Article' : 'Bài Viết Nổi Bật'}</span>
                <h2 style="font-size:1.6rem; margin-bottom:12px; line-height:1.4;">
                    <a href="post.html?id=${rawFeatured.id}" style="color:#222; text-decoration:none;">${featured.title}</a>
                </h2>
                <div class="blog-meta" style="margin-bottom:14px;">
                    <span><i class="fas fa-calendar-alt"></i> ${featured.publishDate}</span>
                    <span><i class="fas fa-user-edit"></i> ${featured.author || 'Kitten Cake'}</span>
                    <span><i class="fas fa-clock"></i> ${featured.readTime || (isEn ? '3 min read' : '3 phút đọc')}</span>
                </div>
                <p style="font-size:0.95rem; color:#666; line-height:1.6; margin-bottom:20px;">
                    ${featured.excerpt}
                </p>
                <a href="post.html?id=${rawFeatured.id}" class="btn btn-primary" style="display:inline-flex;">
                    ${isEn ? 'Read Article' : 'Đọc tiếp bài viết'} <i class="fas fa-arrow-right" style="margin-left:6px;"></i>
                </a>
            </div>
        </div>
    `;
}

function renderBlogGrid(articles) {
    const grid = document.getElementById('blogArticlesGrid');
    const emptyState = document.getElementById('noArticlesFound');
    if (!grid) return;

    if (articles.length === 0) {
        grid.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';
    grid.innerHTML = '';

    const isEn = window.KittenI18n?.getLang() === 'en';
    // If showing featured banner on 'all', skip first article in grid
    const isShowingBanner = (activeBlogCategory === 'all' && !currentSearchQuery.trim() && articles.length > 1);
    const displayList = isShowingBanner ? articles.slice(1) : articles;

    displayList.forEach(rawArt => {
        const art = isEn && window.KittenI18n ? window.KittenI18n.getTranslatedArticle(rawArt) : rawArt;
        const card = document.createElement('div');
        card.className = 'blog-card';
        card.innerHTML = `
            <div class="blog-card-img">
                <a href="post.html?id=${rawArt.id}">
                    <img src="${art.coverImage}" alt="${art.title}" loading="lazy">
                </a>
                <span class="blog-card-category">${art.categoryName || (isEn ? 'Baking Tips' : 'Mẹo Bánh')}</span>
            </div>
            <div class="blog-card-body">
                <div class="blog-meta">
                    <span><i class="fas fa-calendar-alt"></i> ${art.publishDate}</span>
                    <span><i class="fas fa-clock"></i> ${art.readTime || (isEn ? '3 min read' : '3 phút')}</span>
                </div>
                <h3 class="blog-card-title">
                    <a href="post.html?id=${rawArt.id}">${art.title}</a>
                </h3>
                <p class="blog-card-excerpt">
                    ${art.excerpt || ''}
                </p>
                <div class="blog-card-footer">
                    <span style="font-size:0.8rem; color:#888;"><i class="fas fa-eye"></i> ${art.views || 100} ${isEn ? 'views' : 'lượt xem'}</span>
                    <a href="post.html?id=${rawArt.id}" class="btn-read-more">
                        ${isEn ? 'Read More' : 'Đọc chi tiết'} <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function setupBlogEvents() {
    const searchInput = document.getElementById('blogSearchInput');
    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                currentSearchQuery = e.target.value;
                applyBlogFilters();
            }, 250);
        });
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

    window.addEventListener('languageChanged', () => {
        renderBlogCategories();
        applyBlogFilters();
        if (window.KittenI18n && window.KittenI18n.applyTranslations) {
            window.KittenI18n.applyTranslations();
        }
    });
}
