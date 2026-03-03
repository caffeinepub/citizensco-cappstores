import React from 'react';
import { Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { Vendor } from '../backend';
import { Principal } from '@dfinity/principal';
import { useGetVendorRatingSummary } from '../hooks/useQueries';

interface VendorCardProps {
  vendor: Vendor;
  onClick?: () => void;
}

export default function VendorCard({ vendor, onClick }: VendorCardProps) {
  // Safely coerce principalId to a real Principal instance
  const vendorPrincipal = React.useMemo(() => {
    try {
      return Principal.fromText(vendor.principalId.toString());
    } catch {
      return null;
    }
  }, [vendor.principalId]);

  const { data: ratingSummary, isLoading: ratingLoading } = useGetVendorRatingSummary(vendorPrincipal);

  const averageRating = ratingSummary?.averageRating ?? 0;
  const totalReviews = ratingSummary ? Number(ratingSummary.totalReviews) : 0;

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${
          i < Math.round(rating)
            ? 'fill-amber-400 text-amber-400'
            : 'fill-muted text-muted-foreground'
        }`}
      />
    ));

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow duration-200 border border-border"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-foreground text-base leading-tight line-clamp-1">
            {vendor.displayName}
          </h3>
          {ratingLoading ? (
            <Skeleton className="h-5 w-20 rounded-full shrink-0" />
          ) : totalReviews > 0 ? (
            <div className="flex items-center gap-1 shrink-0">
              <div className="flex items-center gap-0.5">{renderStars(averageRating)}</div>
              <span className="text-xs text-muted-foreground font-medium">
                {averageRating.toFixed(1)}
              </span>
              <span className="text-xs text-muted-foreground">({totalReviews})</span>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground italic shrink-0">No reviews yet</span>
          )}
        </div>

        {vendor.bio && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{vendor.bio}</p>
        )}

        {vendor.categories && vendor.categories.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {vendor.categories.slice(0, 3).map((cat) => (
              <Badge key={cat} variant="secondary" className="text-xs px-2 py-0">
                {cat}
              </Badge>
            ))}
            {vendor.categories.length > 3 && (
              <Badge variant="outline" className="text-xs px-2 py-0">
                +{vendor.categories.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
