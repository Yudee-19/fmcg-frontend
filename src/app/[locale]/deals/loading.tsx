import ProductCardSkeleton from '@/components/product/ProductCardSkeleton';
import Skeleton from '@/components/ui/Skeleton';

export default function DealsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      {/* Breadcrumb skeleton */}
      <Skeleton className="h-4 w-32" />

      {/* Heading skeleton */}
      <Skeleton className="h-8 w-48" />

      {/* Banner skeleton */}
      <Skeleton className="h-32 md:h-40 w-full rounded-xl" />

      {/* Featured section skeleton */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-44" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }, (_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* Hot Deals section skeleton */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }, (_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
