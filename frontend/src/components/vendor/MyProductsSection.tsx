import React, { useRef } from 'react';
import { useMyVendorProducts } from '../../hooks/useMyVendorProducts';
import { Product } from '../../backend';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, Plus, AlertCircle } from 'lucide-react';

interface MyProductsSectionProps {
  vendorId: string;
  onAddProduct?: () => void;
}

export default function MyProductsSection({ vendorId, onAddProduct }: MyProductsSectionProps) {
  const { products, isLoading, error } = useMyVendorProducts(vendorId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-destructive text-sm p-4 bg-destructive/10 rounded-lg">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span>Failed to load products. Please try again.</span>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-border/60 rounded-xl">
        <Package className="h-10 w-10 text-muted-foreground mb-3" />
        <h3 className="font-semibold mb-1">No products yet</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-xs">
          Create your first product to start selling on the platform.
        </p>
        {onAddProduct && (
          <Button size="sm" onClick={onAddProduct}>
            <Plus className="h-4 w-4 mr-1" />
            Add First Product
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">
          {products.length} product{products.length !== 1 ? 's' : ''}
        </span>
        {onAddProduct && (
          <Button size="sm" variant="outline" onClick={onAddProduct}>
            <Plus className="h-4 w-4 mr-1" />
            Add Product
          </Button>
        )}
      </div>
      {products.map((product: Product) => (
        <Card key={product.id} className="border border-border/60">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{product.name}</p>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                  {product.description}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-sm font-semibold text-primary">
                  {(Number(product.price) / 1e8).toFixed(4)} ICP
                </span>
                <Badge
                  variant={Number(product.stock) > 0 ? 'secondary' : 'destructive'}
                  className="text-xs"
                >
                  {Number(product.stock) > 0 ? `${product.stock.toString()} in stock` : 'Out of stock'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
