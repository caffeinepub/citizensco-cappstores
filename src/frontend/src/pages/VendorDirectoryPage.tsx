import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Principal } from "@dfinity/principal";
import { useNavigate } from "@tanstack/react-router";
import { Search, SlidersHorizontal, Store } from "lucide-react";
import React, { useMemo, useState } from "react";
import type { Vendor } from "../backend";
import VendorCard from "../components/VendorCard";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import {
  useGetVendorRatingSummary,
  useListPublicVendors,
} from "../hooks/useQueries";
import {
  extractUniqueCategories,
  filterVendorsByCategory,
  searchVendors,
  sortVendors,
} from "../utils/vendorDiscovery";
import type { VendorSortKey } from "../utils/vendorDiscovery";

// Helper to read/write URL params
function getParam(key: string): string {
  return new URLSearchParams(window.location.search).get(key) ?? "";
}

function setParam(key: string, value: string) {
  const params = new URLSearchParams(window.location.search);
  if (value) {
    params.set(key, value);
  } else {
    params.delete(key);
  }
  const newUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState({}, "", newUrl);
}

// Individual vendor rating fetcher - used to populate rating map
function VendorRatingCollector({
  vendor,
  onRating,
}: {
  vendor: Vendor;
  onRating: (id: string, rating: number) => void;
}) {
  const vendorPrincipal = React.useMemo(() => {
    try {
      return Principal.fromText(vendor.principalId.toString());
    } catch {
      return null;
    }
  }, [vendor.principalId]);

  const { data } = useGetVendorRatingSummary(vendorPrincipal);
  const vendorId = vendor.principalId.toString();

  React.useEffect(() => {
    if (data !== undefined) {
      onRating(vendorId, data.averageRating);
    }
  }, [data, vendorId, onRating]);

  return null;
}

export default function VendorDirectoryPage() {
  const navigate = useNavigate();
  const { data: vendors = [], isLoading } = useListPublicVendors();

  // URL-synced state
  const [searchQuery, setSearchQuery] = useState(() => getParam("q"));
  const [selectedCategory, setSelectedCategory] = useState(
    () => getParam("category") || "all",
  );
  const [sortBy, setSortBy] = useState<VendorSortKey>(() => {
    const p = getParam("sort");
    return p === "name" || p === "createdAt" || p === "rating"
      ? p
      : "createdAt";
  });

  // Rating map state - populated by VendorRatingCollector components
  const [ratingMap, setRatingMap] = useState<Map<string, number>>(new Map());

  const handleRating = React.useCallback((id: string, rating: number) => {
    setRatingMap((prev) => {
      if (prev.get(id) === rating) return prev;
      const next = new Map(prev);
      next.set(id, rating);
      return next;
    });
  }, []);

  const debouncedSearch = useDebouncedValue(searchQuery, 300);

  const categories = useMemo(() => extractUniqueCategories(vendors), [vendors]);

  const filteredAndSorted = useMemo(() => {
    let result = searchVendors(vendors, debouncedSearch);
    result = filterVendorsByCategory(result, selectedCategory);
    result = sortVendors(result, sortBy, ratingMap);
    return result;
  }, [vendors, debouncedSearch, selectedCategory, sortBy, ratingMap]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setParam("q", e.target.value);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setParam("category", value === "all" ? "" : value);
  };

  const handleSortChange = (value: string) => {
    const sort = value as VendorSortKey;
    setSortBy(sort);
    setParam("sort", sort === "createdAt" ? "" : sort);
  };

  const handleVendorClick = (vendorId: string) => {
    navigate({ to: `/vendors/${vendorId}` });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <Store size={22} className="text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              Vendor Directory
            </h1>
          </div>
          <p className="text-muted-foreground max-w-xl">
            Discover trusted vendors and explore their products. Browse by
            category or search for what you need.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Search vendors..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-9"
            />
          </div>

          {/* Category filter */}
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full sm:w-44">
              <SlidersHorizontal
                size={14}
                className="mr-1.5 text-muted-foreground"
              />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Newest First</SelectItem>
              <SelectItem value="name">Name A–Z</SelectItem>
              <SelectItem value="rating">Top Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results count */}
        {!isLoading && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-muted-foreground">
              {filteredAndSorted.length} vendor
              {filteredAndSorted.length !== 1 ? "s" : ""} found
            </span>
            {selectedCategory !== "all" && (
              <Badge variant="secondary" className="text-xs">
                {selectedCategory}
                <button
                  type="button"
                  className="ml-1.5 hover:text-foreground"
                  onClick={() => handleCategoryChange("all")}
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        )}

        {/* Rating collectors (invisible, just fetch data) */}
        {vendors.map((vendor) => (
          <VendorRatingCollector
            key={vendor.principalId.toString()}
            vendor={vendor}
            onRating={handleRating}
          />
        ))}

        {/* Vendor Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(["sk-1", "sk-2", "sk-3", "sk-4", "sk-5", "sk-6"] as const).map(
              (id) => (
                <div
                  key={id}
                  className="rounded-xl border border-border/60 p-5"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-32 mb-1.5" />
                      <Skeleton className="h-3.5 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full mb-1.5" />
                  <Skeleton className="h-4 w-3/4 mb-3" />
                  <div className="flex gap-1.5">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                </div>
              ),
            )}
          </div>
        ) : filteredAndSorted.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Store size={28} className="text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No vendors found
            </h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              {searchQuery || selectedCategory !== "all"
                ? "Try adjusting your search or filters."
                : "No vendors are currently listed. Check back soon!"}
            </p>
            {(searchQuery || selectedCategory !== "all") && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setParam("q", "");
                  setParam("category", "");
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAndSorted.map((vendor) => (
              <VendorCard
                key={vendor.principalId.toString()}
                vendor={vendor}
                onClick={() => handleVendorClick(vendor.principalId.toString())}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
