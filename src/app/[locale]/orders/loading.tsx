import Skeleton from '@/components/ui/Skeleton';

export default function OrdersLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-8 w-48" />
      <div className="space-y-4">
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={i}
            className="bg-bg-card rounded-xl border border-border p-6 space-y-3"
          >
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-28" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
