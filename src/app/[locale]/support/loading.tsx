import Skeleton from '@/components/ui/Skeleton';

export default function SupportLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-8 w-48" />

      {/* New ticket form skeleton */}
      <div className="bg-bg-card rounded-xl border border-border p-6 space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-full rounded-md" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <Skeleton className="h-24 w-full rounded-md" />
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>

      {/* Existing tickets skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-36" />
        {Array.from({ length: 2 }, (_, i) => (
          <div
            key={i}
            className="bg-bg-card rounded-xl border border-border p-5 space-y-2"
          >
            <div className="flex justify-between">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
