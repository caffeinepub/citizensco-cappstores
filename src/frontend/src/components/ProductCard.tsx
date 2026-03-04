import type { Product } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Minus, Package, Plus, ShoppingCart } from "lucide-react";
import type React from "react";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
  vendorName?: string;
  onOrderClick: (product: Product, quantity: number) => void;
  isLoading?: boolean;
  isAuthenticated?: boolean;
}

export default function ProductCard({
  product,
  vendorName,
  onOrderClick,
  isLoading = false,
  isAuthenticated = false,
}: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);

  const priceInICP = Number(product.price) / 1e8;
  const stockNum = Number(product.stock);
  const inStock = stockNum > 0;

  const handleDecrement = () => setQuantity((q) => Math.max(1, q - 1));
  const handleIncrement = () => setQuantity((q) => Math.min(stockNum, q + 1));
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number.parseInt(e.target.value, 10);
    if (!Number.isNaN(val)) {
      setQuantity(Math.min(stockNum, Math.max(1, val)));
    }
  };

  return (
    <Card className="flex flex-col h-full border border-border/60 hover:border-primary/40 hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-semibold leading-tight line-clamp-2">
              {product.name}
            </CardTitle>
            {vendorName && (
              <p className="text-xs text-muted-foreground mt-1">
                by {vendorName}
              </p>
            )}
          </div>
          <Badge
            variant={inStock ? "default" : "secondary"}
            className="shrink-0 text-xs"
          >
            {inStock ? `${stockNum} in stock` : "Out of stock"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {product.description}
        </p>
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-primary" />
          <span className="text-xl font-bold text-primary">
            {priceInICP.toFixed(4)} ICP
          </span>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 pt-3 border-t border-border/40">
        {isAuthenticated && inStock && (
          <div className="w-full flex items-center gap-2">
            <Label className="text-xs text-muted-foreground shrink-0">
              Qty:
            </Label>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={handleDecrement}
                disabled={quantity <= 1 || isLoading}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <Input
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                className="h-7 w-14 text-center text-sm px-1"
                min={1}
                max={stockNum}
                disabled={isLoading}
              />
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={handleIncrement}
                disabled={quantity >= stockNum || isLoading}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
        <Button
          className="w-full"
          onClick={() => onOrderClick(product, quantity)}
          disabled={!isAuthenticated || !inStock || isLoading}
          size="sm"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Placing Order…
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              {!isAuthenticated
                ? "Login to Order"
                : !inStock
                  ? "Out of Stock"
                  : "Place Order"}
            </span>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
