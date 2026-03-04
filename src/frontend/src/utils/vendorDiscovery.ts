import type { Vendor } from "../backend";

export type VendorSortKey = "name" | "createdAt" | "rating";

/**
 * Multi-term search across vendor displayName, bio, and categories.
 */
export function searchVendors(vendors: Vendor[], query: string): Vendor[] {
  if (!query.trim()) return vendors;

  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 0);

  return vendors.filter((vendor) => {
    const haystack = [vendor.displayName, vendor.bio, ...vendor.categories]
      .join(" ")
      .toLowerCase();

    return terms.every((term) => haystack.includes(term));
  });
}

/**
 * Filter vendors by a specific category (case-insensitive).
 */
export function filterVendorsByCategory(
  vendors: Vendor[],
  category: string,
): Vendor[] {
  if (!category || category === "all") return vendors;

  const normalizedCategory = category.toLowerCase().trim();
  return vendors.filter((vendor) =>
    vendor.categories.some(
      (cat) => cat.toLowerCase().trim() === normalizedCategory,
    ),
  );
}

/**
 * Sort vendors by name, createdAt, or rating.
 * For rating sort, pass a Map<string, number> of vendorId -> averageRating.
 */
export function sortVendors(
  vendors: Vendor[],
  sortKey: VendorSortKey,
  ratingMap?: Map<string, number>,
): Vendor[] {
  const sorted = [...vendors];

  switch (sortKey) {
    case "name":
      sorted.sort((a, b) =>
        a.displayName.localeCompare(b.displayName, undefined, {
          sensitivity: "base",
        }),
      );
      break;

    case "createdAt":
      sorted.sort((a, b) => {
        const aTime =
          typeof a.createdAt === "bigint"
            ? Number(a.createdAt)
            : (a.createdAt as number);
        const bTime =
          typeof b.createdAt === "bigint"
            ? Number(b.createdAt)
            : (b.createdAt as number);
        return bTime - aTime;
      });
      break;

    case "rating": {
      sorted.sort((a, b) => {
        const aRating = ratingMap?.get(a.principalId.toString()) ?? 0;
        const bRating = ratingMap?.get(b.principalId.toString()) ?? 0;
        return bRating - aRating;
      });
      break;
    }

    default:
      break;
  }

  return sorted;
}

/**
 * Extract unique normalized categories from a list of vendors.
 */
export function extractUniqueCategories(vendors: Vendor[]): string[] {
  const seen = new Set<string>();
  const categories: string[] = [];

  for (const vendor of vendors) {
    for (const cat of vendor.categories) {
      const normalized = cat.toLowerCase().trim();
      if (!seen.has(normalized)) {
        seen.add(normalized);
        categories.push(cat.trim());
      }
    }
  }

  return categories.sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" }),
  );
}
