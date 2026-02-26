/**
 * Category text utilities for vendor category management
 * Provides normalization, comparison, and parsing helpers
 */

/**
 * Normalize category text for display
 * Trims whitespace and collapses multiple spaces into single spaces
 */
export function normalizeCategoryDisplay(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

/**
 * Create a comparison key for case-insensitive, whitespace-normalized matching
 * Used to detect duplicates and match categories
 */
export function getCategoryComparisonKey(text: string): string {
  return text.toLowerCase().trim().replace(/\s+/g, ' ');
}

/**
 * Check if two categories are equal (case-insensitive, whitespace-normalized)
 */
export function areCategoriesEqual(cat1: string, cat2: string): boolean {
  return getCategoryComparisonKey(cat1) === getCategoryComparisonKey(cat2);
}

/**
 * Parse comma-separated input into individual category candidates
 * Returns normalized display versions
 */
export function parseCommaSeparatedCategories(input: string): string[] {
  return input
    .split(',')
    .map(cat => normalizeCategoryDisplay(cat))
    .filter(cat => cat.length > 0);
}

/**
 * Check if a category already exists in a list (case-insensitive, whitespace-normalized)
 */
export function categoryExistsInList(category: string, list: string[]): boolean {
  const key = getCategoryComparisonKey(category);
  return list.some(existing => getCategoryComparisonKey(existing) === key);
}

/**
 * Filter suggestions based on input text (case-insensitive, whitespace-normalized)
 */
export function filterCategorySuggestions(
  suggestions: string[],
  inputText: string,
  maxResults: number = 10
): string[] {
  if (!inputText.trim()) return suggestions.slice(0, maxResults);
  
  const searchKey = getCategoryComparisonKey(inputText);
  
  return suggestions
    .filter(suggestion => getCategoryComparisonKey(suggestion).includes(searchKey))
    .slice(0, maxResults);
}
