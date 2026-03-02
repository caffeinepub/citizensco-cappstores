import React from 'react';
import { Star, Store, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useVendorRatingSummary } from '../hooks/useQueries';
import type { Vendor } from '../backend';

interface VendorCardProps {
  vendor: Vendor;
  onClick?: () => void;
}

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = rating >= star;
        const partial = !filled && rating >= star - 0.5;
        return (
          <Star
            key={star}
            size={size}
            className={
              filled
                ? 'fill-amber-400 text-amber-400'
                : partial
                  ? 'fill-amber-200 text-amber-400'
                  : 'fill-muted text-muted-foreground'
            }
          />
        );
      })}
    </div>
  );
}

export default function VendorCard({ vendor, onClick }: VendorCardProps) {
  const vendorId = vendor.principalId.toString();
  const { data: ratingSummary, isLoading: ratingLoading } = useVendorRatingSummary(vendorId);

  const averageRating = ratingSummary?.averageRating ?? 0;
  const reviewCount = ratingSummary ? Number(ratingSummary.count) : 0;
  const hasReviews = reviewCount > 0;

  return (
    <Card
      className="group cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 border-border/60 hover:border-primary/30"
      onClick={onClick}
    >
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Store size={20} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {vendor.displayName}
            </h3>
            {/* Rating */}
            <div className="flex items-center gap-1.5 mt-0.5">
              {ratingLoading ? (
                <Skeleton className="h-4 w-24" />
              ) : hasReviews ? (
                <>
                  <StarRating rating={averageRating} size={12} />
                  <span className="text-xs text-muted-foreground">
                    {averageRating.toFixed(1)}
                    <span className="ml-1">({reviewCount})</span>
                  </span>
                </>
              ) : (
                <span className="text-xs text-muted-foreground italic">No reviews yet</span>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        {vendor.bio && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{vendor.bio}</p>
        )}

        {/* Categories */}
        {vendor.categories && vendor.categories.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <Tag size={12} className="text-muted-foreground flex-shrink-0" />
            {vendor.categories.slice(0, 3).map((cat) => (
              <Badge key={cat} variant="secondary" className="text-xs px-2 py-0">
                {cat}
              </Badge>
            ))}
            {vendor.categories.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{vendor.categories.length - 3} more
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { StarRating };
