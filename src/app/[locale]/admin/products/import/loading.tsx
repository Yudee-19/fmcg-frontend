import Skeleton from '@/components/ui/Skeleton';

export default function ImportProductsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
      <Skeleton className="h-4 w-56" />
      <Skeleton className="h-8 w-72" />
      <Skeleton className="h-4 w-full max-w-2xl" />
      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <Skeleton className="h-[28rem] rounded-[28px]" />
        <Skeleton className="h-[28rem] rounded-[28px]" />
      </div>
    </div>
  );
}