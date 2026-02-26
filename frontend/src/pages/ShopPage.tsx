import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useListProducts, useCreateOrder, useListPublicVendors } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Search, Loader2, Store, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Product } from '../types';

export default function ShopPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: products = [], isLoading: productsLoading } = useListProducts();
  const { data: vendors = [], isLoading: vendorsLoading } = useListPublicVendors();
  const createOrder = useCreateOrder();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<string>('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const isAuthenticated = !!identity;
  const isLoading = productsLoading || vendorsLoading;

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVendor = !selectedVendor || product.vendorId === selectedVendor;
    return matchesSearch && matchesVendor;
  });

  const getVendorName = (vendorId: string) => {
    const vendor = vendors.find((v) => v.principalId === vendorId);
    return vendor?.displayName || `${vendorId.slice(0, 8)}...`;
  };

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

  if (isLoading) {
    return (
      <div className="container py-16 text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <ShoppingCart className="h-10 w-10 text-primary" />
          Shop
        </h1>
        <p className="text-muted-foreground">Browse and purchase products from our vendors</p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {vendors.length > 0 && (
          <div className="flex gap-2">
            <select
              value={selectedVendor}
              onChange={(e) => setSelectedVendor(e.target.value)}
              className="px-4 py-2 border rounded-md bg-background flex-1 sm:flex-initial"
            >
              <option value="">All Vendors</option>
              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.principalId}>
                  {vendor.displayName}
                </option>
              ))}
            </select>
            {selectedVendor && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate({ to: `/vendors/${selectedVendor}` })}
                title="Visit vendor store"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      {filteredProducts.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <CardTitle className="mb-2">No Products Found</CardTitle>
            <p className="text-muted-foreground">
              {searchTerm || selectedVendor
                ? 'Try adjusting your filters'
                : 'No products available at the moment'}
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
                <div className="flex items-center gap-2 mt-2">
                  <Store className="h-3 w-3 text-muted-foreground" />
                  <button
                    onClick={() => navigate({ to: `/vendors/${product.vendorId}` })}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors underline"
                  >
                    {getVendorName(product.vendorId)}
                  </button>
                </div>
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
