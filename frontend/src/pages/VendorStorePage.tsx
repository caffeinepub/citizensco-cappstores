import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Package, Store, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  useListPublicVendors,
  useListProducts,
  useVendorRatingSummary,
  useCreateOrder,
  CreateOrderInput,
} from '../hooks/useQueries';
import ProductCard from '../components/ProductCard';
import VendorReviewsSection from '../components/vendor/VendorReviewsSection';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { toast } from 'sonner';
import type { Product } from '../backend';
import OrderConfirmationDialog, { OrderConfirmationData } from '../components/OrderConfirmationDialog';

function StarRatingDisplay({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={
              rating >= star
                ? 'fill-amber-400 text-amber-400'
                : rating >= star - 0.5
                  ? 'fill-amber-200 text-amber-400'
                  : 'fill-muted text-muted-foreground'
            }
          />
        ))}
      </div>
      <span className="text-sm font-medium text-foreground">{rating.toFixed(1)}</span>
      <span className="text-sm text-muted-foreground">
        ({count} {count === 1 ? 'review' : 'reviews'})
      </span>
    </div>
  );
}

export default function VendorStorePage() {
  const params = useParams({ strict: false }) as { vendorId?: string };
  const vendorId = params.vendorId ?? '';
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();

  const { data: vendors = [], isLoading: vendorsLoading } = useListPublicVendors();
  const { data: allProducts = [], isLoading: productsLoading } = useListProducts();
  const { data: ratingSummary, isLoading: ratingLoading } = useVendorRatingSummary(vendorId || null);
  const createOrder = useCreateOrder();

  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);
  const [confirmationData, setConfirmationData] = useState<OrderConfirmationData | null>(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);

  const vendor = useMemo(
    () => vendors.find((v) => v.principalId.toString() === vendorId),
    [vendors, vendorId]
  );

  const vendorProducts = useMemo(
    () => allProducts.filter((p: Product) => p.vendorId.toString() === vendorId),
    [allProducts, vendorId]
  );

  const handleOrderClick = async (product: Product, quantity: number) => {
    if (!identity) {
      toast.error('Please log in to place an order');
      return;
    }
    setLoadingProductId(product.id);
    try {
      const totalAmount = product.price * BigInt(quantity);
      const input: CreateOrderInput = {
        productId: product.id,
        vendorId: product.vendorId,
        quantity,
        totalAmount,
        product,
      };
      const order = await createOrder.mutateAsync(input);
      setConfirmationData({
        orderId: order.id,
        productName: product.name,
        vendorName: vendor?.displayName ?? 'Unknown Vendor',
        quantity,
        totalAmount: order.totalAmount,
        status: order.status,
      });
      setConfirmationOpen(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to place order';
      toast.error(msg);
    } finally {
      setLoadingProductId(null);
    }
  };

  const averageRating = ratingSummary?.averageRating ?? 0;
  const reviewCount = ratingSummary ? Number(ratingSummary.count) : 0;
  const hasReviews = reviewCount > 0;

  if (vendorsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="flex items-start gap-4 mb-8">
            <Skeleton className="w-16 h-16 rounded-xl" />
            <div className="flex-1">
              <Skeleton className="h-7 w-48 mb-2" />
              <Skeleton className="h-4 w-64 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Store size={48} className="text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Vendor not found</h2>
          <p className="text-muted-foreground mb-4">
            This vendor may not exist or is no longer active.
          </p>
          <Button variant="outline" onClick={() => navigate({ to: '/vendors' })}>
            <ArrowLeft size={16} className="mr-2" />
            Back to Directory
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Back button */}
      <div className="max-w-5xl mx-auto px-4 pt-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: '/vendors' })}
          className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={16} className="mr-1.5" />
          Back to Directory
        </Button>
      </div>

      {/* Vendor Hero */}
      <div className="bg-gradient-to-br from-primary/8 via-background to-secondary/8 border-b border-border/50">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center shadow-sm">
              <Store size={28} className="text-primary" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h1 className="text-2xl font-bold text-foreground mb-1">
                    {vendor.displayName}
                  </h1>

                  {/* Rating display */}
                  <div className="mb-2">
                    {ratingLoading ? (
                      <Skeleton className="h-5 w-40" />
                    ) : hasReviews ? (
                      <StarRatingDisplay rating={averageRating} count={reviewCount} />
                    ) : (
                      <span className="text-sm text-muted-foreground italic">No reviews yet</span>
                    )}
                  </div>

                  {vendor.bio && (
                    <p className="text-muted-foreground text-sm max-w-xl">{vendor.bio}</p>
                  )}
                </div>

                <Badge variant="secondary" className="flex-shrink-0">
                  {vendorProducts.length} product{vendorProducts.length !== 1 ? 's' : ''}
                </Badge>
              </div>

              {/* Categories */}
              {vendor.categories && vendor.categories.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {vendor.categories.map((cat) => (
                    <Badge key={cat} variant="outline" className="text-xs">
                      {cat}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Package size={20} className="text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Products</h2>
        </div>

        {productsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border/60 p-5">
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-full mb-1.5" />
                <Skeleton className="h-4 w-3/4 mb-4" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        ) : vendorProducts.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border/60 rounded-xl">
            <Package size={32} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No products listed yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {vendorProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                vendorName={vendor.displayName}
                onOrderClick={handleOrderClick}
                isLoading={loadingProductId === product.id}
                isAuthenticated={!!identity}
              />
            ))}
          </div>
        )}

        <Separator className="my-10" />

        {/* Reviews Section */}
        <VendorReviewsSection vendorId={vendorId} readOnly={false} />
      </div>

      <OrderConfirmationDialog
        open={confirmationOpen}
        onClose={() => {
          setConfirmationOpen(false);
          setConfirmationData(null);
        }}
        data={confirmationData}
      />
    </div>
  );
}
