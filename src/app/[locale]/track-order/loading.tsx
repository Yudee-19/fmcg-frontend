import Skeleton from '@/components/ui/Skeleton';

export default function TrackOrderLoading() {
  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-4">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-8 w-56" />
      <div className="bg-bg-card rounded-xl border border-border p-6 space-y-4">
        <Skeleton className="h-5 w-64" />
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </div>
  );
}
