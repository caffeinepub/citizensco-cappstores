import { useState, useMemo, useEffect } from 'react';
import { useListPublicVendors, useListPublicVendorsByCategory } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Store, Loader2, ArrowRight, Search, X } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { applySearchFilter, applySort, extractUniqueCategories } from '../utils/vendorDiscovery';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { readFiltersFromUrl, updateUrlParams } from '../utils/urlParams';
import { areCategoriesEqual } from '../utils/categoryText';

export default function VendorDirectoryPage() {
  // Initialize state from URL on mount
  const initialFilters = useMemo(() => readFiltersFromUrl(), []);
  
  const [searchText, setSearchText] = useState(initialFilters.search);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialFilters.category);
  const [sortMode, setSortMode] = useState<'name-asc' | 'newest'>(initialFilters.sort);
  const navigate = useNavigate();

  // Debounce search text for filtering
  const debouncedSearchText = useDebouncedValue(searchText, 250);

  // Update URL when filters change (using debounced search)
  useEffect(() => {
    updateUrlParams({
      search: debouncedSearchText || null,
      category: selectedCategory,
      sort: sortMode === 'name-asc' ? null : sortMode, // default is name-asc, so omit it
    });
  }, [debouncedSearchText, selectedCategory, sortMode]);

  // Fetch vendors based on category selection
  const allVendorsQuery = useListPublicVendors();
  const categoryVendorsQuery = useListPublicVendorsByCategory(selectedCategory);

  // Use the appropriate query based on category selection
  const activeQuery = selectedCategory ? categoryVendorsQuery : allVendorsQuery;
  const { data: vendors = [], isLoading, error } = activeQuery;

  // Extract unique categories from all vendors for the filter chips
  const availableCategories = useMemo(() => {
    if (allVendorsQuery.data) {
      return extractUniqueCategories(allVendorsQuery.data);
    }
    return [];
  }, [allVendorsQuery.data]);

  // Check if selected category exists in available categories
  const isCategoryInList = useMemo(() => {
    if (!selectedCategory) return true;
    return availableCategories.some(cat => areCategoriesEqual(cat, selectedCategory));
  }, [selectedCategory, availableCategories]);

  // Apply client-side search and sort to the fetched vendors (using debounced search)
  const filteredAndSortedVendors = useMemo(() => {
    let result = vendors;
    result = applySearchFilter(result, debouncedSearchText);
    result = applySort(result, sortMode);
    return result;
  }, [vendors, debouncedSearchText, sortMode]);

  // Clear all filters
  const handleClearFilters = () => {
    setSearchText('');
    setSelectedCategory(null);
    setSortMode('name-asc');
  };

  // Check if any filters are active
  const hasActiveFilters = searchText.trim() !== '' || selectedCategory !== null || sortMode !== 'name-asc';

  if (isLoading) {
    return (
      <div className="container py-16 text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Loading vendors...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-16 text-center">
        <Store className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-bold mb-2">Error Loading Vendors</h2>
        <p className="text-muted-foreground mb-4">{error.message || 'Please try again later'}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  const hasNoResults = filteredAndSortedVendors.length === 0 && vendors.length > 0;
  const hasNoVendors = vendors.length === 0;

  return (
    <div className="container py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Store className="h-10 w-10 text-primary" />
          Vendor Directory
        </h1>
        <p className="text-muted-foreground">Discover and shop from our verified vendors</p>
      </div>

      {/* Discovery Controls */}
      {!hasNoVendors && (
        <Card className="mb-8">
          <CardContent className="pt-6">
            {/* Search and Sort Row */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search vendors by name, description, or category..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchText && (
                  <button
                    onClick={() => setSearchText('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Select value={sortMode} onValueChange={(value) => setSortMode(value as 'name-asc' | 'newest')}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">A–Z by Name</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter Chips */}
            {(availableCategories.length > 0 || selectedCategory) && (
              <div>
                <p className="text-sm font-medium mb-3 text-muted-foreground">Filter by Category</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedCategory === null ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(null)}
                    className="rounded-full"
                  >
                    All Categories
                  </Button>
                  
                  {/* Show selected category even if not in available list */}
                  {selectedCategory && !isCategoryInList && (
                    <Badge variant="default" className="rounded-full px-3 py-1.5 gap-2">
                      {selectedCategory}
                      <button
                        onClick={() => setSelectedCategory(null)}
                        className="hover:text-destructive"
                        aria-label="Clear category filter"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  
                  {availableCategories.map((category) => {
                    const isSelected = selectedCategory && areCategoriesEqual(category, selectedCategory);
                    return (
                      <Button
                        key={category}
                        variant={isSelected ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategory(isSelected ? null : category)}
                        className="rounded-full"
                      >
                        {category}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Results Count and Clear Filters */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{filteredAndSortedVendors.length}</span> of{' '}
                <span className="font-semibold text-foreground">{vendors.length}</span> vendors
              </p>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={handleClearFilters} className="gap-2">
                  <X className="h-4 w-4" />
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vendor Grid or Empty States */}
      {hasNoVendors ? (
        <Card className="text-center py-12">
          <CardContent>
            <Store className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <CardTitle className="mb-2">No Vendors Yet</CardTitle>
            <p className="text-muted-foreground">Check back soon for new vendors</p>
          </CardContent>
        </Card>
      ) : hasNoResults ? (
        <Card className="text-center py-12">
          <CardContent>
            <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <CardTitle className="mb-2">No Vendors Found</CardTitle>
            <p className="text-muted-foreground mb-4">
              No vendors match your current filters. Try adjusting your search or category selection.
            </p>
            <Button variant="outline" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedVendors.map((vendor) => (
            <Card key={vendor.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Store className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{vendor.displayName}</CardTitle>
                    <p className="text-xs text-muted-foreground truncate">
                      {vendor.principalId.slice(0, 8)}...{vendor.principalId.slice(-6)}
                    </p>
                  </div>
                </div>
                <CardDescription className="line-clamp-3 min-h-[3rem]">
                  {vendor.bio || 'No description available'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {vendor.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {vendor.categories.slice(0, 3).map((category, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 text-xs rounded-full bg-secondary text-secondary-foreground"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                )}
                <Button
                  className="w-full gap-2"
                  onClick={() => navigate({ to: `/vendors/${vendor.principalId}` })}
                >
                  Visit Store
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
