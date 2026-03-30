import ProductCardSkeleton from '@/components/product/ProductCardSkeleton';
import Skeleton from '@/components/ui/Skeleton';

export default function CategoryLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Breadcrumb skeleton */}
      <Skeleton className="h-4 w-52" />

      {/* Heading skeleton */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-28" />
      </div>

      {/* Product grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }, (_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
