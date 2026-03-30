import Skeleton from '@/components/ui/Skeleton';

export default function ProductCardSkeleton() {
  return (
    <div className="bg-bg-card rounded-xl border border-border overflow-hidden">
      <Skeleton className="aspect-square rounded-none" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-8 w-full rounded-md" />
      </div>
    </div>
  );
}
