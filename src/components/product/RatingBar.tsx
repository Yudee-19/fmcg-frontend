interface RatingBarProps {
  stars: number;
  count: number;
  total: number;
}

export default function RatingBar({ stars, count, total }: RatingBarProps) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-8 text-right text-text-secondary">{stars}</span>
      <svg className="w-3.5 h-3.5 text-star shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-text-primary rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="w-8 text-text-muted">{count}</span>
    </div>
  );
}
