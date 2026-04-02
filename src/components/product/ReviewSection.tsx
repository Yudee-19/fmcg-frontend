import { getTranslations } from 'next-intl/server';
import { getProductReviews } from '@/lib/api';
import type { Review } from '@/types';
import StarRating from '@/components/ui/StarRating';
import RatingBar from './RatingBar';
import ReviewCard from './ReviewCard';

interface ReviewSectionProps {
  productId: string;
  rating: number;
  reviewCount: number;
}

export default async function ReviewSection({
  productId,
  rating,
  reviewCount,
}: ReviewSectionProps) {
  const t = await getTranslations('product');

  let reviews: Review[] = [];
  let distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  try {
    const res = await getProductReviews(productId, { limit: 5 });
    const reviewData = res.data;
    reviews = reviewData?.reviews ?? [];
    if (reviewData?.stats?.ratingDistribution) {
      distribution = reviewData.stats.ratingDistribution;
    }
  } catch {
    // Reviews failed to load
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-text-primary">
          {t('rating_title')}
        </h2>
        {reviews.length > 0 && (
          <span className="text-sm text-primary font-medium cursor-pointer hover:underline">
            {t('write_review')}
          </span>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Aggregate */}
        <div className="shrink-0 text-center md:text-left">
          <div className="text-5xl font-bold text-text-primary">{rating.toFixed(1)}</div>
          <div className="text-text-muted text-sm">/5</div>
          <StarRating rating={rating} size="md" className="justify-center md:justify-start mt-1" />
          <p className="text-sm text-text-muted mt-1">
            ({t('reviews', { count: reviewCount })})
          </p>
        </div>

        {/* Distribution */}
        <div className="flex-1 space-y-1.5">
          {[5, 4, 3, 2, 1].map((stars) => (
            <RatingBar
              key={stars}
              stars={stars}
              count={distribution[stars as keyof typeof distribution]}
              total={reviewCount}
            />
          ))}
        </div>
      </div>

      {/* Review cards */}
      {reviews.length > 0 && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </section>
  );
}
