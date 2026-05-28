import type { LegalContent, LocalizedLegalContent } from "./types";

const en: LegalContent = {
    title: "Return and Refund Policy",
    subtitle:
        "CROWN VALUEMART — operated by Crown Worldwide Group Co. for Wholesale and Retail Trade — Kuwait",
    tagline: "Last updated: 18 May 2026",
    sections: [
        {
            number: "1",
            title: "Overview and Legal Basis",
            blocks: [
                {
                    type: "paragraph",
                    text: "At CROWN VALUEMART, we want every purchase to meet your expectations. This Return and Refund Policy explains how returns, exchanges, refunds, and cancellations are handled for orders placed through our online Platform, whether for home delivery or in-store pickup.",
                },
                {
                    type: "paragraph",
                    text: "This Policy is issued in compliance with:",
                },
                {
                    type: "list",
                    items: [
                        `Amiri Decree-Law No. 10 of 2026 Regulating the Digital Commerce Sector (the "Digital Commerce Law");`,
                        "Law No. 39 of 2014 on Consumer Protection and its Executive Regulations;",
                        "Law No. 20 of 2014 on Electronic Transactions;",
                        "Decisions and circulars issued by the Ministry of Commerce and Industry (MOCI).",
                    ],
                },
                {
                    type: "paragraph",
                    text: "Nothing in this Policy limits or replaces your statutory consumer rights under Kuwaiti law.",
                },
            ],
        },
        {
            number: "2",
            title: "Important Note on Our Product Mix",
            blocks: [
                {
                    type: "paragraph",
                    text: "CROWN VALUEMART sells household consumables and personal-care products including baby care, bath and body, dishwash, hair care, health and wellness, home and hardware, home care, household, laundry care, and personal care.",
                },
                {
                    type: "callout",
                    text: "Most of these items are governed by strict hygiene and safety rules under Kuwaiti law. Once the factory seal of a personal-care, baby-care, hygiene, or health product has been broken, the item generally cannot be returned, even if unused, unless it is defective on delivery, expired, or was incorrectly supplied. Please read this Policy carefully before purchasing.",
                },
            ],
        },
        {
            number: "3",
            title: "Your 14-Day Right to Return",
            blocks: [
                {
                    type: "paragraph",
                    text: "In line with Articles 19 to 22 of the Digital Commerce Law and the Consumer Protection Law, you have the right to return or exchange eligible products within 14 calendar days from the date of delivery, subject to the conditions set out in this Policy.",
                },
                { type: "paragraph", text: "To exercise this right:" },
                {
                    type: "list",
                    items: [
                        "Notify us within 14 days from delivery using the contact channels in Section 12 of this Policy;",
                        "Provide your order number and proof of purchase;",
                        "Return the product in the condition described in Section 4 below.",
                    ],
                },
            ],
        },
        {
            number: "4",
            title: "Eligibility by Product Category",
            blocks: [
                {
                    type: "paragraph",
                    text: "The table below summarises return eligibility by category. The product page may indicate additional category-specific terms; where there is any conflict, the more favourable term to the consumer applies.",
                },
                {
                    type: "table",
                    headers: [
                        "Category",
                        "Return Window",
                        "Condition Required",
                        "Refund Method",
                    ],
                    rows: [
                        [
                            "Baby Care (diapers, wipes, baby bath, baby accessories)",
                            "Only if defective on delivery, expired, or wrongly supplied",
                            "Sealed, unopened, original packaging, well within expiry date",
                            "Original payment method",
                        ],
                        [
                            "Bath and Body (soaps, shower gels, body lotions, scrubs)",
                            "14 days from delivery if sealed; otherwise only if defective on delivery",
                            "Factory seal must be intact (hygiene rule)",
                            "Original payment method",
                        ],
                        [
                            "Dishwash (liquids, tablets, sponges, scrubbers)",
                            "14 days from delivery",
                            "Sealed, unopened, original packaging",
                            "Original payment method",
                        ],
                        [
                            "Hair Care (shampoo, conditioner, oils, treatments, styling)",
                            "14 days from delivery if sealed; otherwise only if defective on delivery",
                            "Factory seal must be intact (hygiene rule)",
                            "Original payment method",
                        ],
                        [
                            "Health and Wellness (supplements, OTC items, health devices)",
                            "Only if defective on delivery, expired, or wrongly supplied",
                            "Sealed, unopened, well within expiry date",
                            "Original payment method",
                        ],
                        [
                            "Home and Hardware (tools, fittings, light hardware)",
                            "14 days from delivery",
                            "Unused, undamaged, original packaging, all parts and accessories",
                            "Original payment method",
                        ],
                        [
                            "Home Care (air fresheners, candles, surface care)",
                            "14 days from delivery if sealed; otherwise only if defective on delivery",
                            "Sealed, unopened, original packaging",
                            "Original payment method",
                        ],
                        [
                            "Household (utensils, cleaning tools, storage, kitchenware)",
                            "14 days from delivery",
                            "Unused, undamaged, original packaging",
                            "Original payment method",
                        ],
                        [
                            "Laundry Care (detergents, softeners, stain removers)",
                            "14 days from delivery",
                            "Sealed, unopened, original packaging",
                            "Original payment method",
                        ],
                        [
                            "Personal Care (oral care, deodorants, shaving, feminine hygiene)",
                            "Only if defective on delivery, or sealed and unopened within 14 days",
                            "Factory seal must be intact (hygiene rule)",
                            "Original payment method",
                        ],
                    ],
                },
            ],
        },
        {
            number: "5",
            title: "Items That Cannot Be Returned",
            blocks: [
                {
                    type: "paragraph",
                    text: "In line with hygiene, safety, and regulatory considerations under Kuwaiti law, the following CROWN VALUEMART items cannot be returned unless they are defective on delivery, expired, or were delivered incorrectly:",
                },
                {
                    type: "list",
                    items: [
                        "Any personal-care, bath-and-body, hair-care, oral-care, deodorant, shaving, or feminine-hygiene product where the factory seal has been broken;",
                        "Any baby-care product (including diapers, wipes, baby skincare, feeding accessories) where the factory seal has been broken;",
                        "Any health, wellness, or supplement product where the seal has been broken or where less than 30 days remain before expiry;",
                        "Opened cleaning, laundry, or dishwash products that have been used or partially consumed;",
                        "Items returned without their original packaging, instructions, or accessories where these were supplied;",
                        "Items marked as final sale, clearance, or non-returnable on the product page at the time of purchase;",
                        "Promotional bundle items returned only in part (see Section 9 below).",
                    ],
                },
            ],
        },
        {
            number: "6",
            title: "Damaged, Defective, Expired, or Incorrect Orders",
            blocks: [
                {
                    type: "paragraph",
                    text: "We carefully inspect and pack every CROWN VALUEMART order. In the rare event that you receive a product that is damaged, defective, expired, or different from what you ordered, please:",
                },
                {
                    type: "list",
                    items: [
                        "Contact us within 48 hours of delivery for items that are visibly damaged, leaking, broken-sealed, expired, or incorrect;",
                        "Provide clear photographs or video showing the issue, the product's batch number or expiry date where relevant, and the order packaging;",
                        "Keep the product and its original packaging until the issue is resolved.",
                    ],
                },
                {
                    type: "paragraph",
                    text: "Once the claim is verified, we will offer one of the following remedies, at your reasonable choice and based on availability:",
                },
                {
                    type: "list",
                    items: [
                        "Replacement with an identical product from a fresh batch;",
                        "Replacement with a similar product of equivalent value, where you agree;",
                        "A full refund to your original payment method.",
                    ],
                },
                {
                    type: "paragraph",
                    text: "In line with Article 15 of the Consumer Protection Law, the seller and supplier are jointly liable for product defects. We will not redirect responsibility for defects to the manufacturer alone.",
                },
            ],
        },
        {
            number: "7",
            title: "Order Cancellations",
            subsections: [
                {
                    number: "7.1",
                    title: "Before Dispatch",
                    blocks: [
                        {
                            type: "paragraph",
                            text: "You may cancel your CROWN VALUEMART order at no cost at any time before it is dispatched. Once an order has been processed for dispatch, it can no longer be cancelled and will need to follow the standard return process.",
                        },
                    ],
                },
                {
                    number: "7.2",
                    title: "After Dispatch",
                    blocks: [
                        {
                            type: "paragraph",
                            text: "If you cancel after dispatch, or refuse delivery without valid reason:",
                        },
                        {
                            type: "list",
                            items: [
                                "Outbound and return delivery charges may be deducted from your refund;",
                                "A reasonable handling fee may apply where Kuwaiti law permits.",
                            ],
                        },
                    ],
                },
            ],
        },
        {
            number: "8",
            title: "Refund Method and Timeline",
            blocks: [
                {
                    type: "paragraph",
                    text: "In compliance with Article 23 of the Digital Commerce Law and Kuwaiti consumer-protection requirements, refunds are issued through the same method used for the original payment, unless you and CROWN VALUEMART expressly agree otherwise. We do not deduct payment-gateway fees, KNET fees, or card-processing fees from the refunded amount.",
                },
                {
                    type: "paragraph",
                    text: "Once your return is approved, your refund is initiated immediately. The time it then takes for the refund to appear in your account depends on the payment method used at checkout and the standard processing cycle of your bank or wallet provider:",
                },
                {
                    type: "table",
                    headers: [
                        "Original Payment Method",
                        "Refund Timeline (from approval)",
                    ],
                    rows: [
                        ["KNET", "1 working day (T+1)"],
                        ["Apple Pay", "3 working days (T+3)"],
                        ["Google Pay", "3 working days (T+3)"],
                        [
                            "Local Visa / Mastercard (Kuwait-issued)",
                            "3 working days (T+3)",
                        ],
                        [
                            "Regional Visa / Mastercard (GCC-issued)",
                            "3 working days (T+3)",
                        ],
                        [
                            "Global Visa / Mastercard (international)",
                            "3 working days (T+3)",
                        ],
                        ["American Express (Amex)", "5 working days (T+5)"],
                        ["PayPal", "5 working days (T+5)"],
                        [
                            "Cash on Delivery",
                            "7 to 14 working days, by bank transfer (or, with your express agreement, as store credit)",
                        ],
                    ],
                },
                {
                    type: "paragraph",
                    text: "The timelines above reflect CROWN VALUEMART's processing cycle. In some cases, your card issuer or bank may take an additional 1–2 working days to post the refunded amount to your statement. If your refund has not appeared after the timeline above plus 2 working days, please contact us with your order number so we can investigate.",
                },
                {
                    type: "paragraph",
                    text: "Where you have a legal right to a refund to your original payment method, CROWN VALUEMART will not impose store credit, vouchers, or gift cards as a substitute. You may, however, choose store credit voluntarily.",
                },
            ],
        },
        {
            number: "9",
            title: "Promotional and Bundle Items",
            blocks: [
                {
                    type: "paragraph",
                    text: `Where a product was purchased as part of a promotional offer, bundle, or "buy one get one" deal, all items in the offer must be returned together to qualify for a refund. Returning only part of a bundle may convert the remaining purchase to its standard price, and any difference may be deducted from the refund.`,
                },
                {
                    type: "paragraph",
                    text: "Vouchers, store credit, and discount codes used at checkout are not refundable in cash unless required by law.",
                },
                {
                    type: "paragraph",
                    text: "During organised sales seasons or specific time-limited promotional campaigns, the return window may be shortened to seven (7) calendar days for sealed eligible items, where this is clearly disclosed on the relevant product page and at checkout. The 14-day right under the Digital Commerce Law still applies to defective, expired, or incorrectly supplied items regardless of promotional period.",
                },
            ],
        },
        {
            number: "10",
            title: "Delivery Charges and Refunds",
            blocks: [
                {
                    type: "paragraph",
                    text: "If a return is approved because of a defect, damage, expiry issue, wrong item, or any other fault attributable to CROWN VALUEMART, the original delivery charge will be refunded in full, and we will arrange free pickup.",
                },
                {
                    type: "paragraph",
                    text: "If you return a product because you simply changed your mind:",
                },
                {
                    type: "list",
                    items: [
                        "The original delivery charge is non-refundable;",
                        "A return-handling or pickup charge may apply, as disclosed at the time of the return request.",
                    ],
                },
            ],
        },
        {
            number: "11",
            title: "Pickup Orders (Click-and-Collect)",
            blocks: [
                {
                    type: "paragraph",
                    text: "For orders collected from our pickup point, we encourage you to inspect items at the moment of collection. Once you sign for the order and leave the pickup location, the same return windows and conditions apply as for delivery orders. Issues with damaged, expired, or incorrect items must still be reported within the timeframes specified above.",
                },
            ],
        },
        {
            number: "12",
            title: "How to Submit a Return Request",
            blocks: [
                {
                    type: "paragraph",
                    text: "To start a return on CROWN VALUEMART:",
                },
                {
                    type: "list",
                    items: [
                        `Log in to your account and navigate to "My Orders" to submit a return request; or`,
                        "Contact our customer service team at +965 5105 2112 (phone) or info@cwg-kwt.com (email);",
                        "Provide your order number, the item being returned, the reason, and supporting photos where requested;",
                        "Once approved, we will arrange pickup or provide drop-off instructions.",
                    ],
                },
            ],
        },
        {
            number: "13",
            title: "Right to Refuse a Return",
            blocks: [
                {
                    type: "paragraph",
                    text: "In line with Article 6 of the Executive Regulation of the Consumer Protection Law, CROWN VALUEMART may refuse a return or refund where:",
                },
                {
                    type: "list",
                    items: [
                        "The request is made outside the applicable return window;",
                        "The product has been used, opened, or its factory seal broken, except where defective on delivery, expired, or incorrectly supplied;",
                        "The product is missing its original packaging, accessories, or instructions where these were supplied;",
                        "There is insufficient evidence to support the claim;",
                        "The claim is inconsistent with this Policy or with Kuwaiti law;",
                        "The request is part of a documented pattern of abusive returns or fraud.",
                    ],
                },
                {
                    type: "paragraph",
                    text: "Where we refuse a return, we will explain the reason in writing. You retain the right to escalate the matter as set out in Section 14 below.",
                },
            ],
        },
        {
            number: "14",
            title: "Complaints and Dispute Resolution",
            subsections: [
                {
                    number: "14.1",
                    title: "Internal Complaints Procedure",
                    blocks: [
                        {
                            type: "paragraph",
                            text: "If you are not satisfied with the handling of a return or refund, you may submit a complaint through our internal complaints procedure described in Section 24 of our Terms and Conditions. We acknowledge complaints within two (2) Kuwaiti business days, respond substantively within seven (7) Kuwaiti business days, and aim to fully resolve them within fourteen (14) Kuwaiti business days.",
                        },
                    ],
                },
                {
                    number: "14.2",
                    title: "External Escalation",
                    blocks: [
                        {
                            type: "paragraph",
                            text: "If the matter is not resolved to your satisfaction internally, you may escalate it through:",
                        },
                        {
                            type: "list",
                            items: [
                                "The Ministry of Commerce and Industry consumer protection hotline (135);",
                                "The National Committee for Consumer Protection;",
                                "The Digital Commerce Dispute Settlement Committee established under the Digital Commerce Law;",
                                "The competent courts of the State of Kuwait.",
                            ],
                        },
                    ],
                },
            ],
        },
        {
            number: "15",
            title: "Language and Interpretation",
            blocks: [
                {
                    type: "paragraph",
                    text: "This Policy is issued in Arabic and in English. The Arabic version is the official version for the purposes of Kuwaiti law and for any proceedings before Kuwaiti courts, regulatory authorities, or dispute-settlement committees. The English version is provided as a courtesy translation. In the event of any inconsistency or conflict between the Arabic and English versions, the Arabic version shall prevail.",
                },
            ],
        },
    ],
};

const ar: LegalContent = {
    title: "سياسة الاسترجاع والاسترداد",
    subtitle:
        "متجر CROWN VALUEMART — تشغيل: شركة كراون وورلد وايد جروب للتجارة بالجملة والتجزئة — دولة الكويت",
    tagline: "آخر تحديث: 18 مايو 2026",
    sections: [
        {
            number: "1",
            title: "تمهيد والأساس التشريعي",
            blocks: [
                {
                    type: "paragraph",
                    text: "يحرص متجر CROWN VALUEMART على أن تفي كل عملية شراء بتوقعات عملائه؛ ولهذا أُعدت سياسة الاسترجاع والاسترداد لتُبيِّن آليات معالجة طلبات الاسترجاع والاستبدال والاسترداد وإلغاء الطلبات، سواء أَجرى العميل طلبه بقصد التوصيل المنزلي أم الاستلام من المتجر.",
                },
                {
                    type: "paragraph",
                    text: "وتستند هذه السياسة إلى التشريعات الآتية:",
                },
                {
                    type: "list",
                    items: [
                        "المرسوم بقانون رقم (10) لسنة 2026 في شأن تنظيم قطاع التجارة الرقمية (ويُشار إليه بـ«قانون التجارة الرقمية»)؛",
                        "القانون رقم (39) لسنة 2014 في شأن حماية المستهلك ولائحته التنفيذية؛",
                        "القانون رقم (20) لسنة 2014 في شأن المعاملات الإلكترونية؛",
                        "القرارات والتعاميم الصادرة عن وزارة التجارة والصناعة.",
                    ],
                },
                {
                    type: "paragraph",
                    text: "ولا يتضمن أي بند من هذه السياسة ما يُقيِّد أو يحلّ محلّ الحقوق القانونية للمستهلك المقرَّرة بموجب التشريعات الكويتية النافذة.",
                },
            ],
        },
        {
            number: "2",
            title: "تنبيه يخص طبيعة منتجاتنا",
            blocks: [
                {
                    type: "paragraph",
                    text: "يبيع متجر CROWN VALUEMART مستهلكات منزلية ومنتجات عناية شخصية، تشمل: العناية بالأطفال، والاستحمام والجسم، وغسيل الأطباق، والعناية بالشعر، والصحة والعافية، وأدوات المنزل والعدد اليدوية، والعناية بالمنزل، والمستلزمات المنزلية، والعناية بالغسيل، والعناية الشخصية.",
                },
                {
                    type: "callout",
                    text: "ومعظم هذه المنتجات تخضع لاشتراطات صحية وقواعد سلامة صارمة بموجب القانون الكويتي؛ وكسر الخاتم المصنعي لأي منتج من منتجات العناية الشخصية أو العناية بالأطفال أو النظافة أو الصحة يُسقِط حقَّ الاسترجاع — حتى وإن لم يُستعمل المنتج — ما لم يكن معيباً عند التسليم أو منتهي الصلاحية أو سُلِّم خطأً. وعليه، يُرجى من العميل قراءة هذه السياسة بعناية قبل إتمام عملية الشراء.",
                },
            ],
        },
        {
            number: "3",
            title: "حق الاسترجاع خلال أربعة عشر يوماً",
            blocks: [
                {
                    type: "paragraph",
                    text: "وفقاً للمواد من (19) إلى (22) من قانون التجارة الرقمية وأحكام قانون حماية المستهلك، يحق للعميل أن يطلب استرجاع المنتجات المؤهَّلة أو استبدالها خلال أربعة عشر يوماً تقويمياً من تاريخ التسليم، وذلك وفقاً للشروط المبيَّنة في هذه السياسة.",
                },
                { type: "paragraph", text: "ولممارسة هذا الحق، يلزم:" },
                {
                    type: "list",
                    items: [
                        "إخطار الشركة خلال أربعة عشر يوماً من التسليم، عبر قنوات التواصل المُبيَّنة في البند (12) من هذه السياسة؛",
                        "تقديم رقم الطلب وما يُثبت عملية الشراء؛",
                        "إعادة المنتج بالحالة المُبيَّنة في البند (4) أدناه.",
                    ],
                },
            ],
        },
        {
            number: "4",
            title: "أهلية الاسترجاع بحسب فئة المنتج",
            blocks: [
                {
                    type: "paragraph",
                    text: "يُلخِّص الجدول التالي أهلية الاسترجاع وفقاً لفئة المنتج، وقد تتضمن صفحة المنتج شروطاً إضافية خاصةً بفئته. وعند وجود أي تعارض، يُطبَّق الشرط الأكثر مواءمةً لمصلحة العميل.",
                },
                {
                    type: "table",
                    headers: [
                        "الفئة",
                        "نافذة الاسترجاع",
                        "الشرط المطلوب",
                        "وسيلة استرداد القيمة",
                    ],
                    rows: [
                        [
                            "العناية بالأطفال (الحفاضات، المناديل المبللة، مستحضرات الاستحمام، الإكسسوارات)",
                            "في حالات العيب عند التسليم أو انتهاء الصلاحية أو الخطأ في التسليم فقط",
                            "مغلَّف، غير مفتوح، بعبوة أصلية، وضمن صلاحية كافية",
                            "وسيلة الدفع الأصلية",
                        ],
                        [
                            "الاستحمام والجسم (الصوابين، أنواع الشاور جل، اللوشن، المقشِّرات)",
                            "أربعة عشر يوماً من التسليم إذا كان مغلَّفاً؛ وإلا فلا يُقبل إلا حال العيب عند التسليم",
                            "يجب أن يكون الخاتم المصنعي سليماً (لأسباب صحية)",
                            "وسيلة الدفع الأصلية",
                        ],
                        [
                            "غسيل الأطباق (السائل، الأقراص، الإسفنج، اللُيف)",
                            "أربعة عشر يوماً من التسليم",
                            "مغلَّف، غير مفتوح، بعبوة أصلية",
                            "وسيلة الدفع الأصلية",
                        ],
                        [
                            "العناية بالشعر (الشامبو، البلسم، الزيوت، المعالجات، التصفيف)",
                            "أربعة عشر يوماً من التسليم إذا كان مغلَّفاً؛ وإلا فلا يُقبل إلا حال العيب عند التسليم",
                            "يجب أن يكون الخاتم المصنعي سليماً (لأسباب صحية)",
                            "وسيلة الدفع الأصلية",
                        ],
                        [
                            "الصحة والعافية (المكمِّلات، الأدوية المتاحة بدون وصفة، الأجهزة الصحية)",
                            "في حالات العيب عند التسليم أو انتهاء الصلاحية أو الخطأ في التسليم فقط",
                            "مغلَّف، غير مفتوح، وضمن صلاحية كافية",
                            "وسيلة الدفع الأصلية",
                        ],
                        [
                            "أدوات المنزل والعدد اليدوية (الأدوات، التركيبات، العدد الخفيفة)",
                            "أربعة عشر يوماً من التسليم",
                            "غير مستعمل، غير متضرر، بعبوة أصلية مع كامل القطع والملحقات",
                            "وسيلة الدفع الأصلية",
                        ],
                        [
                            "العناية بالمنزل (معطِّرات الجو، الشموع، منظِّفات الأسطح)",
                            "أربعة عشر يوماً من التسليم إذا كان مغلَّفاً؛ وإلا فلا يُقبل إلا حال العيب عند التسليم",
                            "مغلَّف، غير مفتوح، بعبوة أصلية",
                            "وسيلة الدفع الأصلية",
                        ],
                        [
                            "المستلزمات المنزلية (الأواني، أدوات التنظيف، التخزين، أدوات المطبخ)",
                            "أربعة عشر يوماً من التسليم",
                            "غير مستعمل، غير متضرر، بعبوة أصلية",
                            "وسيلة الدفع الأصلية",
                        ],
                        [
                            "العناية بالغسيل (المنظفات، المنعّمات، مزيلات البقع)",
                            "أربعة عشر يوماً من التسليم",
                            "مغلَّف، غير مفتوح، بعبوة أصلية",
                            "وسيلة الدفع الأصلية",
                        ],
                        [
                            "العناية الشخصية (العناية بالفم، مزيلات العرق، أدوات الحلاقة، النظافة النسائية)",
                            "أربعة عشر يوماً من التسليم إذا كان مغلَّفاً؛ وإلا فلا يُقبل إلا حال العيب عند التسليم",
                            "يجب أن يكون الخاتم المصنعي سليماً (لأسباب صحية)",
                            "وسيلة الدفع الأصلية",
                        ],
                    ],
                },
            ],
        },
        {
            number: "5",
            title: "المنتجات غير القابلة للاسترجاع",
            blocks: [
                {
                    type: "paragraph",
                    text: "مراعاةً للاشتراطات الصحية والسلامة والقواعد التنظيمية في الكويت، لا تُقبَل عمليات الاسترجاع للمنتجات الآتية، ما لم تكن معيبةً عند التسليم أو منتهية الصلاحية أو مسلَّمةً خطأً:",
                },
                {
                    type: "list",
                    items: [
                        "منتجات العناية الشخصية أو الاستحمام والجسم أو العناية بالشعر أو العناية بالفم أو مزيلات العرق أو أدوات الحلاقة أو منتجات النظافة النسائية حال كسر الخاتم المصنعي؛",
                        "منتجات العناية بالأطفال (بما فيها الحفاضات والمناديل المبللة ومستحضرات بشرة الأطفال وأدوات التغذية) حال كسر الخاتم المصنعي؛",
                        "منتجات الصحة والعافية والمكمِّلات حال كسر الخاتم أو إذا أصبحت مدة الصلاحية المتبقية أقل من ثلاثين يوماً؛",
                        "منتجات التنظيف والغسيل وغسيل الأطباق التي فُتحت أو استُعملت أو استُهلكت جزئياً؛",
                        "المنتجات التي تُعاد دون عبوتها الأصلية أو دون نشراتها أو ملحقاتها متى كانت مُورَّدةً معها؛",
                        "المنتجات المُبيَّن عليها وقت الشراء أنها «بيع نهائي» أو «تصفية» أو «غير قابلة للاسترجاع»؛",
                        "منتجات الحزم الترويجية المُعاد بعضها دون الباقي (راجع البند (9) أدناه).",
                    ],
                },
            ],
        },
        {
            number: "6",
            title: "المنتجات التالفة أو المعيبة أو منتهية الصلاحية أو المسلَّمة خطأً",
            blocks: [
                {
                    type: "paragraph",
                    text: "يُجرَى الفحص والتعبئة لكل طلب بعناية تامة؛ وفي الحالات النادرة التي يستلم فيها العميل منتجاً تالفاً أو معيباً أو منتهي الصلاحية أو مغايراً لما طلب، يُرجى منه:",
                },
                {
                    type: "list",
                    items: [
                        "التواصل مع الشركة خلال 48 ساعة من التسليم لكل منتج يظهر عليه تلف ظاهري أو تسرُّب أو كسر في الخاتم المصنعي أو انتهاء صلاحية أو تباين مع الطلب؛",
                        "تقديم صور أو مقاطع فيديو واضحة تُبيِّن المشكلة، ورقم الدفعة أو تاريخ الصلاحية حيثما اقتضى الأمر، إضافةً إلى صورة لتغليف الطلب؛",
                        "الاحتفاظ بالمنتج وعبوته الأصلية إلى حين الفصل في المطالبة.",
                    ],
                },
                {
                    type: "paragraph",
                    text: "ومتى ثبتت صحة المطالبة، تُتيح الشركة إحدى وسائل المعالجة التالية وفقاً لاختيار العميل المعقول وتبعاً للتوفُّر:",
                },
                {
                    type: "list",
                    items: [
                        "استبدال المنتج بآخر مطابق له من دفعة إنتاج جديدة؛",
                        "استبدال المنتج بمنتج مماثل من القيمة نفسها، رهناً بموافقة العميل؛",
                        "استرداد كامل القيمة عبر وسيلة الدفع الأصلية.",
                    ],
                },
                {
                    type: "paragraph",
                    text: "وعملاً بأحكام المادة (15) من قانون حماية المستهلك, تتحمل الشركة والمورِّد المسؤوليةَ بالتضامن عن عيوب المنتج، ولا تُحيل الشركة هذه المسؤولية على الشركة المصنِّعة وحدها.",
                },
            ],
        },
        {
            number: "7",
            title: "إلغاء الطلبات",
            subsections: [
                {
                    number: "7-1",
                    title: "قبل الشحن",
                    blocks: [
                        {
                            type: "paragraph",
                            text: "يحق للعميل إلغاء طلبه دون أي تكلفة في أي وقت قبل شحن الطلب. ومتى دخل الطلب طور المعالجة للشحن، تعذَّر إلغاؤه، وأصبح خاضعاً لإجراءات الاسترجاع المعتادة.",
                        },
                    ],
                },
                {
                    number: "7-2",
                    title: "بعد الشحن",
                    blocks: [
                        {
                            type: "paragraph",
                            text: "في حال إلغاء الطلب بعد الشحن أو رفض التسليم دون مبرِّر مشروع:",
                        },
                        {
                            type: "list",
                            items: [
                                "يجوز اقتطاع رسوم شحن الذهاب والإياب من المبلغ المُسترَدّ؛",
                                "يجوز فرض رسم مناولة معقول في الحدود التي يجيزها القانون الكويتي.",
                            ],
                        },
                    ],
                },
            ],
        },
        {
            number: "8",
            title: "آلية الاسترداد وجدوله الزمني",
            blocks: [
                {
                    type: "paragraph",
                    text: "التزاماً بالمادة (23) من قانون التجارة الرقمية وبمتطلبات حماية المستهلك في الكويت، تُعاد المبالغ المُسترَدَّة عبر وسيلة الدفع الأصلية ذاتها، ما لم يَتفق العميل والشركة صراحةً على غير ذلك. ولا تُخصَم رسوم بوابات الدفع أو رسوم K-NET أو رسوم معالجة البطاقات من قيمة المبلغ المُسترَدّ.",
                },
                {
                    type: "paragraph",
                    text: "وبمجرد الموافقة على عملية الاسترجاع، تُباشر الشركة إجراءات الاسترداد على الفور. وتعتمد الفترة الفعلية لظهور المبلغ في حساب العميل على وسيلة الدفع المختارة عند الشراء، ودورة المعالجة المعتادة لدى البنك أو مزوِّد المحفظة الإلكترونية، على النحو الآتي:",
                },
                {
                    type: "table",
                    headers: [
                        "وسيلة الدفع الأصلية",
                        "المدة المتوقَّعة للاسترداد (من تاريخ الموافقة)",
                    ],
                    rows: [
                        ["K-NET", "يوم عمل واحد (T+1)"],
                        ["Apple Pay", "ثلاثة أيام عمل (T+3)"],
                        ["Google Pay", "ثلاثة أيام عمل (T+3)"],
                        [
                            "Visa / Mastercard محلية (مُصدَرة في الكويت)",
                            "ثلاثة أيام عمل (T+3)",
                        ],
                        [
                            "Visa / Mastercard إقليمية (مُصدَرة في دول الخليج)",
                            "ثلاثة أيام عمل (T+3)",
                        ],
                        ["Visa / Mastercard دولية", "ثلاثة أيام عمل (T+3)"],
                        ["American Express (Amex)", "خمسة أيام عمل (T+5)"],
                        ["PayPal", "خمسة أيام عمل (T+5)"],
                        [
                            "الدفع عند الاستلام",
                            "من سبعة إلى أربعة عشر يوم عمل، عن طريق حوالة بنكية (أو رصيداً تخزينياً بموافقة صريحة من العميل)",
                        ],
                    ],
                },
                {
                    type: "paragraph",
                    text: "وتعكس هذه المدد دورة المعالجة لدى الشركة، وقد يستغرق البنك أو مُصدِر البطاقة يوماً أو يومَي عمل إضافيَّين لإيداع المبلغ في كشف الحساب. وفي حال عدم ظهور المبلغ المُسترَدّ بعد انقضاء المدة المشار إليها مضافاً إليها يومَا عمل، يُرجى من العميل التواصل مع الشركة مع ذِكر رقم الطلب لمتابعة الأمر.",
                },
                {
                    type: "paragraph",
                    text: "ومتى كان للعميل حق قانوني في استرداد القيمة عبر وسيلة الدفع الأصلية، فإن الشركة لا تَفرض عليه القسائم أو الرصيد التخزيني أو بطاقات الإهداء بديلاً عن ذلك. ويظل من حق العميل اختيار الرصيد التخزيني طوعاً.",
                },
            ],
        },
        {
            number: "9",
            title: "العروض الترويجية وحزم المنتجات",
            blocks: [
                {
                    type: "paragraph",
                    text: "إذا اشتُرِي المنتج ضمن عرض ترويجي أو حزمة أو عرض «اشترِ واحداً واحصل على الآخر»، تَلزم إعادة كافة منتجات العرض مجتمعةً للحصول على الاسترداد. وقد تُحتسَب القيمة الكاملة لباقي المنتجات بالسعر القياسي في حال إعادة جزء من الحزمة فقط، ويُخصَم الفرق من المبلغ المُسترَدّ عند الاقتضاء.",
                },
                {
                    type: "paragraph",
                    text: "ولا تُسترَدّ القسائم والرصيد التخزيني وأكواد الخصم المستخدَمة عند الشراء نقداً، ما لم يقتضِ القانون ذلك.",
                },
                {
                    type: "paragraph",
                    text: "وخلال مواسم التنزيلات المنظَّمة أو الحملات الترويجية المحدَّدة المدة، يجوز تقليص نافذة الاسترجاع إلى سبعة أيام تقويمية للمنتجات المؤهَّلة المغلَّفة، شريطة الإفصاح الصريح عن ذلك في صفحة المنتج المعنية وفي خطوة إتمام الدفع. ويظل حق الاسترجاع خلال أربعة عشر يوماً وفق قانون التجارة الرقمية قائماً في حالات العيب أو انتهاء الصلاحية أو الخطأ في التسليم بصرف النظر عن أي عرض ترويجي.",
                },
            ],
        },
        {
            number: "10",
            title: "رسوم التوصيل والاسترداد",
            blocks: [
                {
                    type: "paragraph",
                    text: "إذا قُبِلت عملية الاسترجاع بسبب عيب أو تلف أو انتهاء صلاحية أو خطأ في التسليم أو أي خطأ يُنسَب إلى الشركة، تُعاد رسوم التوصيل الأصلية كاملةً، وتتولى الشركة ترتيب الاستلام مجاناً.",
                },
                {
                    type: "paragraph",
                    text: "أما إذا أعاد العميل المنتج لمجرد العدول عن الشراء:",
                },
                {
                    type: "list",
                    items: [
                        "فلا تُسترَدّ رسوم التوصيل الأصلية؛",
                        "ويجوز تطبيق رسم مناولة أو استلام مرتجع، يُفصَح عنه وقت تقديم طلب الاسترجاع.",
                    ],
                },
            ],
        },
        {
            number: "11",
            title: "طلبات الاستلام من المتجر",
            blocks: [
                {
                    type: "paragraph",
                    text: "في طلبات الاستلام من المتجر، يُنصح العميل بفحص المنتجات عند الاستلام. وبعد توقيعه على إيصال الاستلام ومغادرته نقطة الاستلام، تَسري نوافذ الاسترجاع والشروط ذاتها المطبَّقة على طلبات التوصيل. ويجب الإبلاغ عن أي تلف أو انتهاء صلاحية أو خطأ في التسليم خلال المدد المحدَّدة أعلاه.",
                },
            ],
        },
        {
            number: "12",
            title: "آلية تقديم طلب الاسترجاع",
            blocks: [
                {
                    type: "paragraph",
                    text: "لبدء عملية الاسترجاع، يجوز للعميل:",
                },
                {
                    type: "list",
                    items: [
                        "تسجيل الدخول إلى حسابه، والانتقال إلى «طلباتي»، وتقديم طلب الاسترجاع من هناك؛ أو",
                        "التواصل مع فريق خدمة العملاء عبر الهاتف 5105 2112 965+، أو البريد الإلكتروني info@cwg-kwt.com؛",
                        "تقديم رقم الطلب، والمنتج المراد إعادته، وسبب الإعادة، وأي صور توضيحية مطلوبة؛",
                        "وبعد الموافقة، ترتب الشركة الاستلام، أو تُزوِّد العميل بتعليمات الإيداع.",
                    ],
                },
            ],
        },
        {
            number: "13",
            title: "حق رفض الاسترجاع",
            blocks: [
                {
                    type: "paragraph",
                    text: "عملاً بأحكام المادة (6) من اللائحة التنفيذية لقانون حماية المستهلك، يحق للشركة رفض طلب الاسترجاع أو الاسترداد في الحالات الآتية:",
                },
                {
                    type: "list",
                    items: [
                        "تقديم الطلب خارج نافذة الاسترجاع المعمول بها؛",
                        "استعمال المنتج أو فتحه أو كسر خاتمه المصنعي، باستثناء حالات العيب عند التسليم أو انتهاء الصلاحية أو الخطأ في التسليم؛",
                        "غياب العبوة الأصلية أو الملحقات أو النشرات متى كانت مُورَّدةً مع المنتج؛",
                        "عدم كفاية الأدلة المُقدَّمة لإثبات المطالبة؛",
                        "تَعارُض المطالبة مع هذه السياسة أو مع القانون الكويتي؛",
                        "ثبوت نمط متكرر من إساءة استخدام عمليات الاسترجاع أو الاحتيال.",
                    ],
                },
                {
                    type: "paragraph",
                    text: "ومتى رفضت الشركة طلب استرجاع، تُبدي السببَ كتابةً. ويظل من حق العميل تصعيد الأمر وفق ما هو مبيَّن في البند (14) أدناه.",
                },
            ],
        },
        {
            number: "14",
            title: "الشكاوى وتسوية المنازعات",
            subsections: [
                {
                    number: "14-1",
                    title: "إجراءات الشكاوى الداخلية",
                    blocks: [
                        {
                            type: "paragraph",
                            text: "في حال عدم رضا العميل عن معالجة طلب الاسترجاع أو الاسترداد، يجوز له تقديم شكوى عبر إجراءات الشكاوى الداخلية المُبيَّنة في البند (24) من الشروط والأحكام. وتُقرّ الشركة باستلام الشكاوى خلال يومَي عمل كويتيين، وتُقدِّم رداً موضوعياً خلال سبعة أيام عمل كويتية، وتسعى لتسويتها بالكامل خلال أربعة عشر يوم عمل كويتية.",
                        },
                    ],
                },
                {
                    number: "14-2",
                    title: "التصعيد الخارجي",
                    blocks: [
                        {
                            type: "paragraph",
                            text: "في حال عدم رضا العميل عن نتيجة المعالجة الداخلية، يجوز له تصعيد الأمر إلى:",
                        },
                        {
                            type: "list",
                            items: [
                                "الخط الساخن لحماية المستهلك التابع لوزارة التجارة والصناعة (135)؛",
                                "اللجنة الوطنية لحماية المستهلك؛",
                                "لجنة فض منازعات التجارة الرقمية المنشأة بموجب قانون التجارة الرقمية؛",
                                "المحاكم المختصة في دولة الكويت.",
                            ],
                        },
                    ],
                },
            ],
        },
        {
            number: "15",
            title: "اللغة والتفسير",
            blocks: [
                {
                    type: "paragraph",
                    text: "صدرت هذه السياسة باللغتين العربية والإنجليزية. وتُعد النسخة العربية هي المُعتمدة قانوناً لأغراض التطبيق أمام المحاكم الكويتية أو الجهات التنظيمية أو لجان فض المنازعات. أما النسخة الإنجليزية، فقد قُدِّمت ترجمةً مجاملةً لتيسير الفهم. وفي حال وجود أي تعارض أو اختلاف بين النسختين، تكون النسخة العربية هي المرجع المُلزِم.",
                },
               
            ],
        },
    ],
};

export const refundContent: LocalizedLegalContent = { en, ar };
