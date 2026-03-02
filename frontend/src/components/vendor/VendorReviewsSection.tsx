import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useGetVendorReviews, useSubmitVendorReview } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { toast } from 'sonner';
import { Review } from '../../backend';

interface VendorReviewsSectionProps {
  vendorId: string;
  readOnly?: boolean;
}

function formatRelativeTime(createdAt: bigint): string {
  const ms = Number(createdAt) / 1_000_000;
  const diff = Date.now() - ms;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

function truncatePrincipal(principal: string): string {
  if (principal.length <= 12) return principal;
  return `${principal.slice(0, 8)}...`;
}

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted-foreground/30'
          }`}
        />
      ))}
    </div>
  );
}

function StarSelector({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const starValue = i + 1;
        const filled = hovered ? starValue <= hovered : starValue <= value;
        return (
          <button
            key={i}
            type="button"
            disabled={disabled}
            onClick={() => onChange(starValue)}
            onMouseEnter={() => setHovered(starValue)}
            onMouseLeave={() => setHovered(0)}
            className="focus:outline-none disabled:cursor-not-allowed"
            aria-label={`Rate ${starValue} star${starValue > 1 ? 's' : ''}`}
          >
            <Star
              className={`h-6 w-6 transition-colors ${
                filled
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-muted text-muted-foreground/30 hover:fill-amber-200 hover:text-amber-200'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="py-4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <StarRating rating={Number(review.rating)} />
          <span className="text-xs text-muted-foreground font-mono">
            {truncatePrincipal(review.authorPrincipal.toString())}
          </span>
        </div>
        <span className="text-xs text-muted-foreground shrink-0">
          {formatRelativeTime(review.createdAt)}
        </span>
      </div>
      {review.comment && (
        <p className="text-sm text-foreground/80 leading-relaxed">{review.comment}</p>
      )}
    </div>
  );
}

export default function VendorReviewsSection({ vendorId, readOnly = false }: VendorReviewsSectionProps) {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: reviews = [], isLoading } = useGetVendorReviews(vendorId);
  const submitReview = useSubmitVendorReview();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a star rating');
      return;
    }
    try {
      await submitReview.mutateAsync({ vendorId, rating, comment });
      toast.success('Review submitted successfully!');
      setRating(0);
      setComment('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit review';
      toast.error(msg);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2">
        <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
        <h2 className="text-xl font-semibold">Customer Reviews</h2>
        {!isLoading && (
          <span className="text-sm text-muted-foreground">({reviews.length})</span>
        )}
      </div>

      {/* Submit Form */}
      {!readOnly && (
        <>
          {isAuthenticated ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Leave a Review</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Your Rating</p>
                    <StarSelector
                      value={rating}
                      onChange={setRating}
                      disabled={submitReview.isPending}
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Comment (optional)</p>
                    <Textarea
                      placeholder="Share your experience with this vendor..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={3}
                      disabled={submitReview.isPending}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={submitReview.isPending || rating === 0}
                    size="sm"
                  >
                    {submitReview.isPending ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-6 text-center">
                <Star className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  Please{' '}
                  <span className="text-primary font-medium">log in</span>
                  {' '}to leave a review
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Reviews List */}
      <Card>
        <CardContent className="pt-4">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="py-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="py-10 text-center">
              <Star className="h-10 w-10 mx-auto mb-3 text-muted-foreground/20" />
              <p className="text-sm text-muted-foreground">No reviews yet</p>
              {!readOnly && !isAuthenticated && (
                <p className="text-xs text-muted-foreground mt-1">Be the first to leave a review!</p>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {reviews.map((review) => (
                <ReviewCard key={review.reviewId} review={review} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
