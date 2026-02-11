import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetPublicVendor, useListProducts, useCreateOrder } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Store, Loader2, ShoppingCart, Search, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Product } from '../types';

export default function VendorStorePage() {
  const { vendorId } = useParams({ strict: false }) as { vendorId: string };
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: vendor, isLoading: vendorLoading, error: vendorError } = useGetPublicVendor(vendorId);
  const { data: allProducts = [], isLoading: productsLoading } = useListProducts();
  const createOrder = useCreateOrder();
  const [searchTerm, setSearchTerm] = useState('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const isAuthenticated = !!identity;

  // Filter products by vendor
  const vendorProducts = allProducts.filter((product) => product.vendorId === vendorId);

  // Apply search filter
  const filteredProducts = vendorProducts.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleQuantityChange = (productId: string, value: string) => {
    const qty = parseInt(value) || 0;
    setQuantities((prev) => ({ ...prev, [productId]: qty }));
  };

  const handlePlaceOrder = async (product: Product) => {
    if (!isAuthenticated) {
      toast.error('Please log in to place an order');
      return;
    }

    const quantity = quantities[product.id] || 1;
    if (quantity <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    if (quantity > Number(product.stock)) {
      toast.error('Not enough inventory available');
      return;
    }

    try {
      await createOrder.mutateAsync({
        vendorId: product.vendorId,
        productId: product.id,
        quantity: BigInt(quantity),
        totalAmount: product.price * BigInt(quantity),
      });
      toast.success('Order placed successfully!');
      setQuantities((prev) => ({ ...prev, [product.id]: 0 }));
    } catch (error: any) {
      toast.error(error.message || 'Failed to place order');
    }
  };

  if (vendorLoading || productsLoading) {
    return (
      <div className="container py-16 text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Loading vendor store...</p>
      </div>
    );
  }

  if (vendorError || !vendor) {
    return (
      <div className="container py-16 text-center">
        <Store className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-bold mb-2">Vendor Not Found</h2>
        <p className="text-muted-foreground mb-4">This vendor store is not available</p>
        <Button onClick={() => navigate({ to: '/vendors' })}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Directory
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-12">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate({ to: '/vendors' })}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Directory
      </Button>

      {/* Vendor Profile Header */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Store className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-3xl mb-2">{vendor.displayName}</CardTitle>
              <CardDescription className="text-base">{vendor.bio || 'No description available'}</CardDescription>
              {vendor.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {vendor.categories.map((category, idx) => (
                    <Badge key={idx} variant="secondary">
                      {category}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products in this store..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <CardTitle className="mb-2">No Products Found</CardTitle>
            <p className="text-muted-foreground">
              {searchTerm
                ? 'Try adjusting your search'
                : 'This vendor has no products available at the moment'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <Badge variant="outline">
                    {Number(product.stock)} in stock
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">{product.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                  <span className="text-sm font-medium">Price</span>
                  <span className="text-lg font-bold text-primary">
                    {(Number(product.price) / 100000000).toFixed(2)} ICP
                  </span>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="1"
                    max={Number(product.stock)}
                    placeholder="Qty"
                    value={quantities[product.id] || ''}
                    onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                    className="w-20"
                  />
                  <Button
                    className="flex-1 gap-2"
                    onClick={() => handlePlaceOrder(product)}
                    disabled={createOrder.isPending || !isAuthenticated || Number(product.stock) === 0}
                  >
                    {createOrder.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Ordering...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4" />
                        Order
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
