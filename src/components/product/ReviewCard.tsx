import type { Review } from '@/types';
import StarRating from '@/components/ui/StarRating';
import { formatDate } from '@/lib/utils';

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="bg-bg-card rounded-lg border border-border p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center">
            <span className="text-primary font-semibold text-sm">
              {review.reviewerName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary">
              {review.reviewerName}
            </p>
            <p className="text-xs text-text-muted">
              {formatDate(review.createdAt)}
            </p>
          </div>
        </div>
        <StarRating rating={review.rating} size="sm" />
      </div>
      <p className="mt-3 text-sm text-text-secondary leading-relaxed">
        {review.comment}
      </p>
    </div>
  );
}
