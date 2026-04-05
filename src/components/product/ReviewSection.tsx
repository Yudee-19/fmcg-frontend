import { getTranslations } from 'next-intl/server';
import { getCachedProductReviews } from '@/services/productService.cached';
import type { Review } from '@/types';
import StarRating from '@/components/ui/StarRating';
import RatingBar from './RatingBar';
import ReviewCard from './ReviewCard';
import WriteReviewForm from './WriteReviewForm';

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
    const res = await getCachedProductReviews(productId, { limit: 100 });
    const allReviews: Review[] = Array.isArray(res.data) ? res.data : (res.data as any)?.reviews ?? [];
    reviews = allReviews.slice(0, 5);

    // Compute distribution from all fetched reviews
    for (const review of allReviews) {
      const r = review.rating as keyof typeof distribution;
      if (r >= 1 && r <= 5) {
        distribution[r]++;
      }
    }
  } catch {
    // Reviews failed to load
  }

  return (
    <section>
      <h2 className="text-xl font-semibold text-text-primary mb-6">
        {t('rating_title')}
      </h2>

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

        {/* Write Review Form */}
        <div className="shrink-0 md:w-72">
          <WriteReviewForm productId={productId} />
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
