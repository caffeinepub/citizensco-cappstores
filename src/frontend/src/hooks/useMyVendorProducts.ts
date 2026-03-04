import type { Product } from "../backend";
import { useListProducts } from "./useQueries";

export function useMyVendorProducts(vendorId: string | null | undefined) {
  const { data: allProducts = [], isLoading, error } = useListProducts();

  const products: Product[] = vendorId
    ? allProducts.filter((p) => p.vendorId.toString() === vendorId)
    : [];

  const hasProducts = products.length > 0;

  return { products, isLoading, error, hasProducts };
}
