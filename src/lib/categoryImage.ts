// Maps category English names (lowercase) to their image file slugs in /public/category/
const CATEGORY_IMAGE_MAP: Record<string, string> = {
    "baby care": "baby-care",
    "bath and body": "bath-and-body",
    "dishwash": "dishwash",
    "hair care": "haircare",
    "health and wellness": "health-and-wellness",
    "home and hardware": "home-and-hardware",
    "home care": "homecare",
    "household": "household",
    "laundry care": "laundry-care",
    "personal care": "personal-care",
};

export function getCategoryImage(enName: string): string {
    const key = enName.toLowerCase().trim();
    const slug = CATEGORY_IMAGE_MAP[key];
    return slug ? `/category/${slug}.png` : "/category/default.png";
}
