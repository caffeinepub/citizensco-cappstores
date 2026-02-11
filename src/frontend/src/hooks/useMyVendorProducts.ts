import { useMemo } from 'react';
import { useGetMyVendor, useListProducts } from './useQueries';

export function useMyVendorProducts() {
  const { data: vendor } = useGetMyVendor();
  const { data: allProducts = [], isLoading } = useListProducts();

  const products = useMemo(() => {
    if (!vendor) return [];
    return allProducts.filter(product => product.vendorId === vendor.id);
  }, [vendor, allProducts]);

  const hasProducts = products.length > 0;

  return {
    products,
    isLoading,
    hasProducts,
  };
}
