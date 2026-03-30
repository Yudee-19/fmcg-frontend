import Skeleton from '@/components/ui/Skeleton';

export default function LoginLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-bg-card rounded-xl border border-border p-8 space-y-4">
        <Skeleton className="h-8 w-24 mx-auto" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-4 w-32 ml-auto" />
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-4 w-48 mx-auto" />
      </div>
    </div>
  );
}
