import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Loader2, Package, Pencil, Plus } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import type { Product } from "../../backend";
import { useMyVendorProducts } from "../../hooks/useMyVendorProducts";
import { useUpdateProductImage } from "../../hooks/useQueries";

interface MyProductsSectionProps {
  vendorId: string;
  onAddProduct?: () => void;
}

export default function MyProductsSection({
  vendorId,
  onAddProduct,
}: MyProductsSectionProps) {
  const { products, isLoading, error } = useMyVendorProducts(vendorId);
  const updateProductImage = useUpdateProductImage();

  // Track which product's image editor is open and its draft URL
  const [editingImageProductId, setEditingImageProductId] = useState<
    string | null
  >(null);
  const [draftImageUrl, setDraftImageUrl] = useState<string>("");

  function openImageEditor(product: Product) {
    setEditingImageProductId(product.id);
    setDraftImageUrl(product.imageUrl ?? "");
  }

  function closeImageEditor() {
    setEditingImageProductId(null);
    setDraftImageUrl("");
  }

  async function handleSaveImage(productId: string) {
    try {
      await updateProductImage.mutateAsync({
        productId,
        imageUrl: draftImageUrl.trim() || null,
      });
      toast.success("Product image updated!");
      closeImageEditor();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update image";
      toast.error(msg);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {(["sk-1", "sk-2", "sk-3"] as const).map((id) => (
          <Skeleton key={id} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex items-center gap-2 text-destructive text-sm p-4 bg-destructive/10 rounded-lg"
        data-ocid="products.error_state"
      >
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span>Failed to load products. Please try again.</span>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-border/60 rounded-xl"
        data-ocid="products.empty_state"
      >
        <Package className="h-10 w-10 text-muted-foreground mb-3" />
        <h3 className="font-semibold mb-1">No products yet</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-xs">
          Create your first product to start selling on the platform.
        </p>
        {onAddProduct && (
          <Button
            size="sm"
            onClick={onAddProduct}
            data-ocid="products.primary_button"
          >
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
          {products.length} product{products.length !== 1 ? "s" : ""}
        </span>
        {onAddProduct && (
          <Button
            size="sm"
            variant="outline"
            onClick={onAddProduct}
            data-ocid="products.secondary_button"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Product
          </Button>
        )}
      </div>

      {products.map((product: Product, index: number) => {
        const isEditing = editingImageProductId === product.id;
        const isPending = updateProductImage.isPending && isEditing;
        const hasPreview =
          draftImageUrl.trim().startsWith("http") &&
          draftImageUrl.trim().length > 0;
        const itemIndex = index + 1;

        return (
          <Card
            key={product.id}
            className="border border-border/60"
            data-ocid={`products.item.${itemIndex}`}
          >
            <CardContent className="p-4">
              {/* Main product row */}
              <div className="flex items-start gap-3">
                {/* Thumbnail + edit button */}
                <div className="relative shrink-0">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-12 h-12 rounded-lg object-cover border border-border/40"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-muted/40 flex items-center justify-center border border-border/40">
                      <Package className="h-5 w-5 text-muted-foreground/40" />
                    </div>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full bg-background border border-border/60 shadow-sm hover:bg-accent"
                    onClick={() =>
                      isEditing ? closeImageEditor() : openImageEditor(product)
                    }
                    aria-label="Edit product image"
                    data-ocid={`product_image.edit_button.${itemIndex}`}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                </div>

                {/* Product info */}
                <div className="flex flex-1 items-start justify-between gap-3 min-w-0">
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
                      variant={
                        Number(product.stock) > 0 ? "secondary" : "destructive"
                      }
                      className="text-xs"
                    >
                      {Number(product.stock) > 0
                        ? `${product.stock.toString()} in stock`
                        : "Out of stock"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Inline image editor */}
              {isEditing && (
                <>
                  <Separator className="my-3" />
                  <div className="space-y-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Edit Product Image
                    </p>

                    {/* URL input */}
                    <Input
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={draftImageUrl}
                      onChange={(e) => setDraftImageUrl(e.target.value)}
                      disabled={isPending}
                      className="text-sm"
                      data-ocid="product_image.input"
                    />

                    {/* Live preview */}
                    {hasPreview && (
                      <div className="flex items-center gap-2">
                        <img
                          src={draftImageUrl.trim()}
                          alt="Preview"
                          className="w-16 h-16 rounded-lg object-cover border border-border/40"
                          onError={(e) => {
                            (
                              e.currentTarget as HTMLImageElement
                            ).style.display = "none";
                          }}
                          onLoad={(e) => {
                            (
                              e.currentTarget as HTMLImageElement
                            ).style.display = "block";
                          }}
                        />
                        <span className="text-xs text-muted-foreground">
                          Preview
                        </span>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs h-8"
                        onClick={() => setDraftImageUrl("")}
                        disabled={isPending}
                        data-ocid="product_image.remove_button"
                      >
                        Remove image
                      </Button>

                      <div className="flex-1" />

                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-8"
                        onClick={closeImageEditor}
                        disabled={isPending}
                        data-ocid="product_image.cancel_button"
                      >
                        Cancel
                      </Button>

                      <Button
                        size="sm"
                        className="text-xs h-8"
                        onClick={() => handleSaveImage(product.id)}
                        disabled={isPending}
                        data-ocid="product_image.save_button"
                      >
                        {isPending ? (
                          <>
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            Saving…
                          </>
                        ) : (
                          "Save"
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
