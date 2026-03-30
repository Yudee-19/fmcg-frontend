import Skeleton from '@/components/ui/Skeleton';

export default function HomeLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Hero skeleton */}
      <Skeleton className="h-64 w-full rounded-xl" />
      {/* Category strip */}
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <Skeleton className="w-16 h-16 rounded-full" />
            <Skeleton className="h-3 w-14" />
          </div>
        ))}
      </div>
      {/* Product grid skeleton */}
      <div>
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
