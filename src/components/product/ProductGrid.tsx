import type { Product } from "@/types";
import ProductCard from "./ProductCard";

interface ProductGridProps {
    products: Product[];
    variant?: "trending" | "new-arrival";
}

export default function ProductGrid({
    products,
    variant = "trending",
}: ProductGridProps) {
    return (
        <div className="grid mx-auto grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
                <ProductCard
                    key={product.id}
                    product={product}
                    variant={variant}
                />
            ))}
        </div>
    );
}
