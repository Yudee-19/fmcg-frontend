import Skeleton from '@/components/ui/Skeleton';

export default function OrderDetailLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-8 w-56" />

      {/* Order info card */}
      <div className="bg-bg-card rounded-xl border border-border p-6 space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <Skeleton className="h-4 w-36" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>

      {/* Order items */}
      <div className="bg-bg-card rounded-xl border border-border p-6 space-y-4">
        <Skeleton className="h-5 w-32" />
        {Array.from({ length: 2 }, (_, i) => (
          <div key={i} className="flex gap-4 items-center py-3">
            <Skeleton className="h-16 w-16 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-5 w-20" />
          </div>
        ))}
      </div>

      {/* Shipping address */}
      <div className="bg-bg-card rounded-xl border border-border p-6 space-y-3">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
    </div>
  );
}
