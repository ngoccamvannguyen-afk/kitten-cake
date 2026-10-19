// Kitten Cake - Comprehensive Internationalization (i18n) Engine
// Hỗ trợ song ngữ toàn diện Tiếng Việt (VI) & Tiếng Anh (EN)
(function(window) {
    'use strict';

    const LANG_STORAGE_KEY = 'kitten_lang';
    const USD_RATE = 25000; // Tỷ giá quy đổi ước tính 1 USD ≈ 25.000 VNĐ

    // Kiểm tra URL parameters (?lang=en hoặc ?lang=vi)
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const langParam = urlParams.get('lang');
        if (langParam === 'en' || langParam === 'vi') {
            localStorage.setItem(LANG_STORAGE_KEY, langParam);
        }
    } catch (e) {}

    // Dữ liệu sản phẩm tiếng Anh chuẩn xác 100%
    const productsI18n = {
        menu_1: {
            name: 'Signature Fluffy Donut',
            tag: '🍩 Signature Item',
            badge: 'Best Seller • Signature',
            description: 'Our signature treat baked fresh daily, ultra-soft and fluffy interior glazed with Belgian chocolate, rainbow sprinkles, fresh strawberry, or mellow matcha.',
            unitSubtext: 'Flat 10K (~$0.40)',
            details: {
                shelfLife: 'Best consumed on the day of delivery, or refrigerated for 2 days. Reheat 15s in microwave before enjoying.',
                ingredients: 'Premium Japanese wheat flour, pure unsalted butter, fresh farm eggs, French slow-ferment yeast, imported Belgian chocolate and Kyoto matcha.'
            },
            flavors: [
                { name: 'Belgian Choco', orig: 'Vị Choco' },
                { name: 'Vanilla Glaze', orig: 'Vị Vani' },
                { name: 'Kyoto Matcha', orig: 'Vị Matcha' },
                { name: 'Sweet Strawberry', orig: 'Vị Dâu' }
            ]
        },
        menu_2: {
            name: 'Crispy 64-Layer Egg Tart',
            tag: '🥧 Freshly Baked',
            badge: '64-Layer Crust',
            description: 'Crispy 64-layer flaky crust filled with silky, caramelized egg custard baked to golden perfection.',
            unitSubtext: 'Freshly Baked',
            details: {
                shelfLife: 'Best enjoyed warm on the day. Keep refrigerated for 2 days; reheat in an air fryer at 160°C for 3 minutes.',
                ingredients: 'Artisan puff pastry flour, fresh farm egg yolks, dairy whipping cream, pasteurized milk, pure Anchor butter.'
            },
            flavors: [
                { name: 'Traditional Egg Custard', orig: 'Tart Trứng Truyền Thống' }
            ]
        },
        menu_3: {
            name: 'Oreo Cheesecake Glass Cup',
            tag: '🍰 Chilled Cup',
            badge: 'Customer Favorite',
            description: 'Velvety smooth New Zealand cream cheese layered over crunchy Oreo cookie crumbles in a reusable glass jar.',
            unitSubtext: 'Chilled Cup',
            details: {
                shelfLife: 'Store refrigerated at 2-5°C for 3 - 5 days. Serve chilled directly.',
                ingredients: 'New Zealand cream cheese, authentic Oreo cookies, fresh whipping cream, unsalted butter, light diet sugar.'
            },
            flavors: [
                { name: 'Crunchy Oreo Crumbs', orig: 'Oreo Vụn Giòn' }
            ]
        },
        menu_4: {
            name: 'Refreshing Fruit Panna Cotta',
            tag: '🍮 Italian Dessert',
            badge: 'Light & Refreshing',
            description: 'Silky Italian milk pudding that gently melts on your tongue, paired with house-made tangy berry fruit coulis.',
            unitSubtext: 'Chilled Cup',
            details: {
                shelfLife: 'Keep refrigerated and enjoy chilled within 3 days.',
                ingredients: 'Da Lat fresh whole milk, rich dairy cream, organic gelatin, slow-cooked artisan fruit preserve with zero preservatives.'
            },
            flavors: [
                { name: 'Fresh Strawberry Coulis', orig: 'Sốt Dâu Tây Tươi' },
                { name: 'Tangy Passion Fruit Coulis', orig: 'Sốt Chanh Dây Chua Ngọt' },
                { name: 'Zesty Green Kiwi Coulis', orig: 'Sốt Kiwi Xanh' }
            ]
        },
        menu_5: {
            name: 'Deluxe 6-Donut Cat Gift Box',
            tag: '🎁 Best Value Combo',
            badge: 'Buy 5 Get 1 Free',
            description: 'Adorable Kitten Cake cat-themed gift box containing 6 assorted donuts (Choco, Vanilla, Strawberry, Matcha, Almond). Complimentary message card included!',
            unitSubtext: 'Gift Set',
            details: {
                shelfLife: 'Consume within 24h - 48h. Perfect gift for birthdays, friends, celebrations, and gatherings.',
                ingredients: 'All signature flavors crafted with premium ingredients and cute cat packaging.'
            },
            flavors: [
                { name: 'Assorted 6-Flavor Mix', orig: 'Set Mix 6 Vị Đầy Đủ' }
            ]
        },
        menu_6: {
            name: 'Crispy 4-Pack Egg Tart Box',
            tag: '🥧 Freshly Baked',
            badge: 'Combo Value',
            description: 'A warm, elegant box of 4 freshly baked 64-layer flaky egg tarts, ideal for cozy office tea breaks and family snacks.',
            unitSubtext: 'Freshly Baked',
            details: {
                shelfLife: 'Best enjoyed warm and crispy on the day of delivery.',
                ingredients: 'Fresh farm eggs, whipping cream, artisan pastry dough, and premium butter.'
            },
            flavors: [
                { name: 'Standard 4-Pack Box', orig: 'Hộp 4 Chiếc Tiêu Chuẩn' }
            ]
        }
    };

    // Dữ liệu danh mục sản phẩm tiếng Anh
    const categoriesI18n = {
        cat_donut: {
            name: 'Signature 10K Donuts',
            badge: 'Hot',
            description: 'Freshly baked soft & fluffy donuts, flat 10K VND (~$0.40) every day, packed with sweet glazes.'
        },
        cat_baked: {
            name: 'Fresh Baked Pastries',
            badge: 'Crispy',
            description: 'Flaky 64-layer egg tarts and golden pastries baked with pure French butter.'
        },
        cat_cold: {
            name: 'Chilled Dessert Cups',
            badge: 'Bestseller',
            description: 'Velvety Oreo Cheesecake and fruity Panna Cotta cups, perfectly portable and chilled.'
        },
        cat_combo: {
            name: 'Combo & Gift Sets',
            badge: 'Best Value',
            description: 'Cute Kitten Cake cat-themed gift boxes for birthdays, parties, and sweet surprises.'
        }
    };

    // Dữ liệu phân loại bài viết blog tiếng Anh
    const blogCategoriesI18n = {
        bcat_tips: { name: 'Baking Tips & Tasting' },
        bcat_stories: { name: 'Bakery Kitchen Stories' },
        bcat_promos: { name: 'Promotions & Deals' },
        bcat_storage: { name: 'Storage & Catering' }
    };

    // Dữ liệu toàn bộ bài viết blog tiếng Anh chuẩn xác 100%
    const articlesI18n = {
        art_1: {
            title: 'Secrets to Enjoying Crisp & Soft 10K Donuts in District 7',
            categoryName: 'Baking Tips & Tasting',
            author: 'Head Baker @ Kitten Cake',
            readTime: '3 min read',
            excerpt: 'How to keep your donuts fluffy, soft, and richly coated with Belgian chocolate when taking them home? Let\'s discover these baker tips!',
            content: '<p>At <strong>Kitten Cake</strong>, our donuts are lovingly shaped and freshly baked every morning from 7:30 AM. To achieve an ultra-soft, airy crumb without any oily heaviness, our kitchen follows a proprietary slow-fermentation French dough technique.</p><h3>1. Ideal Serving Temperature</h3><p>When you receive your order from the courier, the donuts are still lightly warm and soft. If refrigerated, pop them into an air fryer or microwave at 150°C for 30 - 45 seconds. The Belgian chocolate or matcha glaze will gently melt, returning the interior to oven-fresh fluffiness!</p><h3>2. The Perfect Drink Pairing</h3><p>A classic 10K Choco Donut pairs impeccably with lightly sweetened Oolong milk tea or a Saigon iced milk coffee, balancing richness with crisp freshness.</p><p>Don\'t forget: Kitten Cake offers a Buy 5 Get 1 Free promotion in our signature cute cat gift box!</p>',
            tags: ['Donuts', 'Baking Tips', 'District 7', 'Sweet Pastry']
        },
        art_2: {
            title: '64-Layer Egg Tart: Why Every Guest at Kitten Cake Orders It?',
            categoryName: 'Bakery Kitchen Stories',
            author: 'Kitten Baker',
            readTime: '4 min read',
            excerpt: 'The story behind our golden, melt-in-your-mouth egg tart with over 64 whisper-thin crispy pastry layers.',
            content: '<p>Beyond our famous 10K donuts, our cozy bakery in District 7 has another shining star: <strong>our warm 64-layer crispy egg tart</strong>.</p><h3>64 Ultra-Crispy Pastry Layers</h3><p>What sets Kitten Cake tarts apart is our patient hand-lamination process incorporating imported pure Anchor butter. Baked at high heat, each delicate layer puffs up with an audible, satisfying crunch with every bite.</p><h3>Silky Caramelized Custard</h3><p>The velvety filling is simmered from fresh farm egg yolks and rich whipping cream, offering delicate sweetness without cloying heaviness. Lightly torched caramelization adds a hint of smoky warmth.</p>',
            tags: ['Egg Tart', 'Kitchen Stories', 'Freshly Baked']
        },
        art_3: {
            title: 'Proper Chilled Dessert Storage: Oreo Cheesecake & Panna Cotta',
            categoryName: 'Storage & Catering',
            author: 'Kitten Cake Team',
            readTime: '3 min read',
            excerpt: 'How to store chilled dessert jars in the fridge at 2-5°C so the cream cheese and berry coulis stay perfectly fresh.',
            content: '<p>Glass jar desserts at Kitten Cake are the perfect grab-and-go solution for busy students and office professionals. Each jar is tightly sealed, hygienic, and convenient.</p><h3>Optimal Storage Temperature</h3><p>Store your cheesecake and panna cotta jars between <strong>3°C and 6°C</strong> in the main compartment of your refrigerator. Avoid door shelves where temperature fluctuates frequently.</p><h3>Recommended Consumption Window</h3><p>- <strong>Oreo Cheesecake:</strong> Best within 3 - 5 days while cookie crumbles retain their rich crunch.<br>- <strong>Panna Cotta:</strong> Best within 2 - 3 days to experience the freshly stewed fruit coulis at its vibrant peak.</p>',
            tags: ['Cheesecake', 'Panna Cotta', 'Cake Storage', 'Chilled Dessert']
        },
        art_4: {
            title: 'Special Student Deal: Buy 5 Donuts, Get 1 FREE in a Cat Gift Box',
            categoryName: 'Promotions & Deals',
            author: 'Kitten Cake Marketing',
            readTime: '2 min read',
            excerpt: 'Just 50,000 VND (~$2.00) for a charming 6-donut box packaged in our cute Kitten Cake cat gift box. Explore now!',
            content: '<p>To support high school and university students at Ton Duc Thang University, RMIT University, and UFM in District 7, Kitten Cake offers an ongoing student combo:</p><ul><li><strong>Buy 5 Donuts, get 1 FREE</strong> (Just 50,000 VND / ~$2.00 for 6 signature donuts).</li><li>Packaged in our adorable Kitten Cake collectible cat box.</li><li>Use promo code <code>KITTEN10</code> for an extra 10% off or <code>FREESHIPQ7</code> for local District 7 orders.</li></ul><p>Order directly through our website to enjoy fresh delivery within 30-45 minutes!</p>',
            tags: ['Promotions', 'Student Deals', 'Donut Box', 'District 7']
        }
    };

    // Từ điển văn bản giao diện
    const translations = {
        vi: {
            // Header & Navigation
            nav_home: 'Trang chủ',
            nav_menu: 'Thực đơn',
            nav_blog: 'Bài viết',
            nav_tracking: 'Tra cứu',
            nav_gallery: 'Hình ảnh',
            nav_about: 'Về tiệm',
            nav_about_full: 'Về chúng tôi',
            nav_contact: 'Liên hệ',
            nav_cart: 'Giỏ hàng',
            nav_checkout: 'Thanh toán',
            nav_add_more: 'Chọn thêm bánh',
            view_cart: 'Xem giỏ hàng bánh',

            // Hero Section
            hero_title_1: 'Thiên Đường Donut',
            hero_title_highlight: 'Đồng Giá Chỉ 10K',
            hero_desc: 'Khám phá món bánh Donut trứ danh tại <strong>Kitten Cake</strong> giữa lòng Quận 7. Bánh tươi mềm xốp nướng mỗi ngày, ngập tràn topping ngọt ngào với mức giá siêu hạt dẻ chỉ <strong>10.000đ/chiếc</strong> dành riêng cho giới trẻ & học sinh sinh viên!',
            hero_badge: 'Donut Signature 10K',
            hero_btn_try: 'Thử Ngay Donut 10K',
            hero_btn_direction: 'Chỉ đường tới tiệm',

            // Brand strip
            brand_strip_alt: 'Kitten Cake - Bánh ngọt cho những khoảnh khắc thêm đáng yêu',

            // Menu Section
            menu_title_part1: 'Thực Đơn',
            menu_title_highlight: 'Signature',
            menu_subtitle: 'Món chính Donut 10K thơm ngon bất bại cùng các dòng bánh ngọt ngào được giới trẻ Quận 7 săn đón nhất.',
            menu_filter_all: 'Tất cả bánh',
            menu_btn_details: 'Chi tiết',
            menu_btn_add_cart: 'Thêm giỏ',
            menu_unit_10k: 'Đồng giá 10K',
            menu_unit_baked: 'Bánh nướng nóng',
            menu_unit_cold: 'Bánh hũ lạnh',
            home_view_all_menu: 'Xem Toàn Bộ Thực Đơn & Danh Mục Bánh',

            // Promo Banner
            promo_title: '🍩 Ưu Đãi Độc Quyền Cho Học Sinh - Sinh Viên',
            promo_desc: 'Mua <strong>Combo 5 Donut tặng ngay 1 Donut</strong> (chỉ 50.000đ được 6 bánh) đóng hộp mèo Kitten Cake xinh xắn mang về!',
            promo_btn: 'Inbox Nhận Ưu Đãi',

            // Gallery Section
            gallery_title_part1: 'Khoảnh Khắc',
            gallery_title_highlight: 'Ngọt Ngào',
            gallery_subtitle: 'Những mẻ bánh mới ra lò mỗi ngày tại gian bếp Kitten Cake Quận 7.',
            gallery_cap_1: 'Khay Donut tình yêu đủ vị',
            gallery_cap_2: 'Hộp quà tặng Donut 12 vị',
            gallery_cap_3: 'Tart trứng ngàn lớp nóng giòn',
            gallery_cap_4: 'Oreo Cheesecake hũ tiện lợi',

            // Home Blog Section
            home_blog_title_part1: 'Góc Bếp &',
            home_blog_title_highlight: 'Mẹo Bánh Ngọt',
            home_blog_subtitle: 'Khám phá công thức giữ bánh nướng mềm xốp, cách bảo quản bánh lạnh và ưu đãi sinh viên hấp dẫn.',
            home_blog_btn_all: 'Xem Tất Cả Bài Viết & Mẹo Hay',

            // About Section
            about_title_part1: 'Về',
            about_title_highlight: 'Kitten Cake',
            about_p1: 'Nằm ẩn mình trong một góc nhỏ yên bình của Quận 7, Kitten Cake mang đến một không gian "chill" đúng điệu cho giới trẻ Sài Thành.',
            about_p2: 'Chúng mình đặc biệt nổi tiếng với <strong>dòng bánh Donut 10K nướng mới mỗi ngày</strong>, mềm xốp và đa dạng hương vị. Với biểu tượng chú mèo lười đáng yêu, Kitten Cake hy vọng mỗi chiếc bánh trao tay đều mang lại niềm vui ngọt ngào, vừa túi tiền cho các bạn học sinh - sinh viên.',
            about_feat_1: 'Donut nướng mới trong ngày, đồng giá 10K',
            about_feat_2: 'Nguyên liệu cao cấp, vị ngọt thanh nhẹ',
            about_feat_3: 'Đặt bánh giao ngay',
            about_feat_4: 'Phục vụ chu đáo, thân thiện và nhiệt tình',

            // Trust Badges
            trust_baked_title: 'Nướng mới mỗi sáng',
            trust_baked_sub: 'Ra lò lúc 7:30 và 14:00',
            trust_ship_title: 'Giao nhanh Quận 7',
            trust_ship_sub: 'Nhận bánh nóng 30-45 phút',
            trust_ingr_title: 'Nguyên liệu chuẩn Nhật',
            trust_ingr_sub: 'Vị ngọt thanh dịu, không ngấy',

            // Mini Cart Drawer
            mini_cart_title: 'Giỏ Hàng Của Bạn',
            mini_cart_empty_title: 'Chưa có chiếc bánh nào trong giỏ...',
            mini_cart_empty_desc: 'Hãy chọn những chiếc bánh thơm ngon ngọt ngào nhé!',
            mini_cart_btn_continue: 'Chọn bánh ngay',
            mini_cart_subtotal_lbl: 'Tạm tính:',
            mini_cart_btn_checkout: 'Xem Giỏ Hàng & Đặt Bánh',

            // Breadcrumb
            bc_home: 'Trang chủ',
            bc_menu: 'Thực đơn',
            bc_cart: 'Giỏ hàng & Thanh toán',
            bc_pdp: 'Chi tiết món bánh',
            bc_catalog: 'Thực đơn & Danh mục bánh',
            bc_blog: 'Góc bếp & Mẹo hay',
            bc_tracking: 'Tra cứu đơn hàng',

            // Catalog Page (products.html)
            catalog_title: 'Thực Đơn Bánh',
            catalog_subtitle: 'Bánh tươi nướng mới mỗi sáng lúc 7:30 và 14:00 - Đồng giá Donut chỉ 10K, Tart trứng giòn rụm và bánh lạnh thanh mát!',
            catalog_chip_all: 'Tất Cả Món Bánh',
            catalog_search_ph: '🔍 Tìm tên món bánh, vị dâu, matcha...',
            filter_price_all: 'Mọi mức giá',
            filter_price_u20: 'Dưới 20.000đ',
            filter_price_20_50: '20.000đ - 50.000đ',
            filter_price_o50: 'Trên 50.000đ',
            sort_default: 'Sắp xếp: Mặc định',
            sort_price_asc: 'Giá: Thấp đến cao',
            sort_price_desc: 'Giá: Cao đến thấp',
            sort_rating_desc: 'Đánh giá cao nhất',
            sort_name_asc: 'Tên: A đến Z',
            catalog_loading: 'Đang tải bánh ngon...',
            catalog_empty_title: 'Không tìm thấy món bánh phù hợp!',
            catalog_empty_desc: 'Hãy thử thay đổi từ khóa tìm kiếm hoặc bấm chọn xem lại "Tất Cả Món Bánh" nhé.',
            catalog_empty_btn: 'Xem tất cả món bánh',

            // Cart & Checkout Page (cart.html)
            cart_title_part1: 'Giỏ Hàng &',
            cart_title_part2: 'Thanh Toán',
            cart_subtitle: 'Kiểm tra danh sách bánh và điền thông tin để tiệm giao tận tay bạn nhé!',
            cart_empty_title: 'Giỏ Hàng Đang Trống!',
            cart_empty_desc: 'Bạn chưa chọn món bánh ngọt ngào nào. Hãy ghé thực đơn để khám phá những hương vị tuyệt vời nhé!',
            cart_empty_btn: 'Khám Phá Thực Đơn Ngay',
            cart_card_order_items: 'Danh Sách Bánh Đã Chọn',
            cart_col_product: 'Món Bánh',
            cart_col_price: 'Đơn Giá',
            cart_col_qty: 'Số Lượng',
            cart_col_total: 'Thành Tiền',
            cart_col_remove: 'Xóa',
            cart_btn_clear_cart: 'Xóa sạch giỏ',

            // Delivery Form
            cart_delivery_heading: 'Thông Tin Giao Bánh',
            lbl_cust_name: 'Họ và tên của bạn:',
            ph_cust_name: 'Ví dụ: Nguyễn Ngọc Cẩm Vân...',
            lbl_cust_phone: 'Số điện thoại nhận bánh:',
            ph_cust_phone: 'Ví dụ: 0898575717...',
            lbl_delivery_area: 'Khu vực nhận hàng:',
            opt_area_q7: 'Giao tận nơi tại Quận 7 (Phí ship 15.000đ)',
            opt_area_other: 'Giao các quận lân cận (Phí ship 25.000đ)',
            opt_area_other_hcm: 'Các quận khác tại TP.HCM (Phí ship 30.000đ)',
            opt_area_pickup: 'Nhận trực tiếp tại tiệm (Quận 7 - Miễn phí ship)',
            lbl_cust_address: 'Địa chỉ nhận bánh chi tiết:',
            ph_cust_address: 'Số nhà, tên đường, tên toà nhà/chung cư, phường...',
            lbl_delivery_time: 'Thời gian muốn nhận bánh:',
            opt_time_now: 'Giao ngay khi có bánh (30-45 phút)',
            opt_time_morning: 'Giao buổi sáng (09:00 - 11:30)',
            opt_time_afternoon: 'Giao buổi chiều (14:00 - 17:00)',
            opt_time_evening: 'Giao buổi tối (18:00 - 21:00)',
            opt_time_custom: 'Hẹn giờ cụ thể (ghi rõ trong ghi chú)',
            lbl_transfer_content: 'Nội dung chuyển khoản:',
            lbl_paypal_note: 'Ghi chú PayPal:',
            lbl_greeting: 'Lời nhắn viết thiệp (Miễn phí):',
            ph_greeting: 'Ví dụ: Chúc mừng sinh nhật bé mèo, Chúc bạn một ngày ngọt ngào...',
            lbl_note: 'Ghi chú thêm cho tiệm:',
            ph_note: 'Ví dụ: Giao lên lầu 3 chung cư, gọi trước khi đến 10 phút...',

            // Voucher & Summary
            voucher_heading: 'Mã Giảm Giá / Voucher',
            ph_voucher: 'Nhập mã voucher (ví dụ: KITTEN10)',
            btn_apply_voucher: 'Áp dụng',
            voucher_suggestion: 'Gợi ý mã ưu đãi:',
            summary_heading: 'Tổng Kết Đơn Hàng',
            summary_subtotal: 'Tiền bánh:',
            summary_shipping: 'Phí giao hàng:',
            summary_combo_discount: 'Ưu đãi Mua 5 Tặng 1:',
            summary_voucher_discount: 'Giảm giá voucher:',
            summary_total: 'Tổng thanh toán:',

            // Payment Methods
            payment_heading: 'Phương Thức Thanh Toán',
            pay_cod_title: 'Thanh toán tiền mặt khi nhận bánh (COD)',
            pay_cod_desc: 'Khách hàng thanh toán trực tiếp cho shipper khi nhận bánh nóng hổi.',
            pay_banking_title: 'Chuyển khoản ngân hàng VietQR (Quét mã tự động)',
            pay_banking_desc: 'Quét mã VietQR trên app mọi ngân hàng, tự động điền số tiền và nội dung chuyển.',
            pay_paypal_title: 'PayPal (Thanh toán Quốc tế / Khách nước ngoài)',
            pay_paypal_desc: 'Thanh toán qua PayPal.Me tiện lợi dành cho thẻ quốc tế Visa, Master hoặc tài khoản PayPal.',

            // VietQR Box
            vietqr_box_title: 'Mã VietQR Kitten Cake',
            vietqr_scan_tag: 'Quét Bằng App Ngân Hàng',
            lbl_bank: 'Ngân hàng:',
            lbl_acc_num: 'Số tài khoản:',
            lbl_acc_name: 'Chủ tài khoản:',
            lbl_transfer_amount: 'Số tiền cần chuyển:',
            btn_copy: 'Sao chép',
            vietqr_guide: 'Vui lòng quét mã trên app ngân hàng để chuyển khoản chính xác nhất.',

            // PayPal Box
            paypal_box_title: 'Thanh toán Quốc tế qua PayPal.Me',
            paypal_tag: 'Dành Cho Khách Quốc Tế & Thẻ Nước Ngoài',
            lbl_paypal_acc: 'Tài khoản PayPal:',
            lbl_paypal_link: 'Link PayPal.Me:',
            lbl_paypal_vnd: 'Số tiền VNĐ:',
            lbl_paypal_usd: 'Quy đổi ước tính USD:',
            btn_open_paypal: 'Mở PayPal Thanh Toán Ngay',
            btn_copy_paypal: 'Sao chép link PayPal',
            paypal_guide_1: 'Bấm <b>Mở PayPal Thanh Toán Ngay</b> để chuyển sang trang PayPal.Me chính thức của tiệm bánh Kitten Cake.',
            paypal_guide_2: 'Vui lòng nhập đúng số tiền USD ước tính và ghi chú <b>Số điện thoại</b> hoặc <b>Họ tên</b> khi gửi để tiệm xác nhận đơn nhanh nhất.',

            // Submit Button & Guarantee
            btn_submit_checkout: 'Gửi Đơn Đặt Bánh Ngay',
            checkout_guarantee: 'Tiệm sẽ gọi điện hoặc nhắn tin Zalo xác nhận đơn hàng sau 5 - 10 phút.',

            // Success Modal
            success_title: 'Đặt Bánh Thành Công!',
            success_sub: 'Cảm ơn bạn đã lựa chọn những chiếc bánh ngọt ngào từ <strong>Kitten Cake</strong>.',
            lbl_order_id: 'Mã đơn hàng:',
            lbl_cust: 'Khách hàng:',
            lbl_phone: 'Số điện thoại:',
            lbl_address: 'Địa chỉ nhận:',
            lbl_total_amount: 'Tổng thanh toán:',
            lbl_payment_method: 'Phương thức thanh toán:',
            btn_back_home: 'Về trang chủ',
            btn_chat_fb: 'Xác nhận qua Chat Fanpage',
            method_cod: 'Tiền mặt khi nhận bánh (COD)',
            method_banking: 'Chuyển khoản VietQR',
            method_paypal: 'PayPal Quốc tế (emmeoVN)',

            // Product Detail Page (product.html)
            pdp_rating_text: '5.0 / 5',
            pdp_rating_count: '(Hơn 180+ bạn trẻ Quận 7 yêu thích)',
            pdp_in_stock: 'Đang nướng sẵn tại tiệm',
            pdp_combo_badge: 'ƯU ĐÃI COMBO',
            pdp_combo_text: 'Mua <strong>5 tặng 1 MIỄN PHÍ</strong>: Khi thêm đủ <strong>6 chiếc bánh vào giỏ</strong>, chiếc bánh có giá thấp nhất sẽ được <strong>TẶNG 0Đ</strong>!',
            pdp_lbl_flavor: 'Chọn vị bánh:',
            pdp_lbl_topping: 'Thêm Topping thơm giòn:',
            pdp_topping_price: '+3.000đ / loại',
            pdp_topping_selected: 'Đã chọn:',
            pdp_lbl_qty: 'Số lượng:',
            pdp_subtotal: 'Tạm tính:',
            pdp_btn_add_cart: 'Thêm vào giỏ hàng',
            pdp_btn_preorder: 'Đặt trước bánh (Pre-order)',
            pdp_btn_buy_now: 'Mua ngay',
            pdp_btn_preorder_now: 'Đặt trước ngay',
            menu_btn_preorder: 'Đặt trước',
            badge_preorder: 'Đặt trước',
            status_pre_order: 'Nhận đặt trước (Pre-order)',
            status_in_stock: 'Đang bán sẵn',
            status_out_of_stock: 'Hết hàng hôm nay',
            pdp_large_order: 'Cần đặt hộp tiệc lớn hoặc set quà tặng?',
            pdp_chat_link: 'Nhắn tin Fanpage Kitten Cake',
            tab_ingredients: 'Thành phần & Hương vị',
            tab_preservation: 'Hướng dẫn bảo quản',
            tab_shipping: 'Giao hàng & Đóng gói',
            tab_reviews: 'Đánh giá từ khách hàng (180+)',
            pdp_tab1_title: 'Nguyên liệu làm bánh chất lượng',
            pdp_tab1_li1: 'Không chất bảo quản nhân tạo hay phẩm màu độc hại.',
            pdp_tab1_li2: 'Vị ngọt được gia giảm theo chuẩn Healthy, thích hợp cho các bạn trẻ ăn vặt mỗi ngày.',
            pdp_tab1_li3: 'Bánh nướng trực tiếp trong ngày tại lò bánh Quận 7.',
            pdp_tab2_title: 'Thời gian sử dụng & Bảo quản tốt nhất',
            pdp_tab2_tips_head: 'Mẹo nhỏ khi thưởng thức:',
            pdp_tab2_tips_desc: 'Nếu để ngăn mát tủ lạnh, bạn có thể quay lò vi sóng từ 10 - 15 giây hoặc nồi chiên không dầu 120°C trong 2 phút để lớp vỏ bánh mềm nóng xốp như vừa mới ra lò!',
            pdp_tab3_title: 'Chính sách giao hàng Kitten Cake',
            pdp_tab3_d7_title: 'Nội thành Quận 7:',
            pdp_tab3_d7_desc: 'Đồng giá 15.000đ • Giao nhanh trong 30-45 phút.',
            pdp_tab3_other_title: 'Quận lân cận (Q1, Q4, Q8, Nhà Bè):',
            pdp_tab3_other_desc: 'Đồng giá 25.000đ • Giao trong 45-60 phút.',
            pdp_tab3_free_title: 'Miễn phí giao hàng:',
            pdp_tab3_free_desc: 'Đơn hàng từ 120.000đ trở lên được miễn phí ship toàn bộ!',
            pdp_related_title: 'Món Ngon <span class="highlight">Thường Mua Kèm</span>',
            pdp_related_subtitle: 'Khám phá thêm các món bánh thơm ngon khác được các tín đồ đồ ngọt yêu thích.',

            // Blog & Post Pages (blog.html, post.html)
            blog_title: 'Góc Bếp & Mẹo Bánh Ngọt',
            blog_subtitle: 'Khám phá công thức giữ bánh nướng mềm xốp, cách bảo quản bánh lạnh và ưu đãi sinh viên hấp dẫn.',
            blog_search_ph: '🔍 Tìm kiếm mẹo làm bánh, bài viết...',
            blog_all_cats: 'Tất cả bài viết',
            blog_read_more: 'Đọc chi tiết',
            blog_reading_time: 'phút đọc',
            blog_views: 'lượt xem',
            blog_empty_title: 'Không tìm thấy bài viết nào!',
            blog_empty_desc: 'Hãy thử tìm kiếm với từ khóa khác hoặc chọn xem lại danh mục "Tất cả bài viết".',
            post_shoppable_tag: '✨ Món Bánh Trong Bài Viết',
            post_shoppable_view: 'Xem chi tiết bánh',
            post_shoppable_order: 'Đặt giao ngay',
            post_share_lbl: 'Chia sẻ:',
            post_sidebar_promo_title: 'Ưu Đãi Mua 5 Tặng 1',
            post_sidebar_promo_desc: 'Chỉ 50.000đ sở hữu ngay hộp quà 6 chiếc Donut ngọt ngào!',
            post_sidebar_promo_btn: 'Đặt Combo Ngay',
            post_sidebar_related_title: 'Bài Viết Cùng Chủ Đề',

            // Order Tracking (order-tracking.html)
            tracking_title: 'Tra Cứu Tiến Trình Đơn Bánh',
            tracking_subtitle: 'Nhập mã đơn hàng hoặc số điện thoại để theo dõi đơn bánh Kitten Cake của bạn.',
            tracking_input_ph: 'Nhập mã đơn hàng (ví dụ: KC-8921) hoặc số điện thoại...',
            tracking_btn_search: 'Tra Cứu Ngay',
            tracking_quick_hint: '💡 Gợi ý tra cứu nhanh:',
            tracking_loading_txt: 'Đang kết nối gian bếp Kitten Cake để lấy dữ liệu đơn hàng...',
            tracking_empty_title: 'Không tìm thấy đơn bánh!',
            tracking_empty_desc: 'Vui lòng kiểm tra lại mã đơn hàng hoặc số điện thoại bạn đã dùng khi đặt bánh nhé.',
            step_pending: 'Tiếp nhận đơn',
            step_baking: 'Đang nướng bánh',
            step_shipping: 'Đang giao hàng',
            step_completed: 'Giao thành công',
            tracking_order_id: 'Mã đơn hàng:',
            tracking_ordered_at: 'Đặt lúc:',
            tracking_payment: 'Thanh toán:',
            tracking_cust_title: 'Thông Tin Khách Hàng',
            tracking_cust_name: 'Họ tên:',
            tracking_cust_phone: 'Số điện thoại:',
            tracking_deliv_title: 'Địa Chỉ Giao Bánh',
            tracking_notes: 'Ghi chú:',
            tracking_items_title: 'Chi Tiết Món Bánh Đã Đặt',
            tracking_col_product: 'Sản phẩm',
            tracking_col_qty: 'Số lượng',
            tracking_col_total: 'Thành tiền',
            tracking_subtotal: 'Tiền bánh:',
            tracking_shipping: 'Phí giao hàng:',
            tracking_voucher: 'Giảm giá voucher:',
            tracking_combo_gift: 'Quà tặng combo:',
            tracking_total_pay: 'Tổng thanh toán:',
            tracking_hotline_txt: 'Cần thay đổi giờ giao hoặc thêm ghi chú?',
            tracking_cancelled_msg: 'Đơn hàng này đã bị hủy. Vui lòng liên hệ Hotline nếu bạn cần đặt lại bánh!',

            // Quick Order Modal (index.html)
            quick_order_title: 'Đặt Bánh Nhanh',
            quick_order_sub: 'Kitten Cake Quận 7 gọi lại xác nhận ngay',
            quick_order_flavor_lbl: 'Chọn hương vị bánh:',
            flavor_white_choco: 'Chocolate Trắng',
            flavor_matcha: 'Matcha',
            flavor_strawberry: 'Dâu',
            flavor_choco: 'Chocolate',
            quick_order_name_lbl: 'Họ và tên của bạn',
            quick_order_phone_lbl: 'Số điện thoại',
            quick_order_qty_lbl: 'Số lượng',
            quick_order_note_lbl: 'Ghi chú / Địa chỉ giao hàng',
            quick_order_submit: 'Gửi đơn đặt bánh',

            // Quick Add Flavor Modal (products.html)
            quick_modal_title: 'Chọn Vị Bánh Yêu Thích',
            quick_modal_flavor_lbl: 'Vị bánh yêu thích:',
            quick_modal_qty_lbl: 'Số lượng bánh:',
            quick_modal_add_btn: 'Thêm Vào Giỏ Ngay',

            // Footer
            footer_tagline: 'Tiệm bánh ngọt nhỏ xinh tại Quận 7 - Nơi gửi gắm yêu thương qua từng vị ngọt.',
            footer_heading_contact: 'Liên hệ đặt bánh',
            footer_address_val: 'Quận 7, TP. Hồ Chí Minh',
            footer_heading_hours: 'Giờ mở cửa',
            footer_weekdays: 'Thứ 2 - Thứ 6: 08:00 - 22:00',
            footer_weekends: 'Thứ 7 - CN: 07:30 - 22:30',
            footer_admin_link: 'Quản trị CMS',
            footer_copy: '© 2026 Kitten Cake Bakery. Thiết kế bởi chuyên gia Web.',

            // Toasts & Messages
            toast_added_to_cart: 'Đã thêm {name} vào giỏ hàng!',
            toast_item_removed: 'Đã xóa món khỏi giỏ hàng.',
            toast_cart_cleared: 'Đã xóa sạch giỏ hàng.',
            toast_copied: 'Đã sao chép vào bộ nhớ tạm!'
        },
        en: {
            // Header & Navigation
            nav_home: 'Home',
            nav_menu: 'Menu',
            nav_blog: 'Blog & Tips',
            nav_tracking: 'Order Tracking',
            nav_gallery: 'Moments',
            nav_about: 'About Us',
            nav_about_full: 'About Kitten Cake',
            nav_contact: 'Contact',
            nav_cart: 'Cart',
            nav_checkout: 'Checkout',
            nav_add_more: 'Add More Treats',
            view_cart: 'View Cart',

            // Hero Section
            hero_title_1: 'Donut Paradise',
            hero_title_highlight: 'Flat 10K VND (~$0.40)',
            hero_desc: 'Discover the renowned Donuts at <strong>Kitten Cake</strong> in the heart of District 7. Freshly baked, soft and fluffy daily, loaded with sweet toppings at student-friendly prices of just <strong>10,000 VND (~$0.40)</strong> each!',
            hero_badge: 'Signature 10K Donut',
            hero_btn_try: 'Explore Cake Menu',
            hero_btn_direction: 'Get Directions',

            // Brand strip
            brand_strip_alt: 'Kitten Cake - Sweet treats for heartwarming moments',

            // Menu Section
            menu_title_part1: 'Signature',
            menu_title_highlight: 'Menu',
            menu_subtitle: 'Our unbeatable 10K signature donuts alongside the most sought-after sweet desserts in District 7.',
            menu_filter_all: 'All Cakes',
            menu_btn_details: 'Details',
            menu_btn_add_cart: 'Add to Cart',
            menu_unit_10k: 'Flat 10K (~$0.40)',
            menu_unit_baked: 'Freshly Baked',
            menu_unit_cold: 'Chilled Cup',
            home_view_all_menu: 'View Complete Bakery Menu & Categories',

            // Promo Banner
            promo_title: '🍩 Exclusive Student Offer',
            promo_desc: 'Buy <strong>Combo 5 Donuts and get 1 FREE</strong> (only 50,000 VND / ~$2.00 for 6 donuts) in our charming cat gift box to take home!',
            promo_btn: 'Order Combo Box',

            // Gallery Section
            gallery_title_part1: 'Sweet',
            gallery_title_highlight: 'Moments',
            gallery_subtitle: 'Fresh oven batches baked daily in the Kitten Cake kitchen, District 7.',
            gallery_cap_1: 'Assorted Heartfelt Donut Tray',
            gallery_cap_2: '12-Flavor Deluxe Donut Gift Box',
            gallery_cap_3: 'Crispy Multi-Layer Hot Egg Tart',
            gallery_cap_4: 'Convenient Oreo Cheesecake Cup',

            // Home Blog Section
            home_blog_title_part1: 'Kitchen Corner &',
            home_blog_title_highlight: 'Baking Tips',
            home_blog_subtitle: 'Discover tips for fluffy baked donuts, chilling dessert guides, and student deals.',
            home_blog_btn_all: 'View All Articles & Tips',

            // About Section
            about_title_part1: 'About',
            about_title_highlight: 'Kitten Cake',
            about_p1: 'Tucked away in a tranquil corner of District 7, Kitten Cake provides the coziest sweet spot for youth and dessert lovers in Saigon.',
            about_p2: 'We are renowned for our <strong>signature 10K donuts freshly baked daily</strong>, soft, fluffy and packed with delightful flavors. With our cute lazy cat emblem, Kitten Cake brings joy and sweetness at wallet-friendly student prices.',
            about_feat_1: 'Freshly baked daily donuts, flat 10K VND (~$0.40)',
            about_feat_2: 'Premium Japanese-grade ingredients, delicate sweetness',
            about_feat_3: 'Instant fast delivery in District 7 & Saigon',
            about_feat_4: 'Attentive, warm and dedicated service',

            // Trust Badges
            trust_baked_title: 'Baked Fresh Daily',
            trust_baked_sub: 'Fresh batches at 7:30 AM & 2:00 PM',
            trust_ship_title: 'Fast Delivery in District 7',
            trust_ship_sub: 'Warm delivery within 30-45 mins',
            trust_ingr_title: 'Japanese Standards',
            trust_ingr_sub: 'Delicate sweetness, perfectly balanced',

            // Mini Cart Drawer
            mini_cart_title: 'Your Shopping Cart',
            mini_cart_empty_title: 'Your cart is currently empty...',
            mini_cart_empty_desc: 'Choose your favorite delicious cakes!',
            mini_cart_btn_continue: 'Start Shopping',
            mini_cart_subtotal_lbl: 'Subtotal:',
            mini_cart_btn_checkout: 'View Cart & Checkout',

            // Breadcrumb
            bc_home: 'Home',
            bc_menu: 'Menu',
            bc_cart: 'Cart & Checkout',
            bc_pdp: 'Cake Details',
            bc_catalog: 'Bakery Menu & Categories',
            bc_blog: 'Kitchen & Baking Tips',
            bc_tracking: 'Order Tracking',

            // Catalog Page (products.html)
            catalog_title: 'Bakery Menu',
            catalog_subtitle: 'Freshly baked daily at 7:30 AM & 2:00 PM - Flat 10K Donuts, crispy Egg Tarts, and refreshing chilled desserts!',
            catalog_chip_all: 'All Cakes',
            catalog_search_ph: '🔍 Search cake name, strawberry, matcha...',
            filter_price_all: 'All Prices',
            filter_price_u20: 'Under 20,000 VND (<$0.80)',
            filter_price_20_50: '20,000 - 50,000 VND ($0.80 - $2.00)',
            filter_price_o50: 'Above 50,000 VND (>$2.00)',
            sort_default: 'Sort: Default',
            sort_price_asc: 'Price: Low to High',
            sort_price_desc: 'Price: High to Low',
            sort_rating_desc: 'Highest Rated',
            sort_name_asc: 'Name: A to Z',
            catalog_loading: 'Loading delicious cakes...',
            catalog_empty_title: 'No matching cakes found!',
            catalog_empty_desc: 'Try changing your search keyword or click "All Cakes" to browse our full menu.',
            catalog_empty_btn: 'View All Cakes',

            // Cart & Checkout Page (cart.html)
            cart_title_part1: 'Shopping Cart &',
            cart_title_part2: 'Checkout',
            cart_subtitle: 'Review your items and enter delivery details so we can deliver fresh to your door!',
            cart_empty_title: 'Your Cart is Empty!',
            cart_empty_desc: 'You haven\'t selected any sweet treats yet. Explore our delicious menu now!',
            cart_empty_btn: 'Explore Our Menu',
            cart_card_order_items: 'Selected Items in Cart',
            cart_col_product: 'Item',
            cart_col_price: 'Unit Price',
            cart_col_qty: 'Qty',
            cart_col_total: 'Total',
            cart_col_remove: 'Remove',
            cart_btn_clear_cart: 'Clear Cart',

            // Delivery Form
            cart_delivery_heading: 'Delivery Information',
            lbl_cust_name: 'Your Full Name:',
            ph_cust_name: 'e.g. John Doe, Sarah...',
            lbl_cust_phone: 'Phone / WhatsApp Number:',
            ph_cust_phone: 'e.g. +84 898575717 or local mobile...',
            lbl_delivery_area: 'Delivery Area:',
            opt_area_q7: 'District 7 Delivery (Fee: 15,000 VND / ~$0.60)',
            opt_area_other: 'Neighboring Districts in HCMC (Fee: 25,000 VND / ~$1.00)',
            opt_area_other_hcm: 'Other districts in HCMC (Fee: 30,000 VND / ~$1.20)',
            opt_area_pickup: 'Self Pick-up at Bakery (District 7 - Free)',
            lbl_cust_address: 'Detailed Delivery Address:',
            ph_cust_address: 'Street address, building/apartment name, ward...',
            lbl_delivery_time: 'Preferred Delivery Time:',
            opt_time_now: 'As soon as baked (30-45 minutes)',
            opt_time_morning: 'Morning delivery (09:00 - 11:30 AM)',
            opt_time_afternoon: 'Afternoon delivery (02:00 - 05:00 PM)',
            opt_time_evening: 'Evening delivery (06:00 - 09:00 PM)',
            opt_time_custom: 'Custom appointment (specify in notes)',
            lbl_transfer_content: 'Transfer Memo:',
            lbl_paypal_note: 'PayPal note memo:',
            lbl_greeting: 'Greeting Card Message (Complimentary):',
            ph_greeting: 'e.g. Happy Birthday, Best Wishes...',
            lbl_note: 'Special Notes / Instructions:',
            ph_note: 'e.g. Please bring cutlery, call before arrival...',

            // Voucher & Summary
            voucher_heading: 'Promo Code / Voucher',
            ph_voucher: 'Enter promo code (e.g. KITTEN10)',
            btn_apply_voucher: 'Apply',
            voucher_suggestion: 'Suggested codes:',
            summary_heading: 'Order Summary',
            summary_subtotal: 'Items Subtotal:',
            summary_shipping: 'Shipping Fee:',
            summary_combo_discount: 'Buy 5 Get 1 Free Promo:',
            summary_voucher_discount: 'Voucher Discount:',
            summary_total: 'Total Amount:',

            // Payment Methods
            payment_heading: 'Payment Method',
            pay_cod_title: 'Cash on Delivery (COD)',
            pay_cod_desc: 'Pay directly to the delivery courier once your cakes arrive.',
            pay_banking_title: 'VietQR Bank Transfer (Vietnam Banks)',
            pay_banking_desc: 'Instant QR payment via Vietnamese banking apps (Napas 24/7).',
            pay_paypal_title: 'PayPal (International / Overseas Customers)',
            pay_paypal_desc: 'Fast, secure checkout via PayPal.Me for international cards (Visa, MasterCard).',

            // VietQR Box
            vietqr_box_title: 'VietQR Payment - Kitten Cake',
            vietqr_scan_tag: 'Scan in Banking App',
            lbl_bank: 'Bank:',
            lbl_acc_num: 'Account No:',
            lbl_acc_name: 'Beneficiary:',
            lbl_transfer_amount: 'Amount to Transfer:',
            btn_copy: 'Copy',
            vietqr_guide: 'Please scan via your banking app for the most accurate transaction.',

            // PayPal Box
            paypal_box_title: 'PayPal.Me International Payment',
            paypal_tag: 'For International & Foreign Cards',
            lbl_paypal_acc: 'PayPal Account:',
            lbl_paypal_link: 'PayPal.Me Link:',
            lbl_paypal_vnd: 'VND Total:',
            lbl_paypal_usd: 'Estimated USD Total:',
            btn_open_paypal: 'Open PayPal & Pay Now',
            btn_copy_paypal: 'Copy PayPal Link',
            paypal_guide_1: 'Click <b>Open PayPal & Pay Now</b> to open Kitten Cake\'s verified PayPal.Me page.',
            paypal_guide_2: 'Please send the USD amount and include your <b>Phone Number</b> or <b>Name</b> in the PayPal note for fast verification.',

            // Submit Button & Guarantee
            btn_submit_checkout: 'Place Order Now',
            checkout_guarantee: 'Our bakery will call or text to confirm your order within 5-10 minutes.',

            // Success Modal
            success_title: 'Order Placed Successfully!',
            success_sub: 'Thank you for choosing delicious sweetness from <strong>Kitten Cake</strong>.',
            lbl_order_id: 'Order ID:',
            lbl_cust: 'Customer:',
            lbl_phone: 'Phone Number:',
            lbl_address: 'Delivery Address:',
            lbl_total_amount: 'Total Amount:',
            lbl_payment_method: 'Payment Method:',
            btn_back_home: 'Back to Homepage',
            btn_chat_fb: 'Confirm via Fanpage Chat',
            method_cod: 'Cash on Delivery (COD)',
            method_banking: 'VietQR Bank Transfer',
            method_paypal: 'International PayPal (emmeoVN)',

            // Product Detail Page (product.html)
            pdp_rating_text: '5.0 / 5',
            pdp_rating_count: '(Loved by over 180+ youth in District 7)',
            pdp_in_stock: 'Freshly baked in store',
            pdp_combo_badge: 'COMBO DEAL',
            pdp_combo_text: 'Buy <strong>5 get 1 FREE</strong>: Add any <strong>6 cakes to your cart</strong>, and the lowest-priced cake will be <strong>100% FREE</strong>!',
            pdp_lbl_flavor: 'Select Flavor:',
            pdp_lbl_topping: 'Add Crunchy Toppings:',
            pdp_topping_price: '+3,000 VND (~$0.12) each',
            pdp_topping_selected: 'Selected:',
            pdp_lbl_qty: 'Quantity:',
            pdp_subtotal: 'Subtotal:',
            pdp_btn_add_cart: 'Add to Cart',
            pdp_btn_preorder: 'Pre-order Cake',
            pdp_btn_buy_now: 'Buy Now',
            pdp_btn_preorder_now: 'Pre-order Now',
            menu_btn_preorder: 'Pre-order',
            badge_preorder: 'Pre-order',
            status_pre_order: 'Pre-order Available',
            status_in_stock: 'In Stock',
            status_out_of_stock: 'Sold Out',
            pdp_large_order: 'Need a large customized gift box?',
            pdp_chat_link: 'Message Kitten Cake Fanpage',
            tab_ingredients: 'Ingredients & Flavors',
            tab_preservation: 'Storage Guide',
            tab_shipping: 'Shipping & Packaging',
            tab_reviews: 'Customer Reviews (180+)',
            pdp_tab1_title: 'Premium Quality Ingredients',
            pdp_tab1_li1: 'No artificial preservatives or harmful food colorings.',
            pdp_tab1_li2: 'Balanced sweetness tailored for healthy daily snacking.',
            pdp_tab1_li3: 'Baked fresh daily directly in our District 7 bakery.',
            pdp_tab2_title: 'Shelf Life & Best Storage Practices',
            pdp_tab2_tips_head: 'Pro tip for best taste:',
            pdp_tab2_tips_desc: 'If refrigerated, microwave for 10-15 seconds or air-fry at 120°C for 2 minutes to restore that oven-fresh soft texture!',
            pdp_tab3_title: 'Kitten Cake Delivery Policy',
            pdp_tab3_d7_title: 'District 7 Local:',
            pdp_tab3_d7_desc: 'Flat 15,000 VND (~$0.60) • Fast delivery in 30-45 mins.',
            pdp_tab3_other_title: 'Neighboring Districts (D1, D4, D8, Nha Be):',
            pdp_tab3_other_desc: 'Flat 25,000 VND (~$1.00) • Delivery in 45-60 mins.',
            pdp_tab3_free_title: 'Free Shipping:',
            pdp_tab3_free_desc: 'Free shipping on all orders from 120,000 VND (~$4.80)!',
            pdp_related_title: 'Frequently <span class="highlight">Bought Together</span>',
            pdp_related_subtitle: 'Discover other delicious treats loved by sweet dessert enthusiasts.',

            // Blog & Post Pages (blog.html, post.html)
            blog_title: 'Kitchen Corner & Baking Tips',
            blog_subtitle: 'Discover tips for fluffy baked donuts, chilling dessert guides, and student deals.',
            blog_search_ph: '🔍 Search baking tips, articles...',
            blog_all_cats: 'All Articles',
            blog_read_more: 'Read More',
            blog_reading_time: 'min read',
            blog_views: 'views',
            blog_empty_title: 'No articles found in this category!',
            blog_empty_desc: 'Try selecting another category or searching with different keywords.',
            post_shoppable_tag: '✨ Featured Cake in Article',
            post_shoppable_view: 'View Cake Details',
            post_shoppable_order: 'Order Delivery Now',
            post_share_lbl: 'Share:',
            post_sidebar_promo_title: 'Buy 5 Get 1 Free Deal',
            post_sidebar_promo_desc: 'Only 50K (~$2.00) for 6 donuts in a cute cat box!',
            post_sidebar_promo_btn: 'Order Combo Now',
            post_sidebar_related_title: 'Related Articles',

            // Order Tracking (order-tracking.html)
            tracking_title: 'Order Progress Tracking',
            tracking_subtitle: 'Enter your order ID or phone number to track your Kitten Cake delivery.',
            tracking_input_ph: 'Enter Order ID (e.g. KC-8921) or Phone Number...',
            tracking_btn_search: 'Track Order Now',
            tracking_quick_hint: '💡 Quick search suggestions:',
            tracking_loading_txt: 'Connecting to Kitten Cake bakery for order details...',
            tracking_empty_title: 'No cake order found!',
            tracking_empty_desc: 'Please check your Order ID or phone number used when placing the order.',
            step_pending: 'Pending Confirmation',
            step_baking: 'Baking Fresh',
            step_shipping: 'Out for Delivery',
            step_completed: 'Delivered',
            tracking_order_id: 'Order ID:',
            tracking_ordered_at: 'Placed at:',
            tracking_payment: 'Payment:',
            tracking_cust_title: 'Customer Details',
            tracking_cust_name: 'Full Name:',
            tracking_cust_phone: 'Phone Number:',
            tracking_deliv_title: 'Delivery Address',
            tracking_notes: 'Notes:',
            tracking_items_title: 'Ordered Cake Details',
            tracking_col_product: 'Product',
            tracking_col_qty: 'Qty',
            tracking_col_total: 'Total',
            tracking_subtotal: 'Subtotal:',
            tracking_shipping: 'Shipping Fee:',
            tracking_voucher: 'Voucher Discount:',
            tracking_combo_gift: 'Combo Gift:',
            tracking_total_pay: 'Total Payment:',
            tracking_hotline_txt: 'Need to change delivery time or add instructions?',
            tracking_cancelled_msg: 'This order has been cancelled. Please contact our Hotline if you need to reorder!',

            // Quick Order Modal (index.html)
            quick_order_title: 'Quick Cake Order',
            quick_order_sub: 'Kitten Cake District 7 will call/text promptly to confirm',
            quick_order_flavor_lbl: 'Select cake flavor:',
            flavor_white_choco: 'White Chocolate',
            flavor_matcha: 'Matcha Green Tea',
            flavor_strawberry: 'Sweet Strawberry',
            flavor_choco: 'Belgian Chocolate',
            quick_order_name_lbl: 'Your full name',
            quick_order_phone_lbl: 'Phone number',
            quick_order_qty_lbl: 'Quantity',
            quick_order_note_lbl: 'Notes / Delivery address',
            quick_order_submit: 'Confirm Order Now',

            // Quick Add Flavor Modal (products.html)
            quick_modal_title: 'Select Cake Flavor',
            quick_modal_flavor_lbl: 'Favorite flavor:',
            quick_modal_qty_lbl: 'Quantity:',
            quick_modal_add_btn: 'Add to Cart Now',

            // Footer
            footer_tagline: 'A lovely sweet bakery in District 7 - Sending love through every gentle bite.',
            footer_heading_contact: 'Order & Contact',
            footer_address_val: 'District 7, Ho Chi Minh City, Vietnam',
            footer_heading_hours: 'Opening Hours',
            footer_weekdays: 'Mon - Fri: 08:00 AM - 10:00 PM',
            footer_weekends: 'Sat - Sun: 07:30 AM - 10:30 PM',
            footer_admin_link: 'CMS Admin',
            footer_copy: '© 2026 Kitten Cake Bakery. Crafted by Web Specialists.',

            // Toasts & Messages
            toast_added_to_cart: 'Added {name} to cart!',
            toast_item_removed: 'Removed item from cart.',
            toast_cart_cleared: 'Cart has been cleared.',
            toast_copied: 'Copied to clipboard!'
        }
    };

    // Từ điển tự động quét và dịch các chuỗi văn bản phổ biến (Dynamic Auto-Translate Dictionary)
    const autoPhrases = [
        // Product names
        { vi: 'Donut Xốp Mềm Signature', en: 'Signature Fluffy Donut' },
        { vi: 'Donut Xốp Mềm', en: 'Signature Fluffy Donut' },
        { vi: 'Tart Trứng Béo Ngậy Giòn Rụm', en: 'Crispy 64-Layer Egg Tart' },
        { vi: 'Tart Trứng Béo Ngậy', en: 'Crispy 64-Layer Egg Tart' },
        { vi: 'Oreo Cheesecake Hũ Thủy Tinh', en: 'Oreo Cheesecake Glass Cup' },
        { vi: 'Oreo Cheesecake Hũ', en: 'Oreo Cheesecake Glass Cup' },
        { vi: 'Panna Cotta Trái Cây Thanh Mát', en: 'Refreshing Fruit Panna Cotta' },
        { vi: 'Panna Cotta Trái Cây', en: 'Refreshing Fruit Panna Cotta' },
        { vi: 'Combo Hộp 6 Donut Quà Tặng', en: 'Deluxe 6-Donut Cat Gift Box' },
        { vi: 'Hộp 4 Tart Trứng Nóng Giòn', en: 'Crispy 4-Pack Egg Tart Box' },

        // Category names
        { vi: 'Donut Signature 10K', en: 'Signature 10K Donuts' },
        { vi: 'Bánh Nướng Nóng', en: 'Fresh Baked Pastries' },
        { vi: 'Bánh Lạnh & Mousse Hũ', en: 'Chilled Dessert Cups' },
        { vi: 'Combo & Hộp Quà Tặng', en: 'Combo & Gift Sets' },
        { vi: 'Mẹo Bánh & Thưởng Thức', en: 'Baking Tips & Tasting' },
        { vi: 'Chuyện Bếp Kitten Cake', en: 'Bakery Kitchen Stories' },
        { vi: 'Khuyến Mãi & Ưu Đãi', en: 'Promotions & Deals' },
        { vi: 'Bảo Quản & Đặt Tiệc', en: 'Storage & Catering' },

        // Article Titles
        { vi: 'Bí Quyết Thưởng Thức Donut 10K Giòn Xốp Chuẩn Vị Giới Trẻ Quận 7', en: 'Secrets to Enjoying Crisp & Soft 10K Donuts in District 7' },
        { vi: 'Tart Trứng Ngàn Lớp: Vì Sao Ai Đến Kitten Cake Cũng Phải Gọi Thử?', en: '64-Layer Egg Tart: Why Every Guest at Kitten Cake Orders It?' },
        { vi: 'Hướng Dẫn Bảo Quản Bánh Lạnh Hũ: Oreo Cheesecake & Panna Cotta Đúng Cách', en: 'Proper Chilled Dessert Storage: Oreo Cheesecake & Panna Cotta' },
        { vi: 'Ưu Đãi Đặc Biệt Cho Học Sinh - Sinh Viên: Mua Combo 5 Donut Tặng Ngay 1', en: 'Special Student Deal: Buy 5 Donuts, Get 1 FREE' },

        // Article Excerpts
        { vi: 'Làm thế nào để chiếc bánh Donut giữ trọn độ mềm xốp, thơm lừng lớp sốt chocolate Bỉ khi mang về nhà? Cùng khám phá mẹo cực hay này nhé!', en: 'How to keep your donuts fluffy, soft, and richly coated with Belgian chocolate when taking them home? Let\'s discover these baker tips!' },
        { vi: 'Làm thế nào để chiếc bánh Donut giữ trọn độ mềm xốp, thơm lừng lớp sốt chocolate Bỉ khi mang về nhà?', en: 'How to keep your donuts fluffy, soft, and richly coated with Belgian chocolate when taking them home?' },
        { vi: 'Câu chuyện đằng sau chiếc Tart trứng thơm lừng béo ngậy với hơn 64 lớp bột mỏng tang giòn rụm được tạo ra như thế nào.', en: 'The story behind our golden, melt-in-your-mouth egg tart with over 64 whisper-thin crispy pastry layers.' },
        { vi: 'Câu chuyện đằng sau chiếc Tart trứng thơm lừng béo ngậy với hơn 64 lớp bột mỏng tang giòn rụm.', en: 'The story behind our golden, melt-in-your-mouth egg tart with over 64 whisper-thin crispy pastry layers.' },
        { vi: 'Bánh lạnh hũ tiện lợi mang đi làm, đi học nhưng bảo quản thế nào để kem phô mai và sốt trái cây luôn thơm ngon nhất?', en: 'How to store chilled dessert jars in the fridge at 2-5°C so the cream cheese and berry coulis stay perfectly fresh.' },
        { vi: 'Chỉ 50.000đ sở hữu ngay hộp quà 6 chiếc Donut ngọt ngào bọc trong bao bì mèo Kitten Cake xinh xắn. Khám phá ngay!', en: 'Just 50,000 VND (~$2.00) for a charming 6-donut box packaged in our cute Kitten Cake cat gift box. Explore now!' },
        { vi: 'Chỉ 50.000đ sở hữu ngay hộp quà 6 chiếc Donut ngọt ngào bọc trong bao bì mèo Kitten Cake xinh xắn.', en: 'Just 50,000 VND (~$2.00) for a charming 6-donut box packaged in our cute Kitten Cake cat gift box.' },

        // Authors
        { vi: 'Bếp Trưởng Kitten Cake', en: 'Head Baker @ Kitten Cake' },
        { vi: 'Kitten Baker', en: 'Kitten Baker' },
        { vi: 'Kitten Cake Team', en: 'Kitten Cake Team' },
        { vi: 'Kitten Cake Marketing', en: 'Kitten Cake Marketing' },

        // Product Descriptions
        { vi: 'Món bánh chủ đạo nướng tươi mỗi ngày, ruột mềm xốp phủ socola Bỉ, cốm cầu vồng, dâu tây hoặc matcha ngọt dịu.', en: 'Our signature treat baked fresh daily, ultra-soft and fluffy interior glazed with Belgian chocolate, rainbow sprinkles, fresh strawberry, or mellow matcha.' },
        { vi: 'Lớp vỏ ngàn lớp giòn tan rụm kết hợp cùng nhân kem trứng sữa nướng xém mặt thơm lừng béo ngậy chuẩn vị Hồng Kông.', en: 'Crispy 64-layer flaky crust filled with silky, caramelized egg custard baked to golden perfection.' },
        { vi: 'Sự kết hợp hoàn hảo giữa cream cheese béo ngậy chua dịu và vụn bánh quy Oreo giòn rụm, đóng hũ sạch sẽ tiện lợi.', en: 'Velvety smooth New Zealand cream cheese layered over crunchy Oreo cookie crumbles in a reusable glass jar.' },
        { vi: 'Món tráng miệng thanh mát từ nước Ý, pudding sữa mềm mịn tan ngay trên đầu lưỡi cùng sốt mứt trái cây chua ngọt.', en: 'Silky Italian milk pudding that gently melts on your tongue, paired with house-made tangy berry fruit coulis.' },
        { vi: 'Hộp quà tặng mèo Kitten Cake siêu cưng gồm 6 chiếc Donut đủ vị (Choco, Vani, Dâu tây, Matcha, Hạnh nhân). Tặng kèm thiệp nhỏ!', en: 'Adorable Kitten Cake cat-themed gift box containing 6 assorted donuts (Choco, Vanilla, Strawberry, Matcha, Almond). Complimentary message card included!' },
        { vi: 'Set 4 chiếc Tart trứng nướng nóng hổi đóng hộp sang trọng, giòn tan ngàn lớp cho bữa xế văn phòng ấm áp.', en: 'A warm, elegant box of 4 freshly baked 64-layer flaky egg tarts, ideal for cozy office tea breaks and family snacks.' },

        // Tags & Badges
        { vi: '🍩 Món Signature', en: '🍩 Signature' },
        { vi: '🥧 Bánh Nướng Nóng', en: '🥧 Freshly Baked' },
        { vi: '🍰 Bánh Lạnh Hũ', en: '🍰 Chilled Cup' },
        { vi: '🍮 Tráng Miệng Ý', en: '🍮 Italian Dessert' },
        { vi: '🎁 Combo Tiết Kiệm', en: '🎁 Best Value Combo' },
        { vi: 'Best Seller • Món Chính', en: 'Best Seller • Signature' },
        { vi: 'Best Seller', en: 'Best Seller' },
        { vi: 'Món Chính', en: 'Main Item' },
        { vi: 'Vỏ Ngàn Lớp', en: '64-Layer Crust' },
        { vi: 'Yêu Thích', en: 'Customer Favorite' },
        { vi: 'Thanh Mát', en: 'Light & Refreshing' },
        { vi: 'Mua 5 Tặng 1', en: 'Buy 5 Get 1 Free' },
        { vi: 'Tiết Kiệm', en: 'Value Pack' },

        // UI Buttons & Labels
        { vi: 'Chi tiết', en: 'Details' },
        { vi: 'Thêm giỏ', en: 'Add to Cart' },
        { vi: 'Thêm vào giỏ', en: 'Add to Cart' },
        { vi: 'Thêm vào giỏ hàng', en: 'Add to Cart' },
        { vi: 'Xem chi tiết', en: 'View Details' },
        { vi: 'Xem chi tiết bánh', en: 'View Cake Details' },
        { vi: 'Mua ngay', en: 'Buy Now' },
        { vi: 'Còn bánh', en: 'In Stock' },
        { vi: 'Tạm hết', en: 'Sold Out' },
        { vi: 'Đồng giá 10K', en: 'Flat 10K (~$0.40)' },
        { vi: 'Bánh nướng nóng', en: 'Freshly Baked' },
        { vi: 'Bánh hũ lạnh', en: 'Chilled Cup' },
        { vi: 'Tất cả bánh', en: 'All Cakes' },
        { vi: 'Tất cả món bánh', en: 'All Cakes' },
        { vi: 'Tất Cả Món Bánh', en: 'All Cakes' },
        { vi: 'Tất cả bài viết', en: 'All Articles' },
        { vi: 'Tất cả', en: 'All' },
        { vi: 'Mọi mức giá', en: 'All Prices' },
        { vi: 'Dưới 20.000đ', en: 'Under 20K (<$0.80)' },
        { vi: '20.000đ - 50.000đ', en: '20K - 50K ($0.80 - $2)' },
        { vi: 'Trên 50.000đ', en: 'Above 50K (>$2.00)' },
        { vi: 'Sắp xếp: Mặc định', en: 'Sort: Default' },
        { vi: 'Giá: Thấp đến cao', en: 'Price: Low to High' },
        { vi: 'Giá: Cao đến thấp', en: 'Price: High to Low' },
        { vi: 'Đánh giá cao nhất', en: 'Highest Rated' },
        { vi: 'Tên: A đến Z', en: 'Name: A to Z' },
        { vi: 'Đang tải bánh ngon...', en: 'Loading delicious cakes...' },
        { vi: 'Đọc chi tiết', en: 'Read More' },
        { vi: 'Đọc tiếp bài viết', en: 'Read Article' },
        { vi: 'Tra Cứu Ngay', en: 'Track Now' },
        { vi: 'Xem tất cả món bánh', en: 'View All Cakes' },
        { vi: 'Chọn thêm bánh', en: 'Add More Cakes' },
        { vi: 'Xóa sạch giỏ', en: 'Clear Cart' },
        { vi: 'Áp dụng', en: 'Apply' },
        { vi: 'Sao chép', en: 'Copy' },
        { vi: 'Gửi Đơn Đặt Bánh Ngay', en: 'Place Order Now' },
        { vi: 'Mở PayPal Thanh Toán Ngay', en: 'Open PayPal & Pay' },
        { vi: 'Sao chép link PayPal', en: 'Copy PayPal Link' },

        // Stock & Pre-order Statuses
        { vi: 'Nhận đặt trước (Pre-order)', en: 'Pre-order Available' },
        { vi: 'Đặt trước (Pre-order)', en: 'Pre-order' },
        { vi: 'Đặt trước bánh', en: 'Pre-order Cake' },
        { vi: 'Đặt trước ngay', en: 'Pre-order Now' },
        { vi: 'Đặt trước', en: 'Pre-order' },
        { vi: 'Đang bán sẵn', en: 'In Stock' },
        { vi: 'Còn bánh', en: 'In Stock' },
        { vi: 'Tạm hết bánh', en: 'Out of Stock' },
        { vi: 'Hết bánh hôm nay', en: 'Sold Out Today' },
        { vi: 'Hết hàng hôm nay', en: 'Sold Out Today' },

        // Flavors & Toppings
        { vi: 'Chocolate Trắng', en: 'White Chocolate' },
        { vi: 'Matcha', en: 'Matcha Green Tea' },
        { vi: 'Dâu', en: 'Sweet Strawberry' },
        { vi: 'Chocolate', en: 'Belgian Chocolate' },
        { vi: 'Vị Choco', en: 'Belgian Choco' },
        { vi: 'Vị Vani', en: 'Vanilla Glaze' },
        { vi: 'Vị Matcha', en: 'Kyoto Matcha' },
        { vi: 'Vị Dâu', en: 'Sweet Strawberry' },
        { vi: 'Tart Trứng Truyền Thống', en: 'Traditional Egg Custard' },
        { vi: 'Oreo Vụn Giòn', en: 'Crunchy Oreo' },
        { vi: 'Sốt Dâu Tây Tươi', en: 'Fresh Strawberry Coulis' },
        { vi: 'Sốt Chanh Dây Chua Ngọt', en: 'Tangy Passion Fruit' },
        { vi: 'Sốt Kiwi Xanh', en: 'Zesty Kiwi' },
        { vi: 'Set Mix 6 Vị Đầy Đủ', en: 'Assorted 6 Flavors' },
        { vi: 'Hộp 4 Chiếc Tiêu Chuẩn', en: 'Standard 4-Pack' },
        { vi: 'Vị Tiêu Chuẩn', en: 'Signature Standard' },
        { vi: 'Vị Chuẩn Signature', en: 'Signature Standard' },
        { vi: 'Chọn vị bánh:', en: 'Select Flavor:' },
        { vi: 'Thêm Topping thơm giòn:', en: 'Add Crunchy Toppings:' },
        { vi: '+3.000đ / loại', en: '+3,000 VND (~$0.12) each' },
        { vi: '+3.000đ', en: '+3,000 VND (~$0.12)' },
        { vi: '+3k', en: '+$0.12' },
        { vi: 'Đã chọn:', en: 'Selected:' },
        { vi: 'Số lượng:', en: 'Quantity:' },
        { vi: 'Tạm tính:', en: 'Subtotal:' },
        { vi: 'Vụn Bánh Oreo', en: 'Oreo Cookie Crumbs' },
        { vi: 'Vụn Oreo', en: 'Oreo Crumbs' },
        { vi: 'Hạt Điều', en: 'Toasted Cashew Nuts' },
        { vi: 'Hạt điều', en: 'Cashew Nuts' },
        { vi: 'Hạnh Nhân Nướng', en: 'Roasted Sliced Almonds' },
        { vi: 'Hạnh nhân', en: 'Roasted Almonds' },
        { vi: 'Marshmallow', en: 'Fluffy Marshmallows' },
        { vi: 'Vụn chocolate', en: 'Chocolate Chips' },
        { vi: 'Dâu tây sấy vụn', en: 'Dried Strawberries' },
        { vi: 'Cốm Cầu Vồng', en: 'Rainbow Sprinkles' },
        { vi: 'Hạt cốm', en: 'Rainbow Sprinkles' },
        { vi: 'Sốt Caramel', en: 'Caramel Drizzle' },
        { vi: 'Sốt Phô Mai', en: 'Cheese Drizzle' },

        // Gallery overlays
        { vi: 'Khay Donut tình yêu đủ vị', en: 'Assorted Heartfelt Donut Tray' },
        { vi: 'Hộp quà tặng Donut 12 vị', en: '12-Flavor Deluxe Donut Gift Box' },
        { vi: 'Hộp quà tặng Donut 6 vị xinh xắn', en: 'Charming 6-Flavor Donut Box' },
        { vi: 'Tart trứng ngàn lớp nóng giòn', en: 'Crispy Multi-Layer Hot Egg Tart' },
        { vi: 'Oreo Cheesecake hũ tiện lợi', en: 'Convenient Oreo Cheesecake Cup' },
        { vi: 'Panna Cotta trái cây tươi mát', en: 'Refreshing Berry Panna Cotta' },

        // Bank info
        { vi: 'VPBank (Ngân hàng TMCP Việt Nam Thịnh Vượng)', en: 'VPBank (Vietnam Prosperity Joint Stock Commercial Bank)' },
        { vi: 'Ngân hàng:', en: 'Bank:' },
        { vi: 'Số TK:', en: 'Account No:' },
        { vi: 'Số tài khoản:', en: 'Account Number:' },
        { vi: 'Chủ TK:', en: 'Beneficiary:' },
        { vi: 'Chủ tài khoản:', en: 'Account Name:' },
        { vi: 'Vui lòng quét mã trên app ngân hàng để chuyển khoản chính xác nhất.', en: 'Please scan via your banking app for the most accurate transaction.' },

        // Tracking & Order statuses
        { vi: 'Chờ xác nhận', en: 'Pending' },
        { vi: 'Đang làm bánh', en: 'Baking' },
        { vi: 'Đang nướng bánh', en: 'Baking' },
        { vi: 'Đang giao hàng', en: 'Shipping' },
        { vi: 'Giao thành công', en: 'Delivered' },
        { vi: 'Đã Tiếp Nhận Đơn', en: 'Order Received' },
        { vi: 'Bánh Đang Nướng Trong Lò', en: 'Baking in Oven' },
        { vi: 'Shipper Đang Giao Tới Bạn', en: 'Out for Delivery' },
        { vi: 'Đã Giao Bánh Thành Công', en: 'Delivered Successfully' },
        { vi: 'Đã Hủy Đơn Hàng', en: 'Order Cancelled' },
        { vi: 'Tiếp nhận đơn', en: 'Order Received' },
        { vi: 'Đang nướng sẵn tại tiệm', en: 'Freshly baked in store' },
        { vi: 'Đã hết hàng hôm nay', en: 'Sold out today' },
        { vi: 'Tạm hết bánh', en: 'Out of Stock' },
        { vi: 'Mới đặt gần đây', en: 'Recently placed' },
        { vi: 'Không có ghi chú', en: 'No special notes' },
        { vi: 'Tiền mặt khi nhận bánh', en: 'Cash on Delivery (COD)' },
        { vi: 'VietQR Chuyển khoản', en: 'VietQR Bank Transfer' },
        { vi: 'Quét Mã VietQR Để Thanh Toán Nhanh', en: 'Scan VietQR to Pay Quickly' },
        { vi: 'Nội dung chuyển khoản chuẩn:', en: 'Transfer Memo:' },
        { vi: 'Số tiền:', en: 'Amount:' },
        { vi: 'Chi Tiết Món Bánh Đã Đặt', en: 'Ordered Cake Details' },
        { vi: 'Thông Tin Khách Hàng', en: 'Customer Details' },
        { vi: 'Địa Chỉ Giao Bánh', en: 'Delivery Address' },
        { vi: 'Họ tên:', en: 'Full Name:' },
        { vi: 'Số điện thoại:', en: 'Phone Number:' },
        { vi: 'Ghi chú:', en: 'Notes:' },
        { vi: 'Sản phẩm', en: 'Product' },
        { vi: 'Số lượng', en: 'Quantity' },
        { vi: 'Thành tiền', en: 'Total' },
        { vi: 'Tiền bánh:', en: 'Subtotal:' },
        { vi: 'Phí giao hàng:', en: 'Shipping Fee:' },
        { vi: 'Giảm giá voucher:', en: 'Voucher Discount:' },
        { vi: 'Quà tặng combo:', en: 'Combo Gift:' },
        { vi: 'Tổng thanh toán:', en: 'Total Payment:' },
        { vi: 'Cần thay đổi giờ giao hoặc thêm ghi chú?', en: 'Need to change delivery time or add instructions?' },
        { vi: 'phút đọc', en: 'min read' },
        { vi: 'lượt xem', en: 'views' },
        { vi: 'Thứ 2 - Thứ 6: 08:00 - 22:00', en: 'Mon - Fri: 08:00 AM - 10:00 PM' },
        { vi: 'Thứ 7 - CN: 07:30 - 22:30', en: 'Sat - Sun: 07:30 AM - 10:30 PM' },
        { vi: 'Quận 7, TP. Hồ Chí Minh', en: 'District 7, Ho Chi Minh City, Vietnam' },
        { vi: 'Giờ Mở Cửa', en: 'Opening Hours' },
        { vi: 'Giờ mở cửa', en: 'Opening Hours' },
        { vi: 'Liên hệ đặt bánh', en: 'Order & Contact' }
    ];

    const KittenI18n = {
        productsI18n,
        categoriesI18n,
        blogCategoriesI18n,
        articlesI18n,

        // Lấy ngôn ngữ hiện tại
        getLang() {
            try {
                return localStorage.getItem(LANG_STORAGE_KEY) || 'vi';
            } catch (e) {
                return 'vi';
            }
        },

        // Chuyển đổi ngôn ngữ
        setLang(lang) {
            if (lang !== 'vi' && lang !== 'en') lang = 'vi';
            try {
                localStorage.setItem(LANG_STORAGE_KEY, lang);
            } catch (e) {
                console.error(e);
            }
            document.documentElement.lang = lang;
            this.updateSwitcherButtons(lang);
            this.applyTranslations();

            // Phát event cho các module khác lắng nghe và cập nhật lại dữ liệu
            window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
        },

        // Lấy chuỗi dịch theo key
        t(key, fallback = '') {
            const lang = this.getLang();
            const dict = translations[lang] || translations.vi;
            return (dict && dict[key]) || (translations.vi && translations.vi[key]) || fallback;
        },

        // Quy đổi sang USD (1 USD = 25.000 VNĐ)
        toUSD(amountVnd) {
            const num = Number(amountVnd) || 0;
            return (num / USD_RATE).toFixed(2);
        },

        // Format tiền tệ thông minh song ngữ
        formatMoney(amountVnd) {
            const num = Number(amountVnd) || 0;
            const lang = this.getLang();
            const vnStr = num.toLocaleString('vi-VN') + 'đ';
            if (lang === 'en') {
                const usdStr = this.toUSD(num);
                return `${vnStr} (~$${usdStr} USD)`;
            }
            return vnStr;
        },

        // Format số tiền USD đơn thuần
        formatUSD(amountVnd) {
            return '$' + this.toUSD(amountVnd) + ' USD';
        },

        // Dịch sản phẩm chuẩn xác theo ID
        getTranslatedProduct(prod) {
            if (!prod) return prod;
            if (this.getLang() !== 'en') return prod;

            const trans = productsI18n[prod.id];
            if (!trans) {
                return {
                    ...prod,
                    name: this.getTranslatedProductName(prod.name),
                    tag: this.getTranslatedTag(prod.tag),
                    badge: this.getTranslatedBadge(prod.badge)
                };
            }

            return {
                ...prod,
                name: trans.name,
                tag: trans.tag,
                badge: trans.badge,
                description: trans.description,
                unitSubtext: trans.unitSubtext,
                details: trans.details || prod.details,
                flavors: (prod.flavors || []).map((f, i) => {
                    if (typeof f === 'string') {
                        return this.getTranslatedFlavor(f);
                    }
                    const transF = trans.flavors && trans.flavors[i];
                    return {
                        ...f,
                        name: (transF && transF.name) ? transF.name : this.getTranslatedFlavor(f.name)
                    };
                })
            };
        },

        // Dịch tên sản phẩm tự động
        getTranslatedProductName(name) {
            if (!name) return name;
            if (this.getLang() !== 'en') return name;

            if (name.includes('Donut Xốp Mềm') || (name.includes('Donut') && name.includes('Signature'))) return 'Signature Fluffy Donut';
            if (name.includes('Tart Trứng Béo Ngậy') || (name.includes('Tart') && name.includes('Trứng') && !name.includes('Hộp 4'))) return 'Crispy 64-Layer Egg Tart';
            if (name.includes('Oreo Cheesecake')) return 'Oreo Cheesecake Glass Cup';
            if (name.includes('Panna Cotta')) return 'Refreshing Fruit Panna Cotta';
            if (name.includes('Hộp 6 Donut') || name.includes('Combo 5')) return 'Deluxe 6-Donut Cat Gift Box';
            if (name.includes('Hộp 4 Tart Trứng')) return 'Crispy 4-Pack Egg Tart Box';

            for (const item of autoPhrases) {
                if (name === item.vi) return item.en;
            }
            return name;
        },

        // Dịch vị bánh
        getTranslatedFlavor(flavor) {
            if (!flavor) return flavor;
            if (this.getLang() !== 'en') return flavor;

            if (flavor.includes('Choco')) return 'Belgian Choco';
            if (flavor.includes('Vani') || flavor.includes('Trắng') || flavor.includes('White')) return 'Vanilla Glaze';
            if (flavor.includes('Matcha')) return 'Kyoto Matcha';
            if (flavor.includes('Dâu')) return 'Sweet Strawberry';
            if (flavor.includes('Truyền Thống')) return 'Traditional Custard';
            if (flavor.includes('Oreo')) return 'Crunchy Oreo';
            if (flavor.includes('Chanh Dây')) return 'Tangy Passion Fruit';
            if (flavor.includes('Kiwi')) return 'Zesty Kiwi';
            if (flavor.includes('Mix 6')) return 'Assorted 6 Flavors';
            if (flavor.includes('4 Chiếc') || flavor.includes('4 Pack')) return 'Standard 4-Pack';
            if (flavor.includes('Tiêu Chuẩn') || flavor.includes('Signature')) return 'Signature Standard';

            for (const item of autoPhrases) {
                if (flavor === item.vi) return item.en;
            }
            return flavor;
        },

        // Dịch topping
        getTranslatedTopping(topping) {
            if (!topping) return topping;
            if (this.getLang() !== 'en') return topping;

            if (topping.includes('Oreo')) return 'Oreo Cookie Crumbs';
            if (topping.includes('điều') || topping.includes('Hạt Điều') || topping.includes('Cashew')) return 'Toasted Cashew Nuts';
            if (topping.includes('Hạnh nhân') || topping.includes('Hạnh Nhân') || topping.includes('Almond')) return 'Roasted Almonds';
            if (topping.includes('Marshmallow')) return 'Fluffy Marshmallows';
            if (topping.includes('Socola') || topping.includes('chocolate')) return 'Chocolate Chips';
            if (topping.includes('Dâu') || topping.includes('dâu')) return 'Dried Strawberry';
            if (topping.includes('cốm') || topping.includes('Cốm')) return 'Rainbow Sprinkles';
            if (topping.includes('Caramel')) return 'Caramel Drizzle';
            if (topping.includes('Phô Mai')) return 'Cheese Drizzle';

            return topping;
        },

        // Dịch tag bánh
        getTranslatedTag(tag) {
            if (!tag) return tag;
            if (this.getLang() !== 'en') return tag;
            if (tag.includes('Signature')) return '🍩 Signature Item';
            if (tag.includes('Bánh Nướng')) return '🥧 Freshly Baked';
            if (tag.includes('Bánh Lạnh') || tag.includes('Hũ')) return '🍰 Chilled Cup';
            if (tag.includes('Ý') || tag.includes('Panna')) return '🍮 Italian Dessert';
            if (tag.includes('Combo')) return '🎁 Best Value Combo';
            return tag;
        },

        // Dịch badge bánh
        getTranslatedBadge(badge) {
            if (!badge) return badge;
            if (this.getLang() !== 'en') return badge;
            if (badge.includes('Best Seller')) return 'Best Seller • Signature';
            if (badge.includes('Vỏ Ngàn Lớp')) return '64-Layer Crust';
            if (badge.includes('Yêu Thích')) return 'Customer Favorite';
            if (badge.includes('Thanh Mát')) return 'Light & Refreshing';
            if (badge.includes('Mua 5 Tặng 1')) return 'Buy 5 Get 1 Free';
            if (badge.includes('Tiết Kiệm')) return 'Value Pack';
            if (badge.includes('Thơm Giòn')) return 'Crispy Pastry';
            if (badge.includes('Hot')) return 'Hot';
            return badge;
        },

        // Dịch danh mục bánh
        getTranslatedCategory(cat) {
            if (!cat) return cat;
            if (this.getLang() !== 'en') return cat;
            const trans = categoriesI18n[cat.id];
            if (trans) {
                return {
                    ...cat,
                    name: trans.name,
                    badge: trans.badge,
                    description: trans.description
                };
            }
            return cat;
        },

        // Dịch danh mục blog
        getTranslatedBlogCategory(cat) {
            if (!cat) return cat;
            if (this.getLang() !== 'en') return cat;
            const trans = blogCategoriesI18n[cat.id];
            if (trans) {
                return { ...cat, name: trans.name };
            }
            if (cat.name) {
                for (const item of autoPhrases) {
                    if (cat.name === item.vi) return { ...cat, name: item.en };
                }
            }
            return cat;
        },

        // Dịch bài viết blog
        getTranslatedArticle(art) {
            if (!art) return art;
            if (this.getLang() !== 'en') return art;
            const trans = articlesI18n[art.id];
            if (trans) {
                return {
                    ...art,
                    title: trans.title,
                    categoryName: trans.categoryName,
                    author: trans.author,
                    readTime: trans.readTime,
                    excerpt: trans.excerpt,
                    content: trans.content,
                    tags: trans.tags
                };
            }
            return art;
        },

        // Tự động quét và dịch các chuỗi văn bản động trong phần tử
        scanAndTranslateDynamic(root = document.body) {
            if (!root) return;
            const lang = this.getLang();
            if (lang !== 'en') return;

            // 1. Quét các nút bấm, span, badge, p, h1, h2, h3, h4, option, label
            const targets = root.querySelectorAll('button, a, span, p, h1, h2, h3, h4, option, label, .item-tag, .hot-badge, .menu-price-subtext, .gallery-overlay');
            targets.forEach(el => {
                if (el.children.length > 0) {
                    el.childNodes.forEach(node => {
                        if (node.nodeType === Node.TEXT_NODE) {
                            const trimmed = node.nodeValue.trim();
                            if (trimmed) {
                                for (const item of autoPhrases) {
                                    if (trimmed === item.vi) {
                                        node.nodeValue = node.nodeValue.replace(item.vi, item.en);
                                        break;
                                    }
                                }
                                if (trimmed.startsWith('Hiển thị ') && trimmed.includes(' món bánh')) {
                                    node.nodeValue = trimmed.replace('Hiển thị ', 'Showing ').replace(' món bánh', ' delicious cakes');
                                }
                            }
                        }
                    });
                } else {
                    const text = el.textContent.trim();
                    if (text) {
                        for (const item of autoPhrases) {
                            if (text === item.vi) {
                                el.textContent = item.en;
                                break;
                            }
                        }
                        if (text.startsWith('Hiển thị ') && text.includes(' món bánh')) {
                            el.textContent = text.replace('Hiển thị ', 'Showing ').replace(' món bánh', ' delicious cakes');
                        }
                    }
                }
            });

            // 2. Chuyển đổi giá tiền sang kèm USD nếu chưa có
            root.querySelectorAll('.menu-price, .order-item-price, #quickModalPrice, .mini-cart-item-price').forEach(priceEl => {
                const raw = priceEl.textContent.trim();
                if (raw && raw.includes('đ') && !raw.includes('USD') && !raw.includes('$')) {
                    const cleanNum = parseInt(raw.replace(/[^0-9]/g, ''), 10);
                    if (!isNaN(cleanNum) && cleanNum > 0) {
                        priceEl.textContent = `${cleanNum.toLocaleString('vi-VN')}đ (~$${this.toUSD(cleanNum)} USD)`;
                    }
                }
            });
        },

        // Áp dụng dịch vào toàn bộ DOM
        applyTranslations() {
            const lang = this.getLang();
            const dict = translations[lang] || translations.vi;

            // 1. Text elements qua data-i18n
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                if (dict[key]) {
                    el.innerHTML = dict[key];
                }
            });

            // 2. Placeholders qua data-i18n-ph
            document.querySelectorAll('[data-i18n-ph]').forEach(el => {
                const key = el.getAttribute('data-i18n-ph');
                if (dict[key]) {
                    el.setAttribute('placeholder', dict[key]);
                }
            });

            // 3. Titles qua data-i18n-title
            document.querySelectorAll('[data-i18n-title]').forEach(el => {
                const key = el.getAttribute('data-i18n-title');
                if (dict[key]) {
                    el.setAttribute('title', dict[key]);
                }
            });

            // 4. Alt texts qua data-i18n-alt
            document.querySelectorAll('[data-i18n-alt]').forEach(el => {
                const key = el.getAttribute('data-i18n-alt');
                if (dict[key]) {
                    el.setAttribute('alt', dict[key]);
                }
            });

            // 5. Nếu là tiếng Anh, kích hoạt quét tự động dịch các chuỗi động chưa có data-i18n
            if (lang === 'en') {
                this.scanAndTranslateDynamic(document.body);
            }
        },

        // Cập nhật trạng thái active của nút chọn ngôn ngữ
        updateSwitcherButtons(lang) {
            document.querySelectorAll('.btn-lang-toggle').forEach(btn => {
                const btnLang = btn.getAttribute('data-lang');
                if (btnLang === lang) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        },

        // Tự động chèn thanh chuyển đổi ngôn ngữ vào header nếu chưa có
        initSwitcherUI() {
            const currentLang = this.getLang();
            document.documentElement.lang = currentLang;

            // Tìm các container có sẵn hoặc header-right-actions / header-btn
            let targets = document.querySelectorAll('.lang-switcher-wrap');
            if (targets.length === 0) {
                const headerActions = document.querySelector('.header-right-actions') || document.querySelector('.header-btn');
                if (headerActions) {
                    const wrap = document.createElement('div');
                    wrap.className = 'lang-switcher-wrap';
                    headerActions.insertBefore(wrap, headerActions.firstChild);
                    targets = [wrap];
                }
            }

            targets.forEach(container => {
                container.innerHTML = `
                    <div class="lang-switcher" title="Chọn ngôn ngữ / Select Language">
                        <button type="button" class="btn-lang-toggle ${currentLang === 'vi' ? 'active' : ''}" data-lang="vi" aria-label="Tiếng Việt">
                            <span class="flag-icon">🇻🇳</span> <span class="lang-text">VI</span>
                        </button>
                        <button type="button" class="btn-lang-toggle ${currentLang === 'en' ? 'active' : ''}" data-lang="en" aria-label="English">
                            <span class="flag-icon">🇬🇧</span> <span class="lang-text">EN</span>
                        </button>
                    </div>
                `;
            });

            // Gắn sự kiện click đổi ngôn ngữ & mở mobile menu
            document.addEventListener('click', (e) => {
                const btn = e.target.closest('.btn-lang-toggle');
                if (btn) {
                    const chosenLang = btn.getAttribute('data-lang');
                    if (chosenLang) {
                        this.setLang(chosenLang);
                    }
                    return;
                }

                const mobBtn = e.target.closest('.mobile-menu-btn');
                const navList = document.querySelector('.nav-list');
                if (mobBtn && navList) {
                    navList.classList.toggle('active');
                    const icon = mobBtn.querySelector('i');
                    if (icon) {
                        if (navList.classList.contains('active')) {
                            icon.classList.remove('fa-bars');
                            icon.classList.add('fa-times');
                        } else {
                            icon.classList.remove('fa-times');
                            icon.classList.add('fa-bars');
                        }
                    }
                    return;
                }

                // Tự động đóng menu mobile khi chọn 1 link
                if (e.target.closest('.nav-list a')) {
                    const navList = document.querySelector('.nav-list');
                    if (navList && navList.classList.contains('active')) {
                        navList.classList.remove('active');
                        const icon = document.querySelector('.mobile-menu-btn i');
                        if (icon) {
                            icon.classList.remove('fa-times');
                            icon.classList.add('fa-bars');
                        }
                    }
                }
            });

            // Khởi tạo MutationObserver để tự động dịch khi có dữ liệu mới render từ API
            this.setupAutoObserver();

            // Áp dụng dịch ngay khi khởi tạo
            this.applyTranslations();
        },

        // Tự động quan sát các container động
        setupAutoObserver() {
            if (typeof MutationObserver === 'undefined') return;

            const observer = new MutationObserver((mutations) => {
                if (this.getLang() === 'en') {
                    mutations.forEach(m => {
                        m.addedNodes.forEach(node => {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                this.scanAndTranslateDynamic(node);
                            }
                        });
                    });
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    };

    window.KittenI18n = KittenI18n;

    // Tự động khởi chạy khi DOM sẵn sàng
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => KittenI18n.initSwitcherUI());
    } else {
        KittenI18n.initSwitcherUI();
    }

})(window);
