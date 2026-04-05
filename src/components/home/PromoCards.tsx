import Link from "next/link";
import Image from "next/image";

const PROMOS = [
    {
        tag: "Personal Care",
        titleBefore: "Everyday",
        highlight: "Essentials",
        titleAfter: "Delivered Daily",
        image: "/category/personal-care.png",
        href: "/category/groceries",
    },
    {
        tag: "Baby Care",
        titleBefore: "Gentle Care for Your",
        highlight: "Little Ones",
        titleAfter: "for Smarter Living",
        image: "/category/baby-care.png",
        href: "/category/baby-care",
    },
    {
        tag: "Home Care",
        titleBefore: "Top Deals on",
        highlight: "Home Care",
        titleAfter: "Products",
        image: "/category/homecare.png",
        href: "/category/home-care",
    },
];

export default function PromoCards() {
    return (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PROMOS.map((promo) => (
                <Link
                    key={promo.highlight}
                    href={promo.href}
                    className="group relative bg-rose-50 rounded-2xl p-6 pb-8 overflow-hidden flex flex-col justify-between min-h-[220px] hover:shadow-lg transition-shadow"
                >
                    {/* Tag */}
                    <span className="inline-block self-start text-xs font-medium text-primary bg-white/80 border border-primary/20 rounded-full px-3 py-1 mb-3">
                        {promo.tag}
                    </span>

                    {/* Title */}
                    <h3 className="text-xl md:text-lg lg:text-xl font-bold text-text-primary leading-snug z-10 max-w-[60%]">
                        {promo.titleBefore}{" "}
                        <em className="text-primary not-italic font-extrabold italic">
                            {promo.highlight}
                        </em>
                        {promo.titleAfter && (
                            <>
                                <br />
                                {promo.titleAfter}
                            </>
                        )}
                    </h3>

                    {/* Shop Now button */}
                    <div className="mt-4 z-10">
                        <span className="inline-flex items-center gap-1 bg-primary text-white text-xs font-semibold px-4 py-2 rounded-md group-hover:bg-primary-hover transition-colors">
                            Shop Now
                            <span className="text-sm">→</span>
                        </span>
                    </div>

                    {/* Product image */}
                    <div className="absolute right-0 bottom-0 w-[45%] h-full flex items-end justify-end">
                        <Image
                            src={promo.image}
                            alt={promo.highlight}
                            width={200}
                            height={200}
                            className="object-contain object-right-bottom w-full h-auto max-h-[90%]"
                        />
                    </div>
                </Link>
            ))}
        </section>
    );
}
