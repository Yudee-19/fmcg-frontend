import Skeleton from "@/components/ui/Skeleton";

export default function LegalPageSkeleton() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-6">
            <Skeleton className="h-4 w-48 mb-6" />
            <div className="bg-bg-card rounded-xl border border-border p-6 sm:p-10 space-y-8">
                <div className="space-y-2 border-b border-border pb-6">
                    <Skeleton className="h-8 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-1/3" />
                </div>
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="space-y-3">
                        <Skeleton className="h-6 w-1/3" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </div>
                ))}
            </div>
        </div>
    );
}
