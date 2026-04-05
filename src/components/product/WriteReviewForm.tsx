'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/store/authStore';
import { createReview } from '@/services/reviewService';
import { cn } from '@/lib/utils';
import { Link } from '@/i18n/navigation';
import Button from '@/components/ui/Button';

interface WriteReviewFormProps {
    productId: string;
}

export default function WriteReviewForm({ productId }: WriteReviewFormProps) {
    const t = useTranslations('product');
    const tAuth = useTranslations('auth');

    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    const [open, setOpen] = useState(false);
    const [rating, setRating] = useState(0);
    const [hoveredStar, setHoveredStar] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const contentRef = useRef<HTMLDivElement>(null);
    const [contentHeight, setContentHeight] = useState(0);

    useEffect(() => {
        if (open && contentRef.current) {
            setContentHeight(contentRef.current.scrollHeight);
        }
    }, [open, error, success]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0 || !comment.trim()) return;

        setLoading(true);
        setError('');

        try {
            await createReview(productId, rating, comment.trim());
            setSuccess(true);
            setComment('');
            setRating(0);
            setTimeout(() => {
                setOpen(false);
                setSuccess(false);
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Failed to submit review');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setOpen(false);
        setError('');
        setRating(0);
        setComment('');
    };

    return (
        <div className="bg-gray-50 rounded-xl border border-border overflow-hidden transition-all duration-300 ease-in-out">
            {/* Header - always visible, acts as toggle */}
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
            >
                <span className="text-sm font-semibold text-text-primary">
                    {t('write_review')}
                </span>
                <svg
                    className={cn(
                        'w-4 h-4 text-text-muted transition-transform duration-300',
                        open && 'rotate-180',
                    )}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </button>

            {/* Collapsible content */}
            <div
                className="transition-all duration-300 ease-in-out overflow-hidden"
                style={{ maxHeight: open ? `${contentHeight + 20}px` : '0px' }}
            >
                <div ref={contentRef} className="px-4 pb-4 space-y-4">
                    {/* Login prompt for unauthenticated users */}
                    {!isAuthenticated ? (
                        <div className="text-center py-2">
                            <p className="text-sm text-text-secondary mb-2">
                                {t('review_login_required')}
                            </p>
                            <Link
                                href="/auth/login"
                                className="text-sm text-primary font-medium hover:underline"
                            >
                                {tAuth('login')}
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {success && (
                                <div className="p-3 rounded-lg bg-green-50 text-green-700 text-sm">
                                    {t('review_success')}
                                </div>
                            )}

                            {error && (
                                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Star rating picker */}
                            <div>
                                <p className="text-xs text-text-muted mb-1.5">
                                    {t('review_select_rating')}
                                </p>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => {
                                        const active =
                                            star <= (hoveredStar || rating);
                                        return (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setRating(star)}
                                                onMouseEnter={() =>
                                                    setHoveredStar(star)
                                                }
                                                onMouseLeave={() =>
                                                    setHoveredStar(0)
                                                }
                                                className="p-0.5 transition-transform hover:scale-110"
                                            >
                                                <svg
                                                    className={cn(
                                                        'w-6 h-6 transition-colors',
                                                        active
                                                            ? 'text-star fill-star'
                                                            : 'text-gray-300 fill-gray-300',
                                                    )}
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Comment */}
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder={t('review_placeholder')}
                                rows={3}
                                maxLength={1000}
                                required
                                className="w-full px-3 py-2 border border-border rounded-lg text-sm text-text-primary bg-white placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                            />

                            {/* Actions */}
                            <div className="flex items-center gap-3">
                                <Button
                                    type="submit"
                                    size="sm"
                                    loading={loading}
                                    disabled={
                                        rating === 0 ||
                                        !comment.trim() ||
                                        loading
                                    }
                                >
                                    {loading
                                        ? t('review_submitting')
                                        : t('review_submit')}
                                </Button>
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="text-sm text-text-muted hover:text-text-secondary"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
