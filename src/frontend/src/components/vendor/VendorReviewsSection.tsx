import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import type { Principal } from "@dfinity/principal";
import { LogIn, MessageSquare, Star } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import {
  useGetVendorRatingSummary,
  useGetVendorReviews,
  useSubmitVendorReview,
} from "../../hooks/useQueries";

interface VendorReviewsSectionProps {
  vendorId: string;
  vendorPrincipal?: Principal | null;
  readOnly?: boolean;
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
    <div className="flex gap-1">
      {Array.from({ length: 5 }, (_, i) => {
        const star = i + 1;
        const filled = star <= (hovered || value);
        return (
          <button
            key={star}
            type="button"
            disabled={disabled}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="focus:outline-none disabled:cursor-not-allowed"
          >
            <Star
              className={`w-6 h-6 transition-colors ${
                filled
                  ? "fill-amber-400 text-amber-400"
                  : "fill-muted text-muted-foreground"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

function RatingSummaryBar({
  label,
  count,
  total,
}: {
  label: string;
  count: number;
  total: number;
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-12 text-muted-foreground shrink-0">{label}</span>
      <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
        <div
          className="bg-amber-400 h-2 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-6 text-right text-muted-foreground shrink-0">
        {count}
      </span>
    </div>
  );
}

export default function VendorReviewsSection({
  vendorId,
  vendorPrincipal,
  readOnly = false,
}: VendorReviewsSectionProps) {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const { data: reviews, isLoading: reviewsLoading } =
    useGetVendorReviews(vendorId);

  // Use the new backend-computed rating summary
  const principalForSummary = vendorPrincipal ?? null;
  const { data: ratingSummary, isLoading: summaryLoading } =
    useGetVendorRatingSummary(principalForSummary);

  const submitReview = useSubmitVendorReview();

  const averageRating = ratingSummary?.averageRating ?? 0;
  const totalReviews = ratingSummary ? Number(ratingSummary.totalReviews) : 0;
  const starBreakdown = ratingSummary?.starBreakdown
    ? ratingSummary.starBreakdown.map((n) => Number(n))
    : [0, 0, 0, 0, 0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a star rating.");
      return;
    }
    try {
      await submitReview.mutateAsync({ vendorId, rating, comment });
      toast.success("Review submitted!");
      setRating(0);
      setComment("");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to submit review";
      toast.error(msg);
    }
  };

  const formatRelativeTime = (createdAt: bigint) => {
    const ms = Number(createdAt) / 1_000_000;
    const diff = Date.now() - ms;
    const minutes = Math.floor(diff / 60_000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(ms).toLocaleDateString();
  };

  const truncatePrincipal = (p: { toString(): string }) => {
    const s = p.toString();
    if (s.length <= 12) return s;
    return `${s.slice(0, 6)}…${s.slice(-4)}`;
  };

  return (
    <section>
      <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
        <MessageSquare className="w-5 h-5" />
        Reviews
      </h2>

      {/* Rating Summary */}
      {summaryLoading ? (
        <Card className="mb-6">
          <CardContent className="p-4 space-y-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </CardContent>
        </Card>
      ) : totalReviews > 0 ? (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Average score */}
              <div className="flex flex-col items-center justify-center shrink-0">
                <span className="text-4xl font-bold text-foreground">
                  {averageRating.toFixed(1)}
                </span>
                <div className="flex gap-0.5 my-1">
                  {([0, 1, 2, 3, 4] as const).map((i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(averageRating)
                          ? "fill-amber-400 text-amber-400"
                          : "fill-muted text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
                </span>
              </div>

              {/* Star breakdown bars */}
              <div className="flex-1 space-y-1.5">
                {[5, 4, 3, 2, 1].map((star) => (
                  <RatingSummaryBar
                    key={star}
                    label={`${star} ★`}
                    count={starBreakdown[star - 1] ?? 0}
                    total={totalReviews}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-6">
          <CardContent className="p-4 text-center text-muted-foreground text-sm italic">
            No reviews yet. Be the first to leave a review!
          </CardContent>
        </Card>
      )}

      {/* Submit Review Form */}
      {!readOnly && (
        <div className="mb-6">
          {isAuthenticated ? (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium text-foreground mb-3">
                  Leave a Review
                </h3>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <span className="text-sm text-muted-foreground mb-1 block">
                      Your Rating
                    </span>
                    <StarSelector
                      value={rating}
                      onChange={setRating}
                      disabled={submitReview.isPending}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="review-comment"
                      className="text-sm text-muted-foreground mb-1 block"
                    >
                      Comment (optional)
                    </label>
                    <Textarea
                      id="review-comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your experience with this vendor..."
                      rows={3}
                      disabled={submitReview.isPending}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={submitReview.isPending || rating === 0}
                    size="sm"
                  >
                    {submitReview.isPending ? "Submitting…" : "Submit Review"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-4 flex items-center gap-3 text-muted-foreground">
                <LogIn className="w-5 h-5 shrink-0" />
                <span className="text-sm">
                  Log in to leave a review for this vendor.
                </span>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Reviews List */}
      {reviewsLoading ? (
        <div className="space-y-3">
          {(["sk-1", "sk-2", "sk-3"] as const).map((id) => (
            <Skeleton key={id} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : reviews && reviews.length > 0 ? (
        <div className="space-y-3">
          {reviews.map((review) => (
            <Card key={review.reviewId}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {([0, 1, 2, 3, 4] as const).map((i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Number(review.rating)
                              ? "fill-amber-400 text-amber-400"
                              : "fill-muted text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {truncatePrincipal(review.authorPrincipal)}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {formatRelativeTime(review.createdAt)}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-sm text-muted-foreground">
                    {review.comment}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        !summaryLoading &&
        totalReviews === 0 && (
          <p className="text-center text-muted-foreground text-sm py-4">
            No reviews have been posted yet.
          </p>
        )
      )}
    </section>
  );
}
