import Skeleton from '@/components/ui/Skeleton';

export default function AdminProductsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
      <Skeleton className="h-4 w-36" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full max-w-2xl" />
      </div>

      <div className="rounded-2xl border border-border bg-white p-5">
        <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr_auto_auto]">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-11 w-full rounded-xl" />
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white p-4">
        <div className="space-y-4">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className="grid gap-4 border-b border-border pb-4 last:border-b-0 last:pb-0 lg:grid-cols-[minmax(0,2.3fr)_1fr_1fr_0.7fr_0.7fr_0.8fr]"
            >
              {Array.from({ length: 6 }, (_, cellIndex) => (
                <Skeleton key={cellIndex} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}