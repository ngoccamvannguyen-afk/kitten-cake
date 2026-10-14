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
            const flavor = item.flavor || 'Vị Chuẩn Signature';
            const quantity = parseInt(item.quantity, 10) || 1;

            // Kiểm tra trùng id và cùng hương vị
            const existingIndex = items.findIndex(i => i.id === item.id && (i.flavor || '') === flavor);

            if (existingIndex > -1) {
                items[existingIndex].quantity += quantity;
            } else {
                items.push({
                    id: item.id,
                    name: item.name,
                    price: Number(item.price) || 10000,
                    flavor: flavor,
                    image: item.image || 'tai-nguyen/donut-signature.jpg',
                    quantity: quantity
                });
            }

            this.saveItems(items);
            this.showToast(`Đã thêm <b>${item.name}</b> (${flavor}) vào giỏ hàng!`);

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
            const donutCount = this.getDonutCount();

            if (items.length === 0) {
                if (emptyEl) emptyEl.style.display = 'flex';
                if (contentEl) contentEl.style.display = 'none';
                return;
            }

            if (emptyEl) emptyEl.style.display = 'none';
            if (contentEl) contentEl.style.display = 'flex';

            if (subtotalEl) {
                subtotalEl.textContent = formatVNCurrency(subtotal);
            }

            // Banner combo Mua 5 tặng 1
            if (promoNoticeEl) {
                if (donutCount >= 5) {
                    const freeGiftCount = Math.floor(donutCount / 5);
                    promoNoticeEl.innerHTML = `🎉 <b>Bạn đủ điều kiện!</b> Tặng ngay <b>${freeGiftCount}</b> chiếc Donut ngẫu nhiên đóng hộp mèo Kitten Cake!`;
                    promoNoticeEl.className = 'mini-cart-promo success';
                    promoNoticeEl.style.display = 'block';
                } else if (donutCount > 0) {
                    const needed = 5 - donutCount;
                    promoNoticeEl.innerHTML = `🍩 Mua thêm <b>${needed}</b> chiếc Donut nữa để được <b>tặng 1 Donut</b> miễn phí!`;
                    promoNoticeEl.className = 'mini-cart-promo info';
                    promoNoticeEl.style.display = 'block';
                } else {
                    promoNoticeEl.style.display = 'none';
                }
            }

            // Render từng món
            listEl.innerHTML = '';
            items.forEach((item, index) => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'mini-cart-item';
                itemDiv.innerHTML = `
                    <img src="${item.image}" alt="${item.name}" class="mini-cart-item-img">
                    <div class="mini-cart-item-detail">
                        <div class="mini-cart-item-title">${item.name}</div>
                        <div class="mini-cart-item-flavor"><i class="fas fa-cookie"></i> ${item.flavor}</div>
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
