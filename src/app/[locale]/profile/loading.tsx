import Skeleton from '@/components/ui/Skeleton';

export default function ProfileLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-8 w-40" />

      {/* Personal info card */}
      <div className="bg-bg-card rounded-xl border border-border p-6 space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-48" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-40" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-56" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-36" />
          </div>
        </div>
      </div>

      {/* Addresses card */}
      <div className="bg-bg-card rounded-xl border border-border p-6 space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-20 w-full rounded-lg" />
      </div>
    </div>
  );
}
