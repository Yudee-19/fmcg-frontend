import Skeleton from '@/components/ui/Skeleton';

export default function ProductDetailLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-10">
      {/* Breadcrumb */}
      <Skeleton className="h-4 w-60" />

      {/* Main section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Gallery skeleton */}
        <div>
          <Skeleton className="aspect-square rounded-xl" />
          <div className="flex gap-2 mt-3">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="w-16 h-16 rounded-lg" />
            ))}
          </div>
        </div>

        {/* Details skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-24 w-full" />
          <div className="flex gap-3">
            <Skeleton className="h-12 flex-1 rounded-lg" />
            <Skeleton className="h-12 flex-1 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Reviews skeleton */}
      <Skeleton className="h-6 w-40" />
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }, (_, i) => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
