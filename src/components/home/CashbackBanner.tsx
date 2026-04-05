import { getTranslations } from "next-intl/server";
import Image from "next/image";

export default async function CashbackBanner() {
    const t = await getTranslations("home");

    return (
        // 1. Added mt-20 to give the overflowing head room to breathe without hitting elements above it
        <section className="relative bg-gray-50 rounded-2xl overflow-visible max-h-150 mt-25">
            {/* Topographic pattern background */}

            <div className="relative flex flex-col md:flex-row items-center justify-between px-8 md:px-16 py-12 md:py-16">
                {/* Left content */}
                {/* Added md:w-2/3 to ensure the text doesn't flow underneath the absolutely positioned image */}
                <div className="flex-1 z-10 w-full md:w-2/3 lg:max-w-2xl">
                    <h2 className="text-3xl md:text-4xl lg:text-[2.75rem] font-extrabold text-text-primary leading-tight">
                        {t("cashback_heading_before")}{" "}
                        <span className="text-primary">
                            {t("cashback_highlight")}
                        </span>{" "}
                        {t("cashback_heading_after")}
                    </h2>

                    {/* Email input */}
                    <div className="mt-8 flex max-w-md w-full">
                        <div className="flex w-full rounded-full border border-gray-300 bg-white overflow-hidden pl-5 pr-1.5 py-1.5">
                            <input
                                type="email"
                                placeholder={t("cashback_email_placeholder")}
                                className="flex-1 text-sm text-gray-500 outline-none bg-transparent min-w-0"
                            />
                            <button className="bg-primary hover:bg-primary-hover text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-colors whitespace-nowrap">
                                {t("cashback_cta")}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right image */}
                {/* 2. Changed to 'absolute bottom-0 right-0' to pin the image to the bottom edge */}
                <div className="absolute bottom-0 right-0 md:right-8 lg:right-16 z-20 pointer-events-none">
                    <Image
                        src="/images/footer-worker.png"
                        alt="Delivery person"
                        width={400}
                        height={500}
                        // 3. Removed max-h caps, added h-auto and object-bottom to scale smoothly while staying anchored
                        className="w-[180px] md:w-[280px] lg:w-[320px] h-auto object-bottom drop-shadow-xl"
                        priority={true}
                    />
                </div>
            </div>
        </section>
    );
}
