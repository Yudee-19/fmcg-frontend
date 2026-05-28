import { getLiveBanners } from "@/services/bannerService";
import BannerCarousel from "./BannerCarousel";
import HeroBanner from "./HeroBanner";

/**
 * Server-side wrapper. Fetches live banners and renders the carousel when
 * any are PUBLISHED; otherwise falls back to the default HeroBanner so the
 * homepage is never empty.
 */
export default async function HomeBanner() {
    const banners = await getLiveBanners();

    if (banners.length === 0) {
        return <HeroBanner />;
    }

    return <BannerCarousel banners={banners} />;
}
