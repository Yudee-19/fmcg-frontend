import Skeleton from '@/components/ui/Skeleton';

export default function AdminSupportLoading() {
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

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <div className="space-y-4 rounded-3xl border border-border bg-white p-4">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-32 rounded-2xl" />
          ))}
        </div>
        <div className="space-y-4 rounded-3xl border border-border bg-white p-5">
          <Skeleton className="h-24 rounded-2xl" />
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-24 rounded-2xl" />
          ))}
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}