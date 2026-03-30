import Skeleton from '@/components/ui/Skeleton';

export default function CheckoutLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Title skeleton */}
      <Skeleton className="h-8 w-40" />

      {/* Shipping info card skeleton */}
      <div className="bg-bg-card rounded-xl border border-border p-6 space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>

      {/* Payment method card skeleton */}
      <div className="bg-bg-card rounded-xl border border-border p-6 space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Order summary card skeleton */}
      <div className="bg-bg-card rounded-xl border border-border p-6 space-y-4">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <div className="border-t border-border pt-4">
          <Skeleton className="h-6 w-32" />
        </div>
      </div>

      {/* Button skeleton */}
      <Skeleton className="h-12 w-full rounded-lg" />
    </div>
  );
}
