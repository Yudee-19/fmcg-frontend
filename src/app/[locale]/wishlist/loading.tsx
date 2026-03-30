import Skeleton from '@/components/ui/Skeleton';

export default function WishlistLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className="bg-bg-card rounded-xl border border-border p-4 space-y-3"
          >
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-5 w-20" />
            <div className="flex gap-2">
              <Skeleton className="h-9 flex-1 rounded-md" />
              <Skeleton className="h-9 w-9 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
