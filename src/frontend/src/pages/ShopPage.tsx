import { useState, useMemo } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useListProducts, useListProductsByVendor, useCreateOrder } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingCart, Search, Package, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ShopPage() {
  const { identity } = useInternetIdentity();
  const [selectedVendorId, setSelectedVendorId] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const { data: allProducts = [], isLoading: allProductsLoading } = useListProducts();
  const { data: vendorProducts = [], isLoading: vendorProductsLoading } = useListProductsByVendor(selectedVendorId);
  const createOrder = useCreateOrder();

  const isAuthenticated = !!identity;
  const products = selectedVendorId ? vendorProducts : allProducts;
  const isLoading = selectedVendorId ? vendorProductsLoading : allProductsLoading;

  // Extract unique vendors
  const vendors = useMemo(() => {
    const vendorMap = new Map<string, string>();
    allProducts.forEach(product => {
      if (!vendorMap.has(product.vendorId)) {
        vendorMap.set(product.vendorId, product.vendorId);
      }
    });
    return Array.from(vendorMap.entries());
  }, [allProducts]);

  // Filter products by search
  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products;
    return products.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  const handlePlaceOrder = async (productId: string, vendorId: string) => {
    const quantity = quantities[productId] || 1;
    try {
      await createOrder.mutateAsync({
        vendorId,
        productId,
        quantity: BigInt(quantity),
      });
      toast.success('Order placed successfully!');
      setQuantities(prev => ({ ...prev, [productId]: 1 }));
    } catch (error: any) {
      toast.error(error.message || 'Failed to place order');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-16">
        <Card className="max-w-2xl mx-auto text-center">
          <CardHeader>
            <CardTitle className="text-2xl">Shop Access Required</CardTitle>
            <CardDescription>Please log in to browse and purchase products</CardDescription>
          </CardHeader>
          <CardContent>
            <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Discover amazing products from verified vendors in our marketplace.
            </p>
          </CardContent>
        </Card>
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

      {/* Search and Filter */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedVendorId || 'all'} onValueChange={(value) => setSelectedVendorId(value === 'all' ? undefined : value)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Vendors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Vendors</SelectItem>
              {vendors.map(([id, name]) => (
                <SelectItem key={id} value={id}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-muted-foreground">
          Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-48 bg-muted rounded-lg mb-4" />
                <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                <div className="h-4 bg-muted rounded w-full" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              {searchQuery || selectedVendorId ? 'No products match your criteria' : 'No products available yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => {
            const quantity = quantities[product.id] || 1;
            const totalPrice = Number(product.price) * quantity;
            const inStock = Number(product.inventory) > 0;

            return (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <img
                    src={product.imageBlob.getDirectURL()}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{product.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">{Number(product.price)} ICP</span>
                    <Badge variant={inStock ? 'default' : 'destructive'}>
                      {inStock ? `${Number(product.inventory)} in stock` : 'Out of stock'}
                    </Badge>
                  </div>
                  {inStock && (
                    <>
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-muted-foreground">Quantity:</label>
                        <Input
                          type="number"
                          min="1"
                          max={Number(product.inventory)}
                          value={quantity}
                          onChange={(e) => setQuantities(prev => ({ ...prev, [product.id]: parseInt(e.target.value) || 1 }))}
                          className="w-20"
                        />
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total: <span className="font-bold text-foreground">{totalPrice} ICP</span>
                      </div>
                      <Button
                        className="w-full gap-2"
                        onClick={() => handlePlaceOrder(product.id, product.vendorId)}
                        disabled={createOrder.isPending}
                      >
                        {createOrder.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Placing Order...
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="h-4 w-4" />
                            Place Order
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
