import Skeleton from '@/components/ui/Skeleton';

export default function AdminOrdersLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-6">
      <Skeleton className="h-4 w-36" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full max-w-2xl" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-28 rounded-2xl" />
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-white p-4">
        <div className="space-y-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-40 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}