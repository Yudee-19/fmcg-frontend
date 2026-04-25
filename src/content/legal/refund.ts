import type { LegalContent, LocalizedLegalContent } from "./types";

const en: LegalContent = {
    title: "Return & Refund Policy",
    subtitle: "Crown Worldwide Group Co for Wholesale and Retail Trade",
    tagline: "Grocery Retail & E-commerce – Kuwait",
    sections: [
        {
            title: "Return & Refund Policy Overview",
            blocks: [
                {
                    type: "paragraph",
                    text: "At Crown Worldwide Group Co for Wholesale and Retail Trade, we understand that when customers purchase grocery products—especially online—they expect freshness, quality, and reliability. Because grocery items are often perishable and sensitive to storage conditions, our return and refund policy is designed to balance customer satisfaction with food safety standards and regulatory requirements in Kuwait.",
                },
                {
                    type: "paragraph",
                    text: "This policy explains in detail how returns, refunds, replacements, and cancellations are handled for all orders placed through our platform, whether for home delivery or store pickup.",
                },
            ],
        },
        {
            title: "Fresh & Perishable Grocery Items",
            blocks: [
                {
                    type: "paragraph",
                    text: "Due to the nature of grocery retail, most items sold through our platform fall under perishable or consumable categories, including fresh fruits, vegetables, dairy products, frozen foods, meat, and ready-to-eat items. These products are highly sensitive to temperature, handling, and storage conditions after delivery or pickup.",
                },
                {
                    type: "paragraph",
                    text: "For this reason, once such items are delivered or collected, they are generally not eligible for return or refund unless there is a clear issue at the time of delivery. This includes situations where the product is:",
                },
                {
                    type: "list",
                    items: [
                        "Delivered in a damaged condition",
                        "Found to be spoiled upon arrival",
                        "Incorrectly supplied compared to the order",
                        "Expired or close to expiry in a way that makes it unusable",
                    ],
                },
                {
                    type: "paragraph",
                    text: "Customers are expected to inspect their order immediately upon delivery or pickup. If any issue is noticed, it must be reported within 24 hours, as delays make it impossible to verify whether the issue occurred before or after delivery.",
                },
            ],
        },
        {
            title: "Non-Perishable Grocery Products",
            blocks: [
                {
                    type: "paragraph",
                    text: "For non-perishable grocery items such as packaged foods, beverages, pantry items, and household consumables, we offer a slightly broader return window. However, these products must remain unused, unopened, and in their original condition.",
                },
                {
                    type: "paragraph",
                    text: "If a customer wishes to request a return for such items, the request must be made within 7 days of receiving the order, and the product must be in a resaleable condition. Any product that has been opened, tampered with, or partially consumed will not be eligible for return due to safety and hygiene standards.",
                },
            ],
        },
        {
            title: "Damaged, Defective, or Incorrect Orders",
            blocks: [
                {
                    type: "paragraph",
                    text: "We take product quality very seriously, and every effort is made to ensure that orders are packed and delivered in proper condition. However, in rare cases where an issue occurs, customers are entitled to request a replacement or refund.",
                },
                {
                    type: "paragraph",
                    text: "If you receive an item that is damaged, defective, or incorrect, you must notify our customer support team as soon as possible with clear details of the issue. In most cases, we may request supporting evidence such as photographs to verify the condition of the product.",
                },
                {
                    type: "paragraph",
                    text: "Once verified, we will offer one of the following solutions based on availability and your preference:",
                },
                {
                    type: "list",
                    items: [
                        "Replacement of the same item",
                        "Replacement with a similar item (if agreed)",
                        "Full or partial refund",
                    ],
                },
                {
                    type: "paragraph",
                    text: "All such claims are subject to internal quality checks before approval.",
                },
            ],
        },
        {
            title: "Order Cancellations",
            blocks: [
                {
                    type: "paragraph",
                    text: "Customers may cancel their orders before dispatch without any penalty. Once the order has been processed or dispatched for delivery, cancellation may not be possible.",
                },
                {
                    type: "paragraph",
                    text: "For Cash on Delivery (COD) orders, repeated cancellations or refusal to accept deliveries may result in restrictions on future orders. For prepaid orders, refunds for cancellations will be processed to the original payment method within the standard refund timeline.",
                },
            ],
        },
        {
            title: "Refund Processing",
            blocks: [
                {
                    type: "paragraph",
                    text: "Refunds are processed only after the returned items are received (if applicable) and inspected by our team. The time required to complete a refund depends on the payment method used at checkout.",
                },
                {
                    type: "paragraph",
                    text: "For online payments, refunds are typically processed within 5 to 10 business days, depending on the banking system and payment provider. In some cases, it may take longer for the refund to reflect in your account due to bank processing cycles.",
                },
                {
                    type: "paragraph",
                    text: "For Cash on Delivery orders, refunds may be issued as store credit, wallet balance, or bank transfer, depending on what is available and agreed upon.",
                },
                {
                    type: "paragraph",
                    text: "If a product was purchased as part of a promotional offer, such as bundle deals or “buy one get one” offers, all items included in the promotion must be returned together to qualify for a refund.",
                },
            ],
        },
        {
            title: "Delivery Charges & Refunds",
            blocks: [
                {
                    type: "paragraph",
                    text: "Delivery fees are treated separately from product costs. If a return is approved due to a product defect, damage, or error on our part, the delivery fee may also be refunded.",
                },
                {
                    type: "paragraph",
                    text: "However, if a customer chooses to return a product due to a change of mind, dissatisfaction without a valid issue, or personal preference, delivery charges will typically not be refunded, and additional return handling charges may apply.",
                },
            ],
        },
        {
            title: "Pickup Orders (Store Collection)",
            blocks: [
                {
                    type: "paragraph",
                    text: "For orders collected directly from our store, customers are expected to inspect all items at the time of pickup. Once the order is handed over and accepted, the same return conditions apply as delivery orders.",
                },
                {
                    type: "paragraph",
                    text: "Any issues with fresh or perishable items must be reported immediately at the store or within the allowed reporting timeframe. Claims made after this period may not be accepted.",
                },
            ],
        },
        {
            title: "Quality Responsibility After Delivery",
            blocks: [
                {
                    type: "paragraph",
                    text: "Once a grocery order has been successfully delivered or collected, responsibility for proper storage shifts to the customer. This includes maintaining appropriate temperature conditions for chilled or frozen items and handling food products according to safety guidelines.",
                },
                {
                    type: "paragraph",
                    text: "We are not responsible for product spoilage, damage, or deterioration that occurs due to improper storage, delayed consumption, or environmental exposure after delivery.",
                },
            ],
        },
        {
            title: "Right to Refuse Returns",
            blocks: [
                {
                    type: "paragraph",
                    text: "We reserve the right to refuse any return or refund request if:",
                },
                {
                    type: "list",
                    items: [
                        "The request is made outside the allowed timeframe",
                        "The product has been used, opened, or altered",
                        "There is insufficient proof of issue",
                        "The claim is inconsistent with our policy",
                        "The request is suspected to be fraudulent or abusive",
                    ],
                },
                {
                    type: "paragraph",
                    text: "Repeated misuse of the return policy, especially in COD orders, may lead to account restrictions or permanent suspension.",
                },
            ],
        },
        {
            title: "Customer Support",
            blocks: [
                {
                    type: "paragraph",
                    text: "We aim to resolve all concerns quickly and fairly. If you need to request a return, report an issue, or inquire about a refund, you can contact our customer support team through the contact details provided on our website.",
                },
                {
                    type: "paragraph",
                    text: "Our team will review your request, guide you through the process, and ensure that your concern is handled in accordance with this policy.",
                },
            ],
        },
    ],
};

const ar: LegalContent = {
    title: "سياسة الإرجاع والاسترداد",
    subtitle: "شركة كراون العالمية للتجارة بالجملة والتجزئة",
    tagline: "بقالة وتجارة إلكترونية وتجزئة – الكويت",
    sections: [
        {
            title: "نظرة عامة على سياسة الإرجاع والاسترداد",
            blocks: [
                {
                    type: "paragraph",
                    text: "في شركة كراون العالمية للتجارة بالجملة والتجزئة، نحن ندرك أنه عندما يقوم العملاء بشراء منتجات البقالة — وخاصةً عبر الإنترنت — فإنهم يتوقعون النضارة والجودة والموثوقية. ونظراً لأن مواد البقالة قابلة للتلف وحساسة لظروف التخزين، فإن سياسة الإرجاع والاسترداد لدينا مصممة للموازنة بين رضا العميل ومعايير سلامة الأغذية والمتطلبات التنظيمية في الكويت.",
                },
                {
                    type: "paragraph",
                    text: "توضح هذه السياسة بالتفصيل كيفية التعامل مع عمليات الإرجاع والاسترداد والاستبدال والإلغاء لجميع الطلبات المقدمة عبر منصتنا، سواء للتوصيل إلى المنزل أو للاستلام من المتجر.",
                },
            ],
        },
        {
            title: "المنتجات الطازجة والقابلة للتلف",
            blocks: [
                {
                    type: "paragraph",
                    text: "نظراً لطبيعة بيع البقالة بالتجزئة، فإن معظم المنتجات المباعة عبر منصتنا تندرج ضمن الفئات القابلة للتلف أو الاستهلاك، بما في ذلك الفواكه والخضروات الطازجة ومنتجات الألبان والأطعمة المجمدة واللحوم والوجبات الجاهزة. وتعد هذه المنتجات حساسة جداً لدرجة الحرارة والتعامل وظروف التخزين بعد التسليم أو الاستلام.",
                },
                {
                    type: "paragraph",
                    text: "ولهذا السبب، بمجرد تسليم هذه المنتجات أو استلامها، فإنها لا تكون مؤهلة عموماً للإرجاع أو الاسترداد إلا في حال وجود مشكلة واضحة عند التسليم. ويشمل ذلك الحالات التي يكون فيها المنتج:",
                },
                {
                    type: "list",
                    items: [
                        "تم تسليمه في حالة تالفة",
                        "وُجد فاسداً عند الوصول",
                        "تم توريده بشكل خاطئ مقارنة بالطلب",
                        "منتهي الصلاحية أو قارب على انتهائها بشكل يجعله غير صالح للاستخدام",
                    ],
                },
                {
                    type: "paragraph",
                    text: "يتوقع من العملاء فحص طلباتهم فوراً عند التسليم أو الاستلام. وفي حال ملاحظة أي مشكلة، يجب الإبلاغ عنها خلال ٢٤ ساعة، حيث أن التأخير يجعل من المستحيل التحقق مما إذا كانت المشكلة قد حدثت قبل التسليم أو بعده.",
                },
            ],
        },
        {
            title: "المنتجات غير القابلة للتلف",
            blocks: [
                {
                    type: "paragraph",
                    text: "بالنسبة لمنتجات البقالة غير القابلة للتلف مثل الأطعمة المعبأة والمشروبات والمواد الجافة والمستلزمات المنزلية، نقدم نافذة إرجاع أوسع قليلاً. ومع ذلك، يجب أن تظل هذه المنتجات غير مستخدمة وغير مفتوحة وفي حالتها الأصلية.",
                },
                {
                    type: "paragraph",
                    text: "إذا رغب العميل في طلب إرجاع لمثل هذه المنتجات، فيجب تقديم الطلب خلال ٧ أيام من استلام الطلب، ويجب أن يكون المنتج في حالة صالحة لإعادة البيع. أما المنتجات التي تم فتحها أو العبث بها أو استهلاكها جزئياً فلن تكون مؤهلة للإرجاع وفقاً لمعايير السلامة والنظافة.",
                },
            ],
        },
        {
            title: "الطلبات التالفة أو المعيبة أو غير الصحيحة",
            blocks: [
                {
                    type: "paragraph",
                    text: "نحن نأخذ جودة المنتجات على محمل الجد، ونبذل قصارى جهدنا لضمان تعبئة الطلبات وتسليمها في حالة سليمة. ومع ذلك، في الحالات النادرة التي تحدث فيها مشكلة، يحق للعملاء طلب الاستبدال أو استرداد المبلغ.",
                },
                {
                    type: "paragraph",
                    text: "إذا استلمت منتجاً تالفاً أو معيباً أو غير صحيح، فيجب عليك إخطار فريق دعم العملاء لدينا في أقرب وقت ممكن مع تقديم تفاصيل واضحة عن المشكلة. وفي معظم الحالات، قد نطلب أدلة داعمة مثل الصور للتحقق من حالة المنتج.",
                },
                {
                    type: "paragraph",
                    text: "بمجرد التحقق، سنقدم أحد الحلول التالية بناءً على التوفر وتفضيلك:",
                },
                {
                    type: "list",
                    items: [
                        "استبدال نفس المنتج",
                        "استبدال بمنتج مماثل (إذا تم الاتفاق على ذلك)",
                        "استرداد المبلغ كاملاً أو جزئياً",
                    ],
                },
                {
                    type: "paragraph",
                    text: "تخضع جميع هذه المطالبات لفحوصات الجودة الداخلية قبل الموافقة عليها.",
                },
            ],
        },
        {
            title: "إلغاء الطلبات",
            blocks: [
                {
                    type: "paragraph",
                    text: "يحق للعملاء إلغاء طلباتهم قبل الإرسال دون أي غرامات. وبمجرد معالجة الطلب أو إرساله للتوصيل، قد لا يكون الإلغاء ممكناً.",
                },
                {
                    type: "paragraph",
                    text: "بالنسبة لطلبات الدفع عند الاستلام، قد يؤدي تكرار الإلغاءات أو رفض استلام الطلبات إلى فرض قيود على الطلبات المستقبلية. أما بالنسبة للطلبات المدفوعة مسبقاً، فستتم معالجة استرداد المبالغ للإلغاءات إلى طريقة الدفع الأصلية ضمن الجدول الزمني القياسي للاسترداد.",
                },
            ],
        },
        {
            title: "معالجة الاسترداد",
            blocks: [
                {
                    type: "paragraph",
                    text: "تتم معالجة عمليات الاسترداد فقط بعد استلام المنتجات المرتجعة (إن وجدت) وفحصها من قبل فريقنا. ويعتمد الوقت اللازم لإكمال الاسترداد على طريقة الدفع المستخدمة عند إتمام الشراء.",
                },
                {
                    type: "paragraph",
                    text: "بالنسبة للمدفوعات الإلكترونية، تتم معالجة عمليات الاسترداد عادةً خلال ٥ إلى ١٠ أيام عمل، اعتماداً على النظام المصرفي ومزود خدمة الدفع. وفي بعض الحالات، قد يستغرق الأمر وقتاً أطول حتى يظهر المبلغ في حسابك بسبب دورات المعالجة المصرفية.",
                },
                {
                    type: "paragraph",
                    text: "بالنسبة لطلبات الدفع عند الاستلام، قد يتم إصدار المبالغ المستردة كرصيد متجر أو رصيد محفظة أو تحويل بنكي، حسب ما هو متاح ومتفق عليه.",
                },
                {
                    type: "paragraph",
                    text: "إذا تم شراء منتج كجزء من عرض ترويجي، مثل عروض الباقات أو عروض «اشتر واحدة واحصل على الأخرى»، فيجب إرجاع جميع المنتجات المشمولة في العرض معاً للتأهل لاسترداد المبلغ.",
                },
            ],
        },
        {
            title: "رسوم التوصيل والاسترداد",
            blocks: [
                {
                    type: "paragraph",
                    text: "تُعامل رسوم التوصيل بشكل منفصل عن تكاليف المنتجات. وفي حال الموافقة على الإرجاع بسبب عيب في المنتج أو تلفه أو خطأ من جانبنا، فقد يتم استرداد رسوم التوصيل أيضاً.",
                },
                {
                    type: "paragraph",
                    text: "ومع ذلك، إذا اختار العميل إرجاع منتج بسبب تغيير الرأي أو عدم الرضا دون وجود مشكلة فعلية أو لأسباب شخصية، فلن يتم عادةً استرداد رسوم التوصيل، وقد يتم تطبيق رسوم إضافية لمعالجة الإرجاع.",
                },
            ],
        },
        {
            title: "طلبات الاستلام (الاستلام من المتجر)",
            blocks: [
                {
                    type: "paragraph",
                    text: "بالنسبة للطلبات التي يتم استلامها مباشرة من متجرنا، يتوقع من العملاء فحص جميع المنتجات في وقت الاستلام. وبمجرد تسليم الطلب وقبوله، تنطبق نفس شروط الإرجاع كما هو الحال مع طلبات التوصيل.",
                },
                {
                    type: "paragraph",
                    text: "يجب الإبلاغ عن أي مشاكل في المنتجات الطازجة أو القابلة للتلف فوراً في المتجر أو خلال الإطار الزمني المسموح به للإبلاغ. والمطالبات المقدمة بعد هذه الفترة قد لا يتم قبولها.",
                },
            ],
        },
        {
            title: "مسؤولية الجودة بعد التسليم",
            blocks: [
                {
                    type: "paragraph",
                    text: "بمجرد تسليم طلب البقالة أو استلامه بنجاح، تنتقل مسؤولية التخزين السليم إلى العميل. ويشمل ذلك الحفاظ على ظروف درجة الحرارة المناسبة للمواد المبردة أو المجمدة والتعامل مع المنتجات الغذائية وفقاً لإرشادات السلامة.",
                },
                {
                    type: "paragraph",
                    text: "نحن غير مسؤولين عن تلف المنتج أو ضرره أو تدهوره الذي يحدث بسبب التخزين غير السليم أو تأخر الاستهلاك أو التعرض البيئي بعد التسليم.",
                },
            ],
        },
        {
            title: "حق رفض الإرجاع",
            blocks: [
                {
                    type: "paragraph",
                    text: "نحتفظ بالحق في رفض أي طلب إرجاع أو استرداد في الحالات التالية:",
                },
                {
                    type: "list",
                    items: [
                        "إذا قُدّم الطلب خارج الإطار الزمني المسموح به",
                        "إذا تم استخدام المنتج أو فتحه أو تعديله",
                        "إذا كانت الأدلة على المشكلة غير كافية",
                        "إذا كانت المطالبة لا تتوافق مع سياستنا",
                        "إذا اشتُبه في أن الطلب احتيالي أو ينطوي على إساءة استخدام",
                    ],
                },
                {
                    type: "paragraph",
                    text: "قد يؤدي تكرار إساءة استخدام سياسة الإرجاع، خاصةً في طلبات الدفع عند الاستلام، إلى فرض قيود على الحساب أو إيقافه بشكل دائم.",
                },
            ],
        },
        {
            title: "دعم العملاء",
            blocks: [
                {
                    type: "paragraph",
                    text: "نحن نسعى لحل جميع المخاوف بسرعة وعدالة. إذا كنت بحاجة إلى طلب إرجاع أو الإبلاغ عن مشكلة أو الاستفسار عن استرداد، يمكنك التواصل مع فريق دعم العملاء لدينا عبر بيانات الاتصال المتوفرة على موقعنا الإلكتروني.",
                },
                {
                    type: "paragraph",
                    text: "سيقوم فريقنا بمراجعة طلبك وإرشادك خلال العملية وضمان معالجة مخاوفك وفقاً لهذه السياسة.",
                },
            ],
        },
    ],
};

export const refundContent: LocalizedLegalContent = { en, ar };
