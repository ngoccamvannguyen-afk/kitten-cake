// Kitten Cake - Order Tracking Controller
document.addEventListener('DOMContentLoaded', () => {
    initTracking();
    updateCartBadge();
});

function formatCurrency(amount) {
    if (isNaN(amount)) return '0đ';
    if (window.KittenI18n && typeof window.KittenI18n.formatMoney === 'function') {
        return window.KittenI18n.formatMoney(amount);
    }
    return Number(amount).toLocaleString('vi-VN') + 'đ';
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

function quickFillTracking(code) {
    const input = document.getElementById('trackingQueryInput');
    if (input) {
        input.value = code;
        executeTracking(code);
    }
}

function initTracking() {
    const form = document.getElementById('trackingForm');
    const input = document.getElementById('trackingQueryInput');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const q = input.value.trim();
            if (q) executeTracking(q);
        });
    }

    // Auto-search if query param present
    const params = new URLSearchParams(window.location.search);
    const queryParam = params.get('query') || params.get('orderId') || params.get('phone');
    if (queryParam) {
        if (input) input.value = queryParam;
        executeTracking(queryParam);
    }

    // Mobile nav toggle
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');
    if (mobileBtn && nav) {
        mobileBtn.addEventListener('click', () => {
            nav.classList.toggle('active');
        });
    }
}

async function executeTracking(query) {
    const loading = document.getElementById('trackingLoading');
    const empty = document.getElementById('trackingEmpty');
    const resultContainer = document.getElementById('trackingResultContainer');

    if (loading) loading.style.display = 'block';
    if (empty) empty.style.display = 'none';
    if (resultContainer) resultContainer.style.display = 'none';

    let orders = [];

    try {
        const res = await fetch(`/api/orders/track?query=${encodeURIComponent(query)}&_t=` + Date.now(), { cache: 'no-store' });
        if (res.ok) {
            const json = await res.json();
            orders = json.orders || [];
        }
    } catch (e) {
        console.warn('API error, fallback to local content.json');
    }

    if (orders.length === 0) {
        try {
            const resLocal = await fetch('data/content.json?_t=' + Date.now(), { cache: 'no-store' });
            if (resLocal.ok) {
                const data = await resLocal.json();
                const all = data.orders || [];
                const cleanQ = query.trim().toUpperCase();
                const cleanPhone = query.trim().replace(/[^0-9]/g, '');

                orders = all.filter(o => {
                    const oId = (o.id || '').toUpperCase();
                    const oPhone = (o.phone || '').replace(/[^0-9]/g, '');
                    return oId === cleanQ || (cleanPhone.length >= 7 && oPhone.includes(cleanPhone));
                });
            }
        } catch (e) {
            console.error(e);
        }
    }

    if (loading) loading.style.display = 'none';

    if (orders.length === 0) {
        if (empty) empty.style.display = 'block';
        return;
    }

    if (resultContainer) {
        resultContainer.style.display = 'block';
        renderTrackingOrders(orders, resultContainer);
    }
}

function getStatusDetails(status) {
    const isEn = window.KittenI18n && window.KittenI18n.getLang() === 'en';
    switch (status) {
        case 'pending':
            return { stepIndex: 1, text: isEn ? 'Order Received' : 'Đã Tiếp Nhận Đơn', badgeClass: 'baking-now', color: '#ff9a9e' };
        case 'baking':
            return { stepIndex: 2, text: isEn ? 'Baking in Oven' : 'Bánh Đang Nướng Trong Lò', badgeClass: 'baking-now', color: '#f6416c' };
        case 'delivering':
            return { stepIndex: 3, text: isEn ? 'Out for Delivery' : 'Shipper Đang Giao Tới Bạn', badgeClass: 'baking-now', color: '#3b82f6' };
        case 'completed':
            return { stepIndex: 4, text: isEn ? 'Delivered Successfully' : 'Đã Giao Bánh Thành Công', badgeClass: '', color: '#2ec4b6' };
        case 'cancelled':
            return { stepIndex: 0, text: isEn ? 'Order Cancelled' : 'Đã Hủy Đơn Hàng', badgeClass: 'out-of-stock', color: '#ef4444' };
        default:
            return { stepIndex: 1, text: isEn ? 'Pending' : 'Chờ Xác Nhận', badgeClass: '', color: '#ff9a9e' };
    }
}

function renderTrackingOrders(orders, container) {
    window._lastTrackingOrders = orders;
    window._lastTrackingContainer = container;
    container.innerHTML = '';

    const isEn = window.KittenI18n && window.KittenI18n.getLang() === 'en';

    orders.forEach(order => {
        const card = document.createElement('div');
        card.className = 'timeline-card';

        const statusInfo = getStatusDetails(order.status || 'pending');
        const formattedDate = order.createdAt 
            ? new Date(order.createdAt).toLocaleString(isEn ? 'en-US' : 'vi-VN') 
            : (isEn ? 'Recently placed' : 'Mới đặt gần đây');

        // Steps timeline state
        const s1Class = statusInfo.stepIndex >= 1 ? (statusInfo.stepIndex === 1 ? 'active' : 'completed') : '';
        const s2Class = statusInfo.stepIndex >= 2 ? (statusInfo.stepIndex === 2 ? 'active' : 'completed') : '';
        const s3Class = statusInfo.stepIndex >= 3 ? (statusInfo.stepIndex === 3 ? 'active' : 'completed') : '';
        const s4Class = statusInfo.stepIndex >= 4 ? 'completed active' : '';

        // Items HTML
        let itemsHtml = '';
        if (order.items && order.items.length > 0) {
            order.items.forEach(it => {
                const prodName = isEn && window.KittenI18n ? window.KittenI18n.getTranslatedProductName(it.name) : it.name;
                const flavorName = isEn && window.KittenI18n ? window.KittenI18n.getTranslatedFlavor(it.flavor) : (it.flavor || (isEn ? 'Signature Standard' : 'Vị Tiêu Chuẩn'));
                itemsHtml += `
                    <tr>
                        <td style="padding:10px; display:flex; align-items:center; gap:10px;">
                            <img src="${it.image || 'tai-nguyen/donut-signature.jpg'}" alt="${prodName}" style="width:48px; height:48px; object-fit:cover; border-radius:8px;">
                            <div>
                                <strong style="display:block; font-size:0.92rem; color:#222;">${prodName}</strong>
                                <span style="font-size:0.8rem; color:#888;">${flavorName}</span>
                            </div>
                        </td>
                        <td style="padding:10px; text-align:center; font-weight:700;">${it.quantity}</td>
                        <td style="padding:10px; text-align:right; font-weight:700; color:var(--accent-color);">${formatCurrency(it.price * it.quantity)}</td>
                    </tr>
                `;
            });
        }

        const paymentText = order.paymentMethod === 'banking' 
            ? (isEn ? 'VietQR Bank Transfer' : 'VietQR Chuyển khoản') 
            : (order.paymentMethod === 'paypal' ? 'PayPal (emmeoVN)' : (isEn ? 'Cash on Delivery (COD)' : 'Tiền mặt khi nhận bánh'));

        card.innerHTML = `
            <!-- Top Header Meta -->
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; border-bottom:1px solid #fce6ea; padding-bottom:14px; margin-bottom:20px;">
                <div>
                    <span style="font-size:0.85rem; color:#888;">${isEn ? 'Order ID:' : 'Mã đơn hàng:'}</span>
                    <h3 style="font-size:1.4rem; color:#f6416c; margin:2px 0 0 0; letter-spacing:0.5px;">#${order.id}</h3>
                    <span style="font-size:0.8rem; color:#999;"><i class="fas fa-clock"></i> ${isEn ? 'Placed at:' : 'Đặt lúc:'} ${formattedDate}</span>
                </div>
                <div style="text-align:right;">
                    <span class="stock-pill ${statusInfo.badgeClass}" style="font-size:0.9rem; padding:6px 14px;">
                        <i class="fas fa-dot-circle"></i> ${statusInfo.text}
                    </span>
                    <div style="font-size:0.85rem; color:#666; margin-top:4px;">
                        ${isEn ? 'Payment:' : 'Thanh toán:'} <strong>${paymentText}</strong>
                    </div>
                </div>
            </div>

            <!-- Visual 4-Step Timeline -->
            ${order.status !== 'cancelled' ? `
            <div class="order-status-steps">
                <div class="step-item ${s1Class}">
                    <div class="step-circle"><i class="fas fa-receipt"></i></div>
                    <span class="step-label">${isEn ? 'Order Received' : 'Tiếp nhận đơn'}</span>
                </div>
                <div class="step-item ${s2Class}">
                    <div class="step-circle"><i class="fas fa-fire"></i></div>
                    <span class="step-label">${isEn ? 'Baking Fresh' : 'Đang nướng bánh'}</span>
                </div>
                <div class="step-item ${s3Class}">
                    <div class="step-circle"><i class="fas fa-motorcycle"></i></div>
                    <span class="step-label">${isEn ? 'Out for Delivery' : 'Đang giao hàng'}</span>
                </div>
                <div class="step-item ${s4Class}">
                    <div class="step-circle"><i class="fas fa-check-circle"></i></div>
                    <span class="step-label">${isEn ? 'Delivered' : 'Giao thành công'}</span>
                </div>
            </div>
            ` : `
            <div style="background:#fee2e2; border:1px solid #fca5a5; color:#b91c1c; padding:12px 18px; border-radius:12px; margin-bottom:20px; font-weight:700;">
                <i class="fas fa-exclamation-triangle"></i> ${isEn ? 'This order has been cancelled. Please contact our Hotline if you need to reorder!' : 'Đơn hàng này đã bị hủy. Vui lòng liên hệ Hotline nếu bạn cần đặt lại bánh!'}
            </div>
            `}

            <!-- Customer & Shipping Info -->
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap:18px; background:#fff8f9; padding:18px; border-radius:14px; margin-bottom:22px; border:1px solid #ffe3e8;">
                <div>
                    <h4 style="font-size:0.95rem; color:#444; margin-bottom:8px;"><i class="fas fa-user" style="color:#ff9a9e;"></i> ${isEn ? 'Customer Details' : 'Thông Tin Khách Hàng'}</h4>
                    <p style="margin:0 0 4px 0; font-size:0.9rem;">${isEn ? 'Full Name:' : 'Họ tên:'} <strong>${order.customerName}</strong></p>
                    <p style="margin:0; font-size:0.9rem;">${isEn ? 'Phone Number:' : 'Số điện thoại:'} <strong>${order.phone}</strong></p>
                </div>
                <div>
                    <h4 style="font-size:0.95rem; color:#444; margin-bottom:8px;"><i class="fas fa-map-marker-alt" style="color:#ff9a9e;"></i> ${isEn ? 'Delivery Address' : 'Địa Chỉ Giao Bánh'}</h4>
                    <p style="margin:0 0 4px 0; font-size:0.9rem;">${order.address || (isEn ? 'District 7' : 'Quận 7')}</p>
                    <p style="margin:0; font-size:0.85rem; color:#777;">${isEn ? 'Notes:' : 'Ghi chú:'} ${order.note || (isEn ? 'No notes' : 'Không có ghi chú')}</p>
                </div>
            </div>

            <!-- Ordered Items Table -->
            <h4 style="font-size:1.05rem; margin-bottom:12px;"><i class="fas fa-cookie-bite" style="color:#f6416c;"></i> ${isEn ? 'Ordered Cake Details' : 'Chi Tiết Món Bánh Đã Đặt'}</h4>
            <div style="overflow-x:auto; margin-bottom:18px;">
                <table style="width:100%; border-collapse:collapse; background:#ffffff; border:1px solid #fce6ea; border-radius:10px; overflow:hidden;">
                    <thead>
                        <tr style="background:#fff2f5; font-size:0.85rem; color:#666;">
                            <th style="padding:10px; text-align:left;">${isEn ? 'Product' : 'Sản phẩm'}</th>
                            <th style="padding:10px; text-align:center;">${isEn ? 'Quantity' : 'Số lượng'}</th>
                            <th style="padding:10px; text-align:right;">${isEn ? 'Total' : 'Thành tiền'}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>
            </div>

            <!-- Financial Breakdown -->
            <div style="max-width:360px; margin-left:auto; background:#fffbfb; border:1px solid #ffe3e8; border-radius:12px; padding:16px;">
                <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:0.9rem; color:#666;">
                    <span>${isEn ? 'Items Subtotal:' : 'Tiền bánh:'}</span>
                    <strong>${formatCurrency(order.subtotal || 0)}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:0.9rem; color:#666;">
                    <span>${isEn ? 'Shipping Fee:' : 'Phí giao hàng:'}</span>
                    <strong>${formatCurrency(order.shippingFee || 0)}</strong>
                </div>
                ${order.discount ? `
                <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:0.9rem; color:#2ec4b6;">
                    <span>${isEn ? 'Voucher Discount:' : 'Giảm giá voucher:'}</span>
                    <strong>-${formatCurrency(order.discount)}</strong>
                </div>
                ` : ''}
                ${order.comboFreeDescription ? `
                <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:0.85rem; color:#f6416c;">
                    <span>${isEn ? 'Combo Gift:' : 'Quà tặng combo:'}</span>
                    <strong>${order.comboFreeDescription}</strong>
                </div>
                ` : ''}
                <div style="display:flex; justify-content:space-between; padding-top:10px; border-top:1.5px dashed #ffd1dc; font-size:1.15rem; color:#f6416c; font-weight:800;">
                    <span>${isEn ? 'Total Payment:' : 'Tổng thanh toán:'}</span>
                    <span>${formatCurrency(order.total || 0)}</span>
                </div>
            </div>

            <!-- VietQR Box if banking and not completed -->
            ${order.paymentMethod === 'banking' && order.status !== 'completed' ? `
            <div class="vietqr-box" style="margin-top:20px;">
                <h4 style="font-size:1rem; color:#222; margin-bottom:10px;"><i class="fas fa-qrcode" style="color:#f6416c;"></i> ${isEn ? 'Scan VietQR to Pay Quickly' : 'Quét Mã VietQR Để Thanh Toán Nhanh'}</h4>
                <img src="https://img.vietqr.io/image/VPB-1821004654-compact2.png?amount=${order.total || 0}&addInfo=${encodeURIComponent(order.id)}&accountName=${encodeURIComponent("NGUYEN NGOC CAM VAN")}" alt="VietQR Đơn Hàng ${order.id}">
                <div class="vietqr-hint">${isEn ? 'Exact Transfer Memo:' : 'Nội dung chuyển khoản chuẩn:'} <strong>${order.id}</strong> • ${isEn ? 'Amount:' : 'Số tiền:'} <strong>${formatCurrency(order.total || 0)}</strong></div>
            </div>
            ` : ''}

            <!-- Support Action Footer -->
            <div style="margin-top:20px; padding-top:14px; border-top:1px solid #fce6ea; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                <span style="font-size:0.88rem; color:#666;">${isEn ? 'Need to change delivery time or add instructions?' : 'Cần thay đổi giờ giao hoặc thêm ghi chú?'}</span>
                <a href="tel:0898575717" class="btn btn-outline" style="padding:8px 18px; font-size:0.9rem;">
                    <i class="fas fa-phone-alt"></i> Hotline: 0898575717
                </a>
            </div>
        `;

        container.appendChild(card);
    });

    if (window.KittenI18n && typeof window.KittenI18n.scanAndTranslateDynamic === 'function') {
        window.KittenI18n.scanAndTranslateDynamic(container);
    }
}

// Lắng nghe sự kiện chuyển đổi ngôn ngữ để render lại tức thời
window.addEventListener('languageChanged', () => {
    if (window._lastTrackingOrders && window._lastTrackingOrders.length > 0 && window._lastTrackingContainer) {
        renderTrackingOrders(window._lastTrackingOrders, window._lastTrackingContainer);
    }
    if (window.KittenI18n && typeof window.KittenI18n.applyTranslations === 'function') {
        window.KittenI18n.applyTranslations();
    }
});
