/**
 * Kitten Cake Bakery - Floating Chat Widget
 * Tự động tạo nút "Chat ngay" & Hộp thoại tư vấn khách hàng (Zalo, Messenger, Hotline)
 */

(function () {
    let siteContact = {
        hotline: '0898575717',
        hotlineFormatted: '0898 575 717',
        facebook: 'https://www.facebook.com/profile.php?id=61594490844705',
        messenger: 'https://m.me/61594490844705',
        zalo: 'https://zalo.me/0898575717',
        logo: 'tai-nguyen/logo.jpg'
    };

    // Tự động nạp thông tin hotline & mạng xã hội từ content.json nếu có
    fetch('/data/content.json')
        .then(res => res.json())
        .then(data => {
            if (data && data.general) {
                const g = data.general;
                if (g.hotline) {
                    siteContact.hotline = g.hotline.replace(/\s+/g, '');
                    siteContact.hotlineFormatted = g.hotline;
                    siteContact.zalo = `https://zalo.me/${siteContact.hotline}`;
                }
                if (g.socialLinks && g.socialLinks.facebook) {
                    siteContact.facebook = g.socialLinks.facebook;
                    const match = g.socialLinks.facebook.match(/id=(\d+)/);
                    if (match) {
                        siteContact.messenger = `https://m.me/${match[1]}`;
                    }
                }
                if (g.logo) {
                    siteContact.logo = g.logo;
                }
                updateWidgetLinks();
            }
        })
        .catch(() => {});

    function isEnglish() {
        return window.KittenI18n && typeof window.KittenI18n.getLang === 'function' && window.KittenI18n.getLang() === 'en';
    }

    function initChatWidget() {
        if (document.getElementById('kcChatWidgetContainer')) return;

        const isEn = isEnglish();

        // Style cho widget
        const style = document.createElement('style');
        style.id = 'kcChatWidgetStyle';
        style.textContent = `
            .kc-chat-widget-wrapper {
                position: fixed;
                bottom: 24px;
                right: 24px;
                z-index: 9998;
                font-family: 'Quicksand', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            }

            /* Floating Trigger Button */
            .kc-chat-trigger-btn {
                display: flex;
                align-items: center;
                gap: 10px;
                background: linear-gradient(135deg, #ff6584 0%, #ff4757 100%);
                color: #ffffff;
                border: none;
                padding: 12px 22px;
                border-radius: 50px;
                cursor: pointer;
                box-shadow: 0 8px 24px rgba(255, 71, 87, 0.45);
                transition: all 0.28s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                text-decoration: none;
                user-select: none;
                position: relative;
            }

            .kc-chat-trigger-btn:hover {
                transform: translateY(-3px) scale(1.03);
                box-shadow: 0 12px 30px rgba(255, 71, 87, 0.6);
            }

            .kc-chat-trigger-btn:active {
                transform: translateY(0) scale(0.98);
            }

            .kc-chat-icon-wrap {
                position: relative;
                font-size: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .kc-chat-badge-pulse {
                position: absolute;
                top: -2px;
                right: -4px;
                width: 9px;
                height: 9px;
                background-color: #2ed573;
                border-radius: 50%;
                border: 2px solid #ffffff;
                box-shadow: 0 0 0 0 rgba(46, 213, 115, 0.7);
                animation: kcChatPulse 2s infinite;
            }

            @keyframes kcChatPulse {
                0% { box-shadow: 0 0 0 0 rgba(46, 213, 115, 0.7); }
                70% { box-shadow: 0 0 0 7px rgba(46, 213, 115, 0); }
                100% { box-shadow: 0 0 0 0 rgba(46, 213, 115, 0); }
            }

            .kc-chat-btn-text {
                font-weight: 700;
                font-size: 15px;
                letter-spacing: 0.3px;
                white-space: nowrap;
            }

            /* Popover Box */
            .kc-chat-popover {
                position: absolute;
                bottom: 68px;
                right: 0;
                width: 340px;
                background: #ffffff;
                border-radius: 20px;
                box-shadow: 0 16px 45px rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(0, 0, 0, 0.04);
                overflow: hidden;
                display: none;
                opacity: 0;
                transform: translateY(15px) scale(0.96);
                transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                transform-origin: bottom right;
            }

            .kc-chat-popover.active {
                display: block;
                opacity: 1;
                transform: translateY(0) scale(1);
            }

            /* Popover Header */
            .kc-chat-header {
                background: linear-gradient(135deg, #ff6b81 0%, #ff4757 100%);
                color: #ffffff;
                padding: 16px 18px;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }

            .kc-chat-brand-info {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .kc-chat-avatar {
                width: 44px;
                height: 44px;
                border-radius: 50%;
                object-fit: cover;
                border: 2px solid rgba(255, 255, 255, 0.9);
                background: #fff;
            }

            .kc-chat-brand-title {
                font-size: 15px;
                font-weight: 700;
                margin: 0;
                line-height: 1.2;
            }

            .kc-chat-brand-status {
                font-size: 12px;
                opacity: 0.9;
                display: flex;
                align-items: center;
                gap: 5px;
                margin-top: 3px;
            }

            .kc-chat-status-dot {
                width: 7px;
                height: 7px;
                background: #2ed573;
                border-radius: 50%;
                display: inline-block;
            }

            .kc-chat-close-btn {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: #ffffff;
                width: 28px;
                height: 28px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                transition: all 0.2s ease;
            }

            .kc-chat-close-btn:hover {
                background: rgba(255, 255, 255, 0.35);
                transform: rotate(90deg);
            }

            /* Popover Body */
            .kc-chat-body {
                padding: 16px;
                background: #fdfaf8;
                max-height: 380px;
                overflow-y: auto;
            }

            .kc-chat-bubble-msg {
                background: #ffffff;
                border: 1px solid #ffe2e6;
                padding: 12px 14px;
                border-radius: 14px 14px 14px 2px;
                font-size: 13.5px;
                color: #2f3542;
                line-height: 1.5;
                margin-bottom: 15px;
                box-shadow: 0 2px 6px rgba(255, 71, 87, 0.06);
            }

            .kc-chat-options {
                display: flex;
                flex-direction: column;
                gap: 10px;
                margin-bottom: 14px;
            }

            .kc-chat-channel-btn {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 11px 14px;
                border-radius: 12px;
                text-decoration: none;
                font-size: 13.5px;
                font-weight: 600;
                transition: all 0.2s ease;
                border: 1px solid transparent;
            }

            .kc-chat-channel-btn .left-content {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .kc-chat-channel-btn i {
                font-size: 18px;
                width: 20px;
                text-align: center;
            }

            /* Zalo button */
            .kc-btn-zalo {
                background: #e8f4fd;
                color: #0068ff;
                border-color: #d0e7fb;
            }
            .kc-btn-zalo:hover {
                background: #0068ff;
                color: #ffffff;
                transform: translateX(3px);
            }

            /* Messenger button */
            .kc-btn-fb {
                background: #f0f2f5;
                color: #0084ff;
                border-color: #dbe4ee;
            }
            .kc-btn-fb:hover {
                background: #0084ff;
                color: #ffffff;
                transform: translateX(3px);
            }

            /* Hotline button */
            .kc-btn-phone {
                background: #edfbf3;
                color: #2ed573;
                border-color: #c9f5dd;
            }
            .kc-btn-phone:hover {
                background: #2ed573;
                color: #ffffff;
                transform: translateX(3px);
            }

            /* Quick message input */
            .kc-chat-quick-input-box {
                margin-top: 10px;
                background: #ffffff;
                border-radius: 12px;
                padding: 8px 10px;
                border: 1px solid #eed6d9;
                display: flex;
                align-items: center;
                gap: 6px;
            }

            .kc-chat-input {
                flex: 1;
                border: none;
                outline: none;
                font-size: 13px;
                font-family: inherit;
                color: #333;
                background: transparent;
            }

            .kc-chat-send-btn {
                background: #ff4757;
                color: #ffffff;
                border: none;
                border-radius: 8px;
                padding: 6px 12px;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 4px;
                transition: background 0.2s;
            }

            .kc-chat-send-btn:hover {
                background: #ee3a4a;
            }

            @media (max-width: 576px) {
                .kc-chat-widget-wrapper {
                    bottom: 18px;
                    right: 18px;
                }
                .kc-chat-popover {
                    width: calc(100vw - 36px);
                    right: 0;
                    bottom: 64px;
                }
            }
        `;
        document.head.appendChild(style);

        // Container HTML
        const container = document.createElement('div');
        container.id = 'kcChatWidgetContainer';
        container.className = 'kc-chat-widget-wrapper';
        container.innerHTML = `
            <!-- Popover Hỗ trợ -->
            <div class="kc-chat-popover" id="kcChatPopover" aria-hidden="true">
                <div class="kc-chat-header">
                    <div class="kc-chat-brand-info">
                        <img src="${siteContact.logo}" alt="Logo Kitten Cake" class="kc-chat-avatar" id="kcChatAvatar">
                        <div>
                            <h4 class="kc-chat-brand-title">Kitten Cake Bakery</h4>
                            <span class="kc-chat-brand-status">
                                <span class="kc-chat-status-dot"></span>
                                <span id="kcChatStatusText">${isEn ? 'Online • Replies in minutes' : 'Trực tuyến • Phản hồi ngay'}</span>
                            </span>
                        </div>
                    </div>
                    <button class="kc-chat-close-btn" id="btnCloseChatPopover" title="${isEn ? 'Close' : 'Đóng'}" aria-label="Close Chat">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="kc-chat-body">
                    <div class="kc-chat-bubble-msg" id="kcChatWelcomeMsg">
                        ${isEn 
                            ? 'Hello! 💕 Kitten Cake is ready to help you pick the best donuts, handle express delivery or custom cakes. How can we help you today?' 
                            : 'Dạ chào bạn! Tiệm Kitten Cake Quận 7 luôn sẵn sàng tư vấn bánh Donut, giao hỏa tốc hoặc làm bánh theo yêu cầu. Bạn cần hỗ trợ gì nhắn tiệm nhé! 💕'}
                    </div>

                    <div class="kc-chat-options">
                        <a href="${siteContact.zalo}" target="_blank" rel="noopener noreferrer" class="kc-chat-channel-btn kc-btn-zalo" id="kcLinkZalo">
                            <span class="left-content">
                                <i class="fas fa-comment-dots"></i>
                                <span id="kcTextZalo">${isEn ? 'Chat via Zalo (Fastest)' : 'Chat qua Zalo (Tư vấn nhanh nhất)'}</span>
                            </span>
                            <i class="fas fa-arrow-right" style="font-size:12px;"></i>
                        </a>

                        <a href="${siteContact.messenger}" target="_blank" rel="noopener noreferrer" class="kc-chat-channel-btn kc-btn-fb" id="kcLinkMessenger">
                            <span class="left-content">
                                <i class="fab fa-facebook-messenger"></i>
                                <span id="kcTextMessenger">${isEn ? 'Chat on Facebook Messenger' : 'Chat Fanpage Messenger'}</span>
                            </span>
                            <i class="fas fa-arrow-right" style="font-size:12px;"></i>
                        </a>

                        <a href="tel:${siteContact.hotline}" class="kc-chat-channel-btn kc-btn-phone" id="kcLinkPhone">
                            <span class="left-content">
                                <i class="fas fa-phone-alt"></i>
                                <span id="kcTextPhone">${isEn ? 'Call Hotline: ' : 'Gọi Hotline: '} <strong id="kcPhoneNum">${siteContact.hotlineFormatted}</strong></span>
                            </span>
                            <i class="fas fa-arrow-right" style="font-size:12px;"></i>
                        </a>
                    </div>

                    <div class="kc-chat-quick-input-box">
                        <input type="text" id="kcQuickMessageInput" class="kc-chat-input" placeholder="${isEn ? 'Type a quick question...' : 'Nhập câu hỏi hoặc món cần tư vấn...'}" aria-label="Tin nhắn nhanh">
                        <button class="kc-chat-send-btn" id="kcBtnSendQuick">
                            <span id="kcTextSend">${isEn ? 'Send' : 'Gửi'}</span>
                            <i class="fas fa-paper-plane" style="font-size:11px;"></i>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Nút nổi Chat Ngay -->
            <button class="kc-chat-trigger-btn" id="btnToggleChatWidget" aria-label="Mở khung chat hỗ trợ">
                <div class="kc-chat-icon-wrap">
                    <i class="fas fa-comment-dots"></i>
                    <span class="kc-chat-badge-pulse"></span>
                </div>
                <span class="kc-chat-btn-text" id="kcChatBtnLabel">${isEn ? 'Chat Now' : 'Chat ngay'}</span>
            </button>
        `;

        document.body.appendChild(container);

        // Logic tương tác
        const triggerBtn = document.getElementById('btnToggleChatWidget');
        const popover = document.getElementById('kcChatPopover');
        const closeBtn = document.getElementById('btnCloseChatPopover');
        const sendBtn = document.getElementById('kcBtnSendQuick');
        const inputField = document.getElementById('kcQuickMessageInput');

        function togglePopover(show) {
            const isActive = popover.classList.contains('active');
            const shouldOpen = typeof show === 'boolean' ? show : !isActive;

            if (shouldOpen) {
                popover.classList.add('active');
                popover.setAttribute('aria-hidden', 'false');
                setTimeout(() => {
                    inputField && inputField.focus();
                }, 100);
            } else {
                popover.classList.remove('active');
                popover.setAttribute('aria-hidden', 'true');
            }
        }

        triggerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            togglePopover();
        });

        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            togglePopover(false);
        });

        // Bấm ngoài khung chat thì đóng lại
        document.addEventListener('click', (e) => {
            if (!container.contains(e.target) && popover.classList.contains('active')) {
                togglePopover(false);
            }
        });

        // Xử lý gửi tin nhắn nhanh
        function handleSendQuickMessage() {
            const text = (inputField.value || '').trim();
            if (!text) {
                // Nếu chưa nhập thì mở Zalo tư vấn
                window.open(siteContact.zalo, '_blank');
                return;
            }
            // Mở Zalo hoặc Messenger với câu hỏi
            window.open(siteContact.zalo, '_blank');
            inputField.value = '';
            togglePopover(false);
        }

        sendBtn.addEventListener('click', handleSendQuickMessage);
        inputField.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSendQuickMessage();
            }
        });
    }

    function updateWidgetLinks() {
        const linkZalo = document.getElementById('kcLinkZalo');
        if (linkZalo) linkZalo.href = siteContact.zalo;

        const linkMessenger = document.getElementById('kcLinkMessenger');
        if (linkMessenger) linkMessenger.href = siteContact.messenger;

        const linkPhone = document.getElementById('kcLinkPhone');
        if (linkPhone) linkPhone.href = `tel:${siteContact.hotline}`;

        const phoneNum = document.getElementById('kcPhoneNum');
        if (phoneNum) phoneNum.textContent = siteContact.hotlineFormatted;

        const avatar = document.getElementById('kcChatAvatar');
        if (avatar && siteContact.logo) avatar.src = siteContact.logo;
    }

    // Đa ngôn ngữ khi đổi ngôn ngữ
    window.addEventListener('languageChanged', () => {
        const isEn = isEnglish();
        const btnLabel = document.getElementById('kcChatBtnLabel');
        if (btnLabel) btnLabel.textContent = isEn ? 'Chat Now' : 'Chat ngay';

        const statusText = document.getElementById('kcChatStatusText');
        if (statusText) statusText.textContent = isEn ? 'Online • Replies in minutes' : 'Trực tuyến • Phản hồi ngay';

        const welcomeMsg = document.getElementById('kcChatWelcomeMsg');
        if (welcomeMsg) {
            welcomeMsg.textContent = isEn 
                ? 'Hello! 💕 Kitten Cake is ready to help you pick the best donuts, handle express delivery or custom cakes. How can we help you today?' 
                : 'Dạ chào bạn! Tiệm Kitten Cake Quận 7 luôn sẵn sàng tư vấn bánh Donut, giao hỏa tốc hoặc làm bánh theo yêu cầu. Bạn cần hỗ trợ gì nhắn tiệm nhé! 💕';
        }

        const textZalo = document.getElementById('kcTextZalo');
        if (textZalo) textZalo.textContent = isEn ? 'Chat via Zalo (Fastest)' : 'Chat qua Zalo (Tư vấn nhanh nhất)';

        const textMessenger = document.getElementById('kcTextMessenger');
        if (textMessenger) textMessenger.textContent = isEn ? 'Chat on Facebook Messenger' : 'Chat Fanpage Messenger';

        const textPhone = document.getElementById('kcTextPhone');
        if (textPhone) textPhone.innerHTML = `${isEn ? 'Call Hotline: ' : 'Gọi Hotline: '} <strong id="kcPhoneNum">${siteContact.hotlineFormatted}</strong>`;

        const inputField = document.getElementById('kcQuickMessageInput');
        if (inputField) inputField.placeholder = isEn ? 'Type a quick question...' : 'Nhập câu hỏi hoặc món cần tư vấn...';

        const textSend = document.getElementById('kcTextSend');
        if (textSend) textSend.textContent = isEn ? 'Send' : 'Gửi';
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initChatWidget);
    } else {
        initChatWidget();
    }
})();
