// Kitten Cake - Cart Engine & Mini-Cart Drawer Controller
(function(window) {
    'use strict';

    const CART_STORAGE_KEY = 'kitten_cart_v2';

    const KittenCart = {
        // Lấy danh sách sản phẩm từ localStorage
        getItems() {
            try {
                const data = localStorage.getItem(CART_STORAGE_KEY);
                return data ? JSON.parse(data) : [];
            } catch (e) {
                console.error('Lỗi đọc giỏ hàng từ localStorage:', e);
                return [];
            }
        },

        // Lưu giỏ hàng
        saveItems(items) {
            try {
                localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
                this.notifyUpdate();
            } catch (e) {
                console.error('Lỗi lưu giỏ hàng vào localStorage:', e);
            }
        },

        // Thêm sản phẩm vào giỏ
        addItem(item, openDrawerAfterAdd = true) {
            const items = this.getItems();
            const flavor = item.flavor || 'Vị Choco';
            const toppings = Array.isArray(item.toppings) ? [...item.toppings].sort() : [];
            const quantity = parseInt(item.quantity, 10) || 1;

            // Kiểm tra trùng id, cùng hương vị và cùng danh sách topping
            const existingIndex = items.findIndex(i => {
                const iTop = Array.isArray(i.toppings) ? [...i.toppings].sort() : [];
                return i.id === item.id &&
                       (i.flavor || '') === flavor &&
                       JSON.stringify(iTop) === JSON.stringify(toppings);
            });

            if (existingIndex > -1) {
                items[existingIndex].quantity += quantity;
            } else {
                items.push({
                    id: item.id,
                    name: item.name,
                    price: Number(item.price) || 10000,
                    basePrice: Number(item.basePrice) || Number(item.price) || 10000,
                    flavor: flavor,
                    toppings: toppings,
                    image: item.image || 'tai-nguyen/donut-choco.jpg',
                    quantity: quantity
                });
            }

            this.saveItems(items);
            const toppingText = toppings.length > 0 ? ` (+${toppings.join(', ')})` : '';
            this.showToast(`Đã thêm <b>${item.name}</b> (${flavor}${toppingText}) vào giỏ hàng!`);

            if (openDrawerAfterAdd) {
                this.openDrawer();
            }
        },

        // Cập nhật số lượng
        updateQuantity(index, newQty) {
            const items = this.getItems();
            if (index < 0 || index >= items.length) return;

            if (newQty <= 0) {
                items.splice(index, 1);
                this.showToast('Đã xóa món khỏi giỏ hàng.', 'info');
            } else {
                items[index].quantity = Math.min(newQty, 99);
            }
            this.saveItems(items);
        },

        // Xóa một món
        removeItem(index) {
            const items = this.getItems();
            if (index < 0 || index >= items.length) return;
            const removed = items.splice(index, 1);
            this.saveItems(items);
            if (removed[0]) {
                this.showToast(`Đã xóa ${removed[0].name} khỏi giỏ.`, 'info');
            }
        },

        // Xóa toàn bộ giỏ
        clearCart() {
            this.saveItems([]);
        },

        // Tính tổng tiền hàng
        getSubtotal() {
            const items = this.getItems();
            return items.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
        },

        // Tính tổng số lượng chiếc bánh
        getTotalCount() {
            const items = this.getItems();
            return items.reduce((sum, item) => sum + Number(item.quantity), 0);
        },

        // Đếm số bánh Donut để áp dụng chương trình Mua 5 tặng 1
        getDonutCount() {
            const items = this.getItems();
            return items
                .filter(i => (i.name || '').toLowerCase().includes('donut') || (i.id === 'menu_1'))
                .reduce((sum, i) => sum + Number(i.quantity), 0);
        },

        // Tính toán chương trình khuyến mãi Mua 5 tặng 1:
        // Cứ mỗi cụm 6 chiếc bánh trong giỏ, khách hàng được MIỄN PHÍ 1 chiếc có giá trị thấp nhất.
        getPromoBuy5Get1() {
            const items = this.getItems();
            const allCakes = [];

            // Mở rộng từng đơn vị chiếc bánh riêng lẻ trong giỏ hàng
            items.forEach((item, itemIdx) => {
                const qty = parseInt(item.quantity, 10) || 0;
                const price = Number(item.price) || 0;
                for (let q = 0; q < qty; q++) {
                    allCakes.push({
                        itemIndex: itemIdx,
                        id: item.id,
                        name: item.name,
                        flavor: item.flavor || '',
                        price: price,
                        image: item.image || ''
                    });
                }
            });

            const totalCakes = allCakes.length;
            const freeCount = Math.floor(totalCakes / 6);
            const remainder = totalCakes % 6;
            const neededForNext = remainder === 0 ? 6 : (6 - remainder);

            if (freeCount === 0) {
                return {
                    eligible: false,
                    totalCakes,
                    neededForNext: totalCakes === 0 ? 6 : neededForNext,
                    freeCount: 0,
                    discountAmount: 0,
                    freeItems: []
                };
            }

            // Sắp xếp tăng dần theo giá: chiếc rẻ nhất nằm đầu tiên
            allCakes.sort((a, b) => a.price - b.price);

            // Lấy ra freeCount chiếc bánh rẻ nhất
            const freeItems = allCakes.slice(0, freeCount);
            const discountAmount = freeItems.reduce((sum, c) => sum + c.price, 0);

            return {
                eligible: true,
                totalCakes,
                neededForNext: neededForNext === 0 ? 6 : neededForNext,
                freeCount,
                discountAmount,
                freeItems
            };
        },

        // Thông báo cập nhật giỏ hàng tới các thành phần khác
        notifyUpdate() {
            const items = this.getItems();
            window.dispatchEvent(new CustomEvent('cart:updated', { detail: { items, count: this.getTotalCount(), subtotal: this.getSubtotal() } }));
            this.updateBadge();
            this.renderDrawer();
        },

        // Cập nhật số trên badge giỏ hàng
        updateBadge() {
            const count = this.getTotalCount();
            document.querySelectorAll('.cart-count-badge').forEach(badge => {
                badge.textContent = count;
                badge.style.display = count > 0 ? 'inline-flex' : 'none';
            });
        },

        // Điều khiển mở Drawer
        openDrawer() {
            const drawer = document.getElementById('miniCartDrawer');
            const backdrop = document.getElementById('miniCartBackdrop');
            if (drawer) drawer.classList.add('active');
            if (backdrop) backdrop.classList.add('active');
            this.renderDrawer();
        },

        // Điều khiển đóng Drawer
        closeDrawer() {
            const drawer = document.getElementById('miniCartDrawer');
            const backdrop = document.getElementById('miniCartBackdrop');
            if (drawer) drawer.classList.remove('active');
            if (backdrop) backdrop.classList.remove('active');
        },

        // Render nội dung trong Mini-Cart Drawer
        renderDrawer() {
            const listEl = document.getElementById('miniCartList');
            const subtotalEl = document.getElementById('miniCartSubtotal');
            const emptyEl = document.getElementById('miniCartEmpty');
            const contentEl = document.getElementById('miniCartContentWrap');
            const promoNoticeEl = document.getElementById('miniCartPromoNotice');

            if (!listEl) return;

            const items = this.getItems();
            const subtotal = this.getSubtotal();
            const promo = this.getPromoBuy5Get1();

            if (items.length === 0) {
                if (emptyEl) emptyEl.style.display = 'flex';
                if (contentEl) contentEl.style.display = 'none';
                return;
            }

            if (emptyEl) emptyEl.style.display = 'none';
            if (contentEl) contentEl.style.display = 'flex';

            if (subtotalEl) {
                if (promo.discountAmount > 0) {
                    const finalSub = Math.max(0, subtotal - promo.discountAmount);
                    subtotalEl.innerHTML = `
                        <span style="color:var(--accent-color); font-weight:800;">${formatVNCurrency(finalSub)}</span>
                        <del style="font-size:0.85rem; color:#a4b0be; margin-left:6px; font-weight:normal;">${formatVNCurrency(subtotal)}</del>
                    `;
                } else {
                    subtotalEl.textContent = formatVNCurrency(subtotal);
                }
            }

            // Banner combo Mua 5 tặng 1
            if (promoNoticeEl) {
                if (promo.eligible) {
                    const freeNames = promo.freeItems.map(f => `${f.name}${f.flavor ? ` (${f.flavor})` : ''}`).join(', ');
                    promoNoticeEl.innerHTML = `🎉 <b>Đã áp dụng Mua 5 Tặng 1:</b> Miễn phí <b>${promo.freeCount} bánh</b> giá thấp nhất (-${formatVNCurrency(promo.discountAmount)})! <div style="font-size:0.75rem; margin-top:3px; opacity:0.9;">Tặng miễn phí: <b>${freeNames}</b></div>`;
                    promoNoticeEl.className = 'mini-cart-promo success';
                    promoNoticeEl.style.display = 'block';
                } else if (promo.totalCakes > 0) {
                    promoNoticeEl.innerHTML = `🍩 Chọn thêm <b>${promo.neededForNext}</b> chiếc bánh nữa (đủ 6 bánh) để được <b>TẶNG MIỄN PHÍ</b> 1 bánh có giá thấp nhất!`;
                    promoNoticeEl.className = 'mini-cart-promo info';
                    promoNoticeEl.style.display = 'block';
                } else {
                    promoNoticeEl.style.display = 'none';
                }
            }

            // Đếm số lượng bánh được free theo từng dòng
            const freeCountsPerIndex = {};
            promo.freeItems.forEach(f => {
                freeCountsPerIndex[f.itemIndex] = (freeCountsPerIndex[f.itemIndex] || 0) + 1;
            });

            // Render từng món
            listEl.innerHTML = '';
            items.forEach((item, index) => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'mini-cart-item';
                const freeInThisRow = freeCountsPerIndex[index] || 0;
                const freeTag = freeInThisRow > 0
                    ? `<div style="font-size:0.75rem; color:#2ed573; font-weight:700; margin-bottom:3px;"><i class="fas fa-gift"></i> Tặng Free ${freeInThisRow} chiếc (0đ)</div>`
                    : '';

                itemDiv.innerHTML = `
                    <img src="${item.image}" alt="${item.name}" class="mini-cart-item-img">
                    <div class="mini-cart-item-detail">
                        <div class="mini-cart-item-title">${item.name}</div>
                        <div class="mini-cart-item-flavor"><i class="fas fa-cookie"></i> ${item.flavor}</div>
                        ${(item.toppings && item.toppings.length > 0) ? `<div class="mini-cart-item-toppings" style="font-size:0.75rem; color:#747d8c; margin-bottom:4px;"><i class="fas fa-sparkles" style="color:#ffa502;"></i> + ${item.toppings.join(', ')}</div>` : ''}
                        ${freeTag}
                        <div class="mini-cart-item-meta">
                            <span class="mini-cart-item-price">${formatVNCurrency(item.price)}</span>
                            <div class="mini-cart-qty-ctrl">
                                <button type="button" class="btn-qty-minus" data-index="${index}"><i class="fas fa-minus"></i></button>
                                <span class="qty-display">${item.quantity}</span>
                                <button type="button" class="btn-qty-plus" data-index="${index}"><i class="fas fa-plus"></i></button>
                            </div>
                        </div>
                    </div>
                    <button type="button" class="mini-cart-btn-remove" data-index="${index}" title="Xóa món này">&times;</button>
                `;
                listEl.appendChild(itemDiv);
            });
        },

        // Toast notification đẹp mắt
        showToast(message, type = 'success') {
            let container = document.getElementById('kittenToastContainer');
            if (!container) {
                container = document.createElement('div');
                container.id = 'kittenToastContainer';
                container.className = 'kitten-toast-container';
                document.body.appendChild(container);
            }

            const toast = document.createElement('div');
            toast.className = `kitten-toast ${type}`;
            const icon = type === 'success' ? 'fa-check-circle' : 'fa-info-circle';
            toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
            container.appendChild(toast);

            setTimeout(() => {
                toast.classList.add('show');
            }, 10);

            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 3500);
        },

        // Khởi tạo các sự kiện giao diện cho Mini-Cart
        initUI() {
            this.updateBadge();

            // Lắng nghe click mở drawer
            document.addEventListener('click', (e) => {
                const openBtn = e.target.closest('#openMiniCartBtn, .btn-trigger-mini-cart');
                if (openBtn) {
                    e.preventDefault();
                    this.openDrawer();
                    return;
                }

                const closeBtn = e.target.closest('#closeMiniCartBtn, #miniCartBackdrop, .btn-continue-shopping');
                if (closeBtn) {
                    e.preventDefault();
                    this.closeDrawer();
                    return;
                }

                // Tăng giảm số lượng trong Mini Cart
                const minusBtn = e.target.closest('.btn-qty-minus');
                if (minusBtn) {
                    const idx = parseInt(minusBtn.getAttribute('data-index'), 10);
                    const currentQty = this.getItems()[idx]?.quantity || 1;
                    this.updateQuantity(idx, currentQty - 1);
                    return;
                }

                const plusBtn = e.target.closest('.btn-qty-plus');
                if (plusBtn) {
                    const idx = parseInt(plusBtn.getAttribute('data-index'), 10);
                    const currentQty = this.getItems()[idx]?.quantity || 1;
                    this.updateQuantity(idx, currentQty + 1);
                    return;
                }

                const removeBtn = e.target.closest('.mini-cart-btn-remove');
                if (removeBtn) {
                    const idx = parseInt(removeBtn.getAttribute('data-index'), 10);
                    this.removeItem(idx);
                    return;
                }
            });

            // Lắng nghe sự kiện storage từ tab khác
            window.addEventListener('storage', (e) => {
                if (e.key === CART_STORAGE_KEY) {
                    this.notifyUpdate();
                }
            });
        }
    };

    function formatVNCurrency(val) {
        if (isNaN(val)) return '0đ';
        return Number(val).toLocaleString('vi-VN') + 'đ';
    }

    window.KittenCart = KittenCart;
    window.formatVNCurrency = formatVNCurrency;

    document.addEventListener('DOMContentLoaded', () => {
        KittenCart.initUI();
    });

})(window);
