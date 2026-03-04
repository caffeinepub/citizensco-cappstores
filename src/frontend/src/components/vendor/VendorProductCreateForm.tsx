import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Principal } from "@dfinity/principal";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import type { Product } from "../../backend";
import { useCreateProduct } from "../../hooks/useQueries";

interface VendorProductCreateFormProps {
  vendorId: string;
  onSuccess?: () => void;
}

export default function VendorProductCreateForm({
  vendorId,
  onSuccess,
}: VendorProductCreateFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  const createProduct = useCreateProduct();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const priceValue = Number.parseFloat(price);
    const stockValue = Number.parseInt(stock, 10);

    if (!name.trim()) {
      toast.error("Product name is required");
      return;
    }
    if (Number.isNaN(priceValue) || priceValue < 0) {
      toast.error("Please enter a valid price");
      return;
    }
    if (Number.isNaN(stockValue) || stockValue < 0) {
      toast.error("Please enter a valid stock quantity");
      return;
    }

    const productId = `product-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    const product: Product = {
      id: productId,
      vendorId: Principal.fromText(vendorId),
      name: name.trim(),
      description: description.trim(),
      price: BigInt(Math.round(priceValue * 1e8)),
      stock: BigInt(stockValue),
      createdAt: BigInt(Date.now() * 1_000_000),
      ...(imageUrl.trim() ? { imageUrl: imageUrl.trim() } : {}),
    };

    try {
      await createProduct.mutateAsync(product);
      toast.success("Product created successfully!");
      setName("");
      setDescription("");
      setImageUrl("");
      setPrice("");
      setStock("");
      onSuccess?.();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to create product";
      toast.error(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="product-name">
          Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="product-name"
          placeholder="Product name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="product-description">Description</Label>
        <Textarea
          id="product-description"
          placeholder="Describe your product…"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="product-image-url">Product Image URL (optional)</Label>
        <Input
          id="product-image-url"
          data-ocid="product_form.image_url.input"
          placeholder="https://example.com/image.jpg"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          type="url"
        />
        {imageUrl.trim() && (
          <div className="mt-2 rounded-lg overflow-hidden border border-border/40 w-full h-28 bg-muted/20">
            <img
              src={imageUrl.trim()}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="product-price">
            Price (ICP) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="product-price"
            type="number"
            placeholder="0.0001"
            min="0"
            step="0.0001"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="product-stock">
            Stock <span className="text-destructive">*</span>
          </Label>
          <Input
            id="product-stock"
            type="number"
            placeholder="100"
            min="0"
            step="1"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            required
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={createProduct.isPending}
        className="w-full"
      >
        {createProduct.isPending ? (
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Creating…
          </span>
        ) : (
          "Create Product"
        )}
      </Button>
    </form>
  );
}
