import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Plus } from 'lucide-react';
import { Product } from '../../types';

interface MyProductsSectionProps {
  products: Product[];
  isLoading: boolean;
  onScrollToProductForm: () => void;
}

export default function MyProductsSection({ products, isLoading, onScrollToProductForm }: MyProductsSectionProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            My Products
          </CardTitle>
          <CardDescription>Your product listings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          My Products
        </CardTitle>
        <CardDescription>Your product listings</CardDescription>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No products yet</h3>
            <p className="text-muted-foreground mb-6">
              Add your first product to start selling on the platform
            </p>
            <Button onClick={onScrollToProductForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Product
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-lg mb-2 truncate">{product.name}</h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-bold text-primary">
                    {(Number(product.price) / 100000000).toFixed(2)} ICP
                  </span>
                  <Badge variant={Number(product.stock) > 0 ? 'default' : 'destructive'}>
                    Stock: {Number(product.stock)}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Created: {new Date(Number(product.createdAt) / 1000000).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
