import React, { useState, useMemo } from 'react';
import { useListProducts } from '../hooks/useQueries';
import { useListPublicVendors } from '../hooks/useQueries';
import { useCreateOrder, CreateOrderInput } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import ProductCard from '../components/ProductCard';
import OrderConfirmationDialog from '../components/OrderConfirmationDialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Search, ShoppingBag, Store } from 'lucide-react';
import { Product } from '@/backend';
import { toast } from 'sonner';
import type { OrderConfirmationData } from '../types';

export default function ShopPage() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: products = [], isLoading: productsLoading } = useListProducts();
  const { data: vendors = [], isLoading: vendorsLoading } = useListPublicVendors();
  const createOrder = useCreateOrder();

  const [search, setSearch] = useState('');
  const [vendorFilter, setVendorFilter] = useState<string>('all');
  const [confirmationData, setConfirmationData] = useState<OrderConfirmationData | null>(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);

  const vendorMap = useMemo(() => {
    const map = new Map<string, string>();
    vendors.forEach((v) => map.set(v.principalId.toString(), v.displayName));
    return map;
  }, [vendors]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());
      const matchesVendor =
        vendorFilter === 'all' || p.vendorId.toString() === vendorFilter;
      return matchesSearch && matchesVendor;
    });
  }, [products, search, vendorFilter]);

  const handleOrderClick = async (product: Product, quantity: number) => {
    if (!isAuthenticated) {
      toast.error('Please log in to place an order.');
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
      };
      const order = await createOrder.mutateAsync(input);
      const vendorName = vendorMap.get(product.vendorId.toString()) ?? 'Unknown Vendor';

      setConfirmationData({
        orderId: order.id,
        productName: product.name,
        vendorName,
        quantity,
        totalAmount: order.totalAmount,
        status: String(order.status),
      });
      setConfirmationOpen(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to place order';
      toast.error(msg);
    } finally {
      setLoadingProductId(null);
    }
  };

  const isLoading = productsLoading || vendorsLoading;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <ShoppingBag className="h-7 w-7 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">Shop</h1>
          </div>
          <p className="text-muted-foreground">
            Browse products from verified vendors on the platform.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={vendorFilter} onValueChange={setVendorFilter}>
            <SelectTrigger className="w-full sm:w-56">
              <Store className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="All Vendors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Vendors</SelectItem>
              {vendors.map((v) => (
                <SelectItem key={v.principalId.toString()} value={v.principalId.toString()}>
                  {v.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        {!isLoading && (
          <div className="flex items-center gap-3 mb-6">
            <Badge variant="secondary" className="text-sm">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
            </Badge>
            {vendorFilter !== 'all' && (
              <Badge variant="outline" className="text-sm">
                Filtered by: {vendorMap.get(vendorFilter) ?? vendorFilter}
              </Badge>
            )}
          </div>
        )}

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3">
                <Skeleton className="h-40 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-9 w-full" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <img
              src="/assets/generated/empty-state.dim_300x200.png"
              alt="No products"
              className="w-48 mb-6 opacity-70"
            />
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground text-sm max-w-sm">
              {search || vendorFilter !== 'all'
                ? 'Try adjusting your search or filter.'
                : 'No products are available yet. Check back soon!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                vendorName={vendorMap.get(product.vendorId.toString())}
                onOrderClick={handleOrderClick}
                isLoading={loadingProductId === product.id}
                isAuthenticated={isAuthenticated}
              />
            ))}
          </div>
        )}
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
