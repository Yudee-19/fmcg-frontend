import Skeleton from '@/components/ui/Skeleton';

export default function OrderSuccessLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="bg-bg-card rounded-xl border border-border p-8 text-center space-y-4">
        <Skeleton className="h-16 w-16 rounded-full mx-auto" />
        <Skeleton className="h-8 w-64 mx-auto" />
        <Skeleton className="h-5 w-80 mx-auto" />
        <Skeleton className="h-6 w-48 mx-auto" />
        <div className="flex gap-4 justify-center pt-4">
          <Skeleton className="h-10 w-40 rounded-md" />
          <Skeleton className="h-10 w-40 rounded-md" />
        </div>
      </div>
    </div>
  );
}
