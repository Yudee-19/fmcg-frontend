import type { LegalContent, LocalizedLegalContent } from "./types";

const en: LegalContent = {
    title: "Terms and Conditions",
    subtitle: "Crown Worldwide Group Co for Wholesale and Retail Trade",
    tagline: "Grocery E-commerce & Retail – Kuwait",
    sections: [
        {
            number: "1",
            title: "Introduction",
            blocks: [
                {
                    type: "paragraph",
                    text: 'Welcome to the website of Crown Worldwide Group Co for Wholesale and Retail Trade ("Company", "we", "our", "us").',
                },
                {
                    type: "paragraph",
                    text: "These Terms and Conditions govern your access to and use of our website, services, and all purchases related to grocery items offered through our platform.",
                },
                {
                    type: "paragraph",
                    text: "By using our website or placing an order, you agree to be legally bound by these Terms.",
                },
            ],
        },
        {
            number: "2",
            title: "Scope of Services",
            blocks: [
                { type: "paragraph", text: "We provide:" },
                {
                    type: "list",
                    items: [
                        "Online grocery shopping",
                        "Retail and wholesale grocery sales",
                        "Home delivery services across Kuwait",
                        "Store pickup services",
                    ],
                },
                {
                    type: "paragraph",
                    text: "All products sold are strictly grocery and food-related items, including but not limited to:",
                },
                {
                    type: "list",
                    items: [
                        "Fresh produce (fruits & vegetables)",
                        "Dairy and chilled products",
                        "Frozen foods",
                        "Packaged grocery items",
                        "Beverages",
                    ],
                },
            ],
        },
        {
            number: "3",
            title: "Eligibility",
            blocks: [
                { type: "paragraph", text: "To use our services:" },
                {
                    type: "list",
                    items: [
                        "You must be at least 18 years old",
                        "You must provide accurate and complete personal information",
                        "You must be legally capable of entering into binding contracts under Kuwaiti law",
                    ],
                },
            ],
        },
        {
            number: "4",
            title: "Account Registration & Security",
            blocks: [
                {
                    type: "list",
                    items: [
                        "You are responsible for maintaining confidentiality of your account credentials",
                        "You agree to accept responsibility for all activities under your account",
                        "We reserve the right to suspend accounts in case of suspicious or fraudulent activity",
                    ],
                },
            ],
        },
        {
            number: "5",
            title: "Orders & Acceptance",
            blocks: [
                {
                    type: "list",
                    items: [
                        "All orders placed are considered offers to purchase",
                        "Orders are only confirmed once we approve and process them",
                        "We reserve the right to cancel orders, limit quantities, or refuse service",
                    ],
                },
            ],
        },
        {
            number: "6",
            title: "Pricing & Payments",
            subsections: [
                {
                    number: "6.1",
                    title: "Pricing",
                    blocks: [
                        {
                            type: "list",
                            items: [
                                "All prices are listed in Kuwaiti Dinar (KWD)",
                                "Prices may change without prior notice",
                                "Final price is confirmed at checkout",
                            ],
                        },
                    ],
                },
                {
                    number: "6.2",
                    title: "Payment Methods",
                    blocks: [
                        { type: "paragraph", text: "We accept:" },
                        {
                            type: "list",
                            items: [
                                "Cash on Delivery (COD)",
                                "Online payments (cards, payment gateways)",
                            ],
                        },
                    ],
                },
                {
                    number: "6.3",
                    title: "Payment Terms",
                    blocks: [
                        {
                            type: "list",
                            items: [
                                "Payment must be completed before dispatch (for online orders)",
                                "COD payments must be made at the time of delivery",
                            ],
                        },
                    ],
                },
            ],
        },
        {
            number: "7",
            title: "Delivery Policy",
            subsections: [
                {
                    number: "7.1",
                    title: "Delivery Service",
                    blocks: [
                        {
                            type: "list",
                            items: [
                                "Available across selected areas in Kuwait",
                                "Delivery timelines are estimates only",
                            ],
                        },
                    ],
                },
                {
                    number: "7.2",
                    title: "Delivery Conditions",
                    blocks: [
                        { type: "paragraph", text: "You must:" },
                        {
                            type: "list",
                            items: [
                                "Provide accurate delivery address",
                                "Ensure someone is available to receive the order",
                                "Provide valid contact details",
                            ],
                        },
                    ],
                },
                {
                    number: "7.3",
                    title: "Failed Delivery",
                    blocks: [
                        { type: "paragraph", text: "We may cancel orders if:" },
                        {
                            type: "list",
                            items: [
                                "Address is incorrect",
                                "Customer is unreachable",
                                "Delivery is repeatedly unsuccessful",
                            ],
                        },
                    ],
                },
            ],
        },
        {
            number: "8",
            title: "Store Pickup",
            blocks: [
                {
                    type: "list",
                    items: [
                        "Customers may choose store pickup option",
                        "Orders must be collected within the specified time",
                        "Valid ID or order confirmation may be required",
                    ],
                },
            ],
        },
        {
            number: "9",
            title: "Product Availability",
            blocks: [
                {
                    type: "paragraph",
                    text: "All products are subject to stock availability. We reserve the right to:",
                },
                {
                    type: "list",
                    items: [
                        "Substitute similar items",
                        "Cancel unavailable items",
                        "Issue refunds for out-of-stock products",
                    ],
                },
            ],
        },
        {
            number: "10",
            title: "Grocery-Specific Return & Refund Policy",
            subsections: [
                {
                    number: "10.1",
                    title: "Non-Returnable Items",
                    blocks: [
                        {
                            type: "paragraph",
                            text: "Due to hygiene and safety regulations in Kuwait:",
                        },
                        {
                            type: "list",
                            items: [
                                "Perishable items (fresh, dairy, meat, frozen)",
                                "Opened or consumed items",
                            ],
                        },
                        {
                            type: "callout",
                            text: "Cannot be returned unless defective at delivery.",
                        },
                    ],
                },
                {
                    number: "10.2",
                    title: "Eligible Returns",
                    blocks: [
                        {
                            type: "paragraph",
                            text: "Returns are accepted only if:",
                        },
                        {
                            type: "list",
                            items: [
                                "Item is damaged at delivery",
                                "Item is expired",
                                "Wrong product delivered",
                                "Product quality is not acceptable",
                            ],
                        },
                    ],
                },
                {
                    number: "10.3",
                    title: "Return Conditions",
                    blocks: [
                        {
                            type: "list",
                            items: [
                                "Must be reported within 24 hours of delivery",
                                "Must include proof (photo or video)",
                                "Product must remain unused where applicable",
                            ],
                        },
                    ],
                },
                {
                    number: "10.4",
                    title: "Refund Processing",
                    blocks: [
                        {
                            type: "paragraph",
                            text: "Refunds will be issued in cases of:",
                        },
                        {
                            type: "list",
                            items: [
                                "Order cancellation",
                                "Failed delivery",
                                "Approved return",
                            ],
                        },
                        { type: "paragraph", text: "Refund timeline:" },
                        {
                            type: "list",
                            items: [
                                "Online payment: 5–10 business days",
                                "COD: store credit or bank transfer (if applicable)",
                            ],
                        },
                    ],
                },
            ],
        },
        {
            number: "11",
            title: "Cancellation Policy",
            blocks: [
                {
                    type: "list",
                    items: [
                        "Orders can be cancelled before dispatch",
                        "Once shipped, cancellation may not be possible",
                        "Delivery charges may apply if cancellation occurs after dispatch",
                    ],
                },
            ],
        },
        {
            number: "12",
            title: "Promotions, Discounts & Coupons",
            blocks: [
                {
                    type: "paragraph",
                    text: "Promotions are subject to specific terms. Coupons:",
                },
                {
                    type: "list",
                    items: [
                        "Cannot be exchanged for cash",
                        "May have minimum order value",
                        "May be limited to one per customer",
                    ],
                },
                {
                    type: "paragraph",
                    text: "We reserve the right to cancel misuse of promotions.",
                },
            ],
        },
        {
            number: "13",
            title: "User Conduct",
            blocks: [
                { type: "paragraph", text: "You agree NOT to:" },
                {
                    type: "list",
                    items: [
                        "Provide false or misleading information",
                        "Engage in fraudulent transactions",
                        "Abuse COD system (fake orders / refusal)",
                        "Attempt to disrupt website functionality",
                    ],
                },
            ],
        },
        {
            number: "14",
            title: "Intellectual Property",
            blocks: [
                {
                    type: "paragraph",
                    text: "All content on the website including logos, images, text, and design belongs to Crown Worldwide Group Co for Wholesale and Retail Trade.",
                },
                {
                    type: "paragraph",
                    text: "Unauthorized use is prohibited.",
                },
            ],
        },
        {
            number: "15",
            title: "Limitation of Liability",
            blocks: [
                {
                    type: "paragraph",
                    text: "To the maximum extent permitted by Kuwaiti law, we are not liable for:",
                },
                {
                    type: "list",
                    items: [
                        "Indirect or incidental damages",
                        "Loss of profits or business",
                        "Delays caused by external factors",
                    ],
                },
            ],
        },
        {
            number: "16",
            title: "Health & Safety Disclaimer",
            blocks: [
                {
                    type: "list",
                    items: [
                        "Grocery items must be stored and consumed properly",
                        "We are not responsible for improper storage after delivery",
                        "Customers must check expiry dates upon receipt",
                    ],
                },
            ],
        },
        {
            number: "17",
            title: "Account Suspension & Termination",
            blocks: [
                {
                    type: "paragraph",
                    text: "We reserve the right to suspend or terminate accounts for:",
                },
                {
                    type: "list",
                    items: [
                        "Fraudulent activity",
                        "Abuse of services",
                        "Violation of Terms",
                    ],
                },
            ],
        },
        {
            number: "18",
            title: "Website Availability",
            blocks: [
                {
                    type: "list",
                    items: [
                        "We do not guarantee uninterrupted access",
                        "Website may be down for maintenance or updates",
                    ],
                },
            ],
        },
        {
            number: "19",
            title: "Privacy",
            blocks: [
                {
                    type: "paragraph",
                    text: "Your personal data is handled according to our Privacy Policy.",
                },
            ],
        },
        {
            number: "20",
            title: "Governing Law",
            blocks: [
                {
                    type: "paragraph",
                    text: "These Terms are governed by the laws of the State of Kuwait.",
                },
            ],
        },
        {
            number: "21",
            title: "Amendments",
            blocks: [
                {
                    type: "paragraph",
                    text: "We may update these Terms at any time. Continued use of the website means acceptance of updates.",
                },
            ],
        },
    ],
};

const ar: LegalContent = {
    title: "الشروط والأحكام",
    subtitle: "شركة كراون العالمية للتجارة بالجملة والتجزئة",
    tagline: "بقالة وتجارة إلكترونية وتجزئة – الكويت",
    sections: [
        {
            number: "١",
            title: "المقدمة",
            blocks: [
                {
                    type: "paragraph",
                    text: 'مرحباً بكم في الموقع الإلكتروني لشركة كراون العالمية للتجارة بالجملة والتجزئة ("الشركة"، "نحن"، "لنا").',
                },
                {
                    type: "paragraph",
                    text: "تحكم هذه الشروط والأحكام وصولكم إلى موقعنا الإلكتروني واستخدامكم لخدماتنا وجميع المشتريات المتعلقة بمواد البقالة المعروضة عبر منصتنا.",
                },
                {
                    type: "paragraph",
                    text: "باستخدامكم لموقعنا أو تقديم طلب شراء، فإنكم توافقون على الالتزام قانونياً بهذه الشروط.",
                },
            ],
        },
        {
            number: "٢",
            title: "نطاق الخدمات",
            blocks: [
                { type: "paragraph", text: "نحن نوفر:" },
                {
                    type: "list",
                    items: [
                        "تسوق البقالة عبر الإنترنت",
                        "بيع البقالة بالتجزئة والجملة",
                        "خدمات التوصيل إلى المنازل في جميع أنحاء الكويت",
                        "خدمات الاستلام من المتجر",
                    ],
                },
                {
                    type: "paragraph",
                    text: "جميع المنتجات المباعة هي حصراً مواد بقالة وأغذية، وتشمل على سبيل المثال لا الحصر:",
                },
                {
                    type: "list",
                    items: [
                        "المنتجات الطازجة (الفواكه والخضروات)",
                        "منتجات الألبان والمنتجات المبردة",
                        "الأطعمة المجمدة",
                        "مواد البقالة المعبأة",
                        "المشروبات",
                    ],
                },
            ],
        },
        {
            number: "٣",
            title: "الأهلية",
            blocks: [
                { type: "paragraph", text: "لاستخدام خدماتنا:" },
                {
                    type: "list",
                    items: [
                        "يجب أن لا يقل عمركم عن ١٨ عاماً",
                        "يجب تقديم معلومات شخصية دقيقة وكاملة",
                        "يجب أن تكونوا مؤهلين قانونياً لإبرام عقود ملزمة بموجب القانون الكويتي",
                    ],
                },
            ],
        },
        {
            number: "٤",
            title: "تسجيل الحساب والأمان",
            blocks: [
                {
                    type: "list",
                    items: [
                        "أنتم مسؤولون عن الحفاظ على سرية بيانات اعتماد حسابكم",
                        "توافقون على تحمل المسؤولية عن جميع الأنشطة التي تتم تحت حسابكم",
                        "نحتفظ بالحق في تعليق الحسابات في حالة وجود نشاط مشبوه أو احتيالي",
                    ],
                },
            ],
        },
        {
            number: "٥",
            title: "الطلبات والقبول",
            blocks: [
                {
                    type: "list",
                    items: [
                        "تعتبر جميع الطلبات المقدمة عروضاً للشراء",
                        "لا يتم تأكيد الطلبات إلا بعد موافقتنا ومعالجتها",
                        "نحتفظ بالحق في إلغاء الطلبات أو تقييد الكميات أو رفض تقديم الخدمة",
                    ],
                },
            ],
        },
        {
            number: "٦",
            title: "الأسعار والمدفوعات",
            subsections: [
                {
                    number: "٦.١",
                    title: "الأسعار",
                    blocks: [
                        {
                            type: "list",
                            items: [
                                "جميع الأسعار مدرجة بالدينار الكويتي (د.ك)",
                                "قد تتغير الأسعار دون إشعار مسبق",
                                "يتم تأكيد السعر النهائي عند إتمام عملية الشراء",
                            ],
                        },
                    ],
                },
                {
                    number: "٦.٢",
                    title: "طرق الدفع",
                    blocks: [
                        { type: "paragraph", text: "نحن نقبل:" },
                        {
                            type: "list",
                            items: [
                                "الدفع عند الاستلام (COD)",
                                "المدفوعات الإلكترونية (البطاقات وبوابات الدفع)",
                            ],
                        },
                    ],
                },
                {
                    number: "٦.٣",
                    title: "شروط الدفع",
                    blocks: [
                        {
                            type: "list",
                            items: [
                                "يجب إتمام الدفع قبل الإرسال (للطلبات الإلكترونية)",
                                "يجب سداد الدفع عند الاستلام في وقت التسليم",
                            ],
                        },
                    ],
                },
            ],
        },
        {
            number: "٧",
            title: "سياسة التوصيل",
            subsections: [
                {
                    number: "٧.١",
                    title: "خدمة التوصيل",
                    blocks: [
                        {
                            type: "list",
                            items: [
                                "متاحة في مناطق مختارة داخل الكويت",
                                "أوقات التوصيل تقديرية فقط",
                            ],
                        },
                    ],
                },
                {
                    number: "٧.٢",
                    title: "شروط التوصيل",
                    blocks: [
                        { type: "paragraph", text: "يجب عليكم:" },
                        {
                            type: "list",
                            items: [
                                "تقديم عنوان توصيل دقيق",
                                "التأكد من وجود شخص لاستلام الطلب",
                                "تقديم بيانات اتصال صحيحة",
                            ],
                        },
                    ],
                },
                {
                    number: "٧.٣",
                    title: "فشل التوصيل",
                    blocks: [
                        { type: "paragraph", text: "قد نقوم بإلغاء الطلبات في الحالات التالية:" },
                        {
                            type: "list",
                            items: [
                                "العنوان غير صحيح",
                                "تعذّر الوصول إلى العميل",
                                "تكرار فشل محاولات التوصيل",
                            ],
                        },
                    ],
                },
            ],
        },
        {
            number: "٨",
            title: "الاستلام من المتجر",
            blocks: [
                {
                    type: "list",
                    items: [
                        "يمكن للعملاء اختيار خيار الاستلام من المتجر",
                        "يجب استلام الطلبات خلال الوقت المحدد",
                        "قد يُطلب إبراز هوية صالحة أو تأكيد الطلب",
                    ],
                },
            ],
        },
        {
            number: "٩",
            title: "توفر المنتجات",
            blocks: [
                {
                    type: "paragraph",
                    text: "تخضع جميع المنتجات لتوفر المخزون. ونحتفظ بالحق في:",
                },
                {
                    type: "list",
                    items: [
                        "استبدال المنتجات بأخرى مماثلة",
                        "إلغاء المنتجات غير المتوفرة",
                        "إصدار استرداد للمبالغ عن المنتجات غير المتوفرة في المخزون",
                    ],
                },
            ],
        },
        {
            number: "١٠",
            title: "سياسة الإرجاع والاسترداد الخاصة بالبقالة",
            subsections: [
                {
                    number: "١٠.١",
                    title: "المنتجات غير القابلة للإرجاع",
                    blocks: [
                        {
                            type: "paragraph",
                            text: "وفقاً للوائح النظافة والسلامة في الكويت:",
                        },
                        {
                            type: "list",
                            items: [
                                "المنتجات القابلة للتلف (الطازجة، الألبان، اللحوم، المجمدة)",
                                "المنتجات المفتوحة أو المستهلكة",
                            ],
                        },
                        {
                            type: "callout",
                            text: "لا يمكن إرجاعها إلا في حال كانت معيبة عند التسليم.",
                        },
                    ],
                },
                {
                    number: "١٠.٢",
                    title: "الإرجاعات المؤهلة",
                    blocks: [
                        {
                            type: "paragraph",
                            text: "يتم قبول الإرجاع فقط في الحالات التالية:",
                        },
                        {
                            type: "list",
                            items: [
                                "تلف المنتج عند التسليم",
                                "انتهاء صلاحية المنتج",
                                "تسليم منتج خاطئ",
                                "جودة المنتج غير مقبولة",
                            ],
                        },
                    ],
                },
                {
                    number: "١٠.٣",
                    title: "شروط الإرجاع",
                    blocks: [
                        {
                            type: "list",
                            items: [
                                "يجب الإبلاغ خلال ٢٤ ساعة من التسليم",
                                "يجب تقديم إثبات (صورة أو فيديو)",
                                "يجب أن يبقى المنتج غير مستخدم حيثما ينطبق ذلك",
                            ],
                        },
                    ],
                },
                {
                    number: "١٠.٤",
                    title: "معالجة الاسترداد",
                    blocks: [
                        {
                            type: "paragraph",
                            text: "يتم إصدار استرداد المبالغ في الحالات التالية:",
                        },
                        {
                            type: "list",
                            items: [
                                "إلغاء الطلب",
                                "فشل التوصيل",
                                "قبول طلب الإرجاع",
                            ],
                        },
                        { type: "paragraph", text: "الجدول الزمني للاسترداد:" },
                        {
                            type: "list",
                            items: [
                                "الدفع الإلكتروني: من ٥ إلى ١٠ أيام عمل",
                                "الدفع عند الاستلام: رصيد متجر أو تحويل بنكي (إن أمكن)",
                            ],
                        },
                    ],
                },
            ],
        },
        {
            number: "١١",
            title: "سياسة الإلغاء",
            blocks: [
                {
                    type: "list",
                    items: [
                        "يمكن إلغاء الطلبات قبل إرسالها",
                        "بعد الشحن، قد لا يكون الإلغاء ممكناً",
                        "قد تطبق رسوم التوصيل في حال الإلغاء بعد الإرسال",
                    ],
                },
            ],
        },
        {
            number: "١٢",
            title: "العروض الترويجية والخصومات والقسائم",
            blocks: [
                {
                    type: "paragraph",
                    text: "تخضع العروض الترويجية لشروط محددة. القسائم:",
                },
                {
                    type: "list",
                    items: [
                        "لا يمكن استبدالها نقداً",
                        "قد تتطلب حداً أدنى لقيمة الطلب",
                        "قد تكون محدودة بقسيمة واحدة لكل عميل",
                    ],
                },
                {
                    type: "paragraph",
                    text: "نحتفظ بالحق في إلغاء أي إساءة استخدام للعروض الترويجية.",
                },
            ],
        },
        {
            number: "١٣",
            title: "سلوك المستخدم",
            blocks: [
                { type: "paragraph", text: "أنتم توافقون على عدم القيام بما يلي:" },
                {
                    type: "list",
                    items: [
                        "تقديم معلومات كاذبة أو مضللة",
                        "الانخراط في معاملات احتيالية",
                        "إساءة استخدام نظام الدفع عند الاستلام (طلبات وهمية أو رفض الاستلام)",
                        "محاولة تعطيل وظائف الموقع",
                    ],
                },
            ],
        },
        {
            number: "١٤",
            title: "الملكية الفكرية",
            blocks: [
                {
                    type: "paragraph",
                    text: "جميع المحتويات الموجودة على الموقع بما في ذلك الشعارات والصور والنصوص والتصميم تعود ملكيتها إلى شركة كراون العالمية للتجارة بالجملة والتجزئة.",
                },
                {
                    type: "paragraph",
                    text: "يحظر الاستخدام غير المصرح به.",
                },
            ],
        },
        {
            number: "١٥",
            title: "تحديد المسؤولية",
            blocks: [
                {
                    type: "paragraph",
                    text: "إلى أقصى حد يسمح به القانون الكويتي، نحن غير مسؤولين عن:",
                },
                {
                    type: "list",
                    items: [
                        "الأضرار غير المباشرة أو العرضية",
                        "خسارة الأرباح أو الأعمال التجارية",
                        "التأخيرات الناجمة عن عوامل خارجية",
                    ],
                },
            ],
        },
        {
            number: "١٦",
            title: "إخلاء المسؤولية الصحية والسلامة",
            blocks: [
                {
                    type: "list",
                    items: [
                        "يجب تخزين مواد البقالة واستهلاكها بطريقة صحيحة",
                        "نحن غير مسؤولين عن التخزين غير السليم بعد التسليم",
                        "يجب على العملاء فحص تواريخ انتهاء الصلاحية عند الاستلام",
                    ],
                },
            ],
        },
        {
            number: "١٧",
            title: "تعليق الحساب وإنهاؤه",
            blocks: [
                {
                    type: "paragraph",
                    text: "نحتفظ بالحق في تعليق الحسابات أو إنهائها في حالات:",
                },
                {
                    type: "list",
                    items: [
                        "النشاط الاحتيالي",
                        "إساءة استخدام الخدمات",
                        "انتهاك الشروط",
                    ],
                },
            ],
        },
        {
            number: "١٨",
            title: "توفر الموقع",
            blocks: [
                {
                    type: "list",
                    items: [
                        "نحن لا نضمن الوصول دون انقطاع",
                        "قد يكون الموقع غير متاح بسبب أعمال الصيانة أو التحديث",
                    ],
                },
            ],
        },
        {
            number: "١٩",
            title: "الخصوصية",
            blocks: [
                {
                    type: "paragraph",
                    text: "تتم معالجة بياناتكم الشخصية وفقاً لسياسة الخصوصية الخاصة بنا.",
                },
            ],
        },
        {
            number: "٢٠",
            title: "القانون الحاكم",
            blocks: [
                {
                    type: "paragraph",
                    text: "تخضع هذه الشروط لقوانين دولة الكويت.",
                },
            ],
        },
        {
            number: "٢١",
            title: "التعديلات",
            blocks: [
                {
                    type: "paragraph",
                    text: "يحق لنا تحديث هذه الشروط في أي وقت. ويُعدّ استمرارك في استخدام الموقع قبولاً للتحديثات.",
                },
            ],
        },
    ],
};

export const termsContent: LocalizedLegalContent = { en, ar };
