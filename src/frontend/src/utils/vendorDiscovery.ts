// Vendor discovery utility functions for filtering and sorting

import { PublicVendor } from '../types';
import { normalizeCategoryDisplay, getCategoryComparisonKey } from './categoryText';

/**
 * Normalize text for case-insensitive comparison
 * Collapses multiple spaces into single spaces and trims
 */
export function normalizeText(text: string): string {
  return text.toLowerCase().trim().replace(/\s+/g, ' ');
}

/**
 * Apply multi-term search filter to vendors
 * Searches across display name, bio, and categories
 * All terms must be found (AND logic) across any of the fields
 */
export function applySearchFilter(vendors: PublicVendor[], searchText: string): PublicVendor[] {
  if (!searchText.trim()) return vendors;
  
  // Split search text into individual terms and normalize
  const searchTerms = normalizeText(searchText)
    .split(' ')
    .filter(term => term.length > 0);
  
  if (searchTerms.length === 0) return vendors;
  
  return vendors.filter((vendor) => {
    // Normalize all searchable fields
    const normalizedName = normalizeText(vendor.displayName);
    const normalizedBio = normalizeText(vendor.bio || '');
    const normalizedCategories = vendor.categories
      .map(cat => normalizeText(cat))
      .join(' ');
    
    // Combine all searchable text
    const searchableText = `${normalizedName} ${normalizedBio} ${normalizedCategories}`;
    
    // Check if ALL search terms are found in the combined text
    return searchTerms.every(term => searchableText.includes(term));
  });
}

/**
 * Apply category filter to vendors
 */
export function applyCategoryFilter(vendors: PublicVendor[], category: string | null): PublicVendor[] {
  if (!category) return vendors;
  
  const normalized = normalizeText(category);
  return vendors.filter((vendor) =>
    vendor.categories.some((cat) => normalizeText(cat) === normalized)
  );
}

/**
 * Sort vendors by the specified mode
 */
export function applySort(vendors: PublicVendor[], sortMode: 'name-asc' | 'newest'): PublicVendor[] {
  const sorted = [...vendors];
  
  if (sortMode === 'name-asc') {
    sorted.sort((a, b) => a.displayName.localeCompare(b.displayName));
  } else if (sortMode === 'newest') {
    sorted.sort((a, b) => Number(b.createdAt - a.createdAt));
  }
  
  return sorted;
}

/**
 * Extract unique categories from vendors with normalized display
 * Returns de-duplicated, consistently whitespace-normalized categories
 */
export function extractUniqueCategories(vendors: PublicVendor[]): string[] {
  const categoryMap = new Map<string, string>();
  
  vendors.forEach((vendor) => {
    vendor.categories.forEach((cat) => {
      const comparisonKey = getCategoryComparisonKey(cat);
      const displayValue = normalizeCategoryDisplay(cat);
      
      // Keep the first occurrence's display value for each unique category
      if (!categoryMap.has(comparisonKey)) {
        categoryMap.set(comparisonKey, displayValue);
      }
    });
  });
  
  // Return sorted display values
  return Array.from(categoryMap.values()).sort();
}
