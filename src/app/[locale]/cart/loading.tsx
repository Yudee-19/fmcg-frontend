import Skeleton from '@/components/ui/Skeleton';

export default function CartLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Skeleton className="h-4 w-40 mb-4" />
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="lg:grid lg:grid-cols-3 lg:gap-8">
        <div className="lg:col-span-2 space-y-4">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
        <div>
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
