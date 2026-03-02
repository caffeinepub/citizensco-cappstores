# Specification

## Summary
**Goal:** Extend the vendor reviews system (Stage 11) with aggregate rating display across the directory and storefront pages, plus a backend summary query and a sort-by-rating feature.

**Planned changes:**
- Add a `getVendorRatingSummary` query to the Motoko backend that returns `averageRating` (Float) and `reviewCount` (Nat) for a given vendor ID
- Add a `useVendorRatingSummary(vendorId)` React Query hook in `useQueries.ts` that calls the new backend query
- Display an average star rating badge (or "No reviews yet") on each vendor card in VendorDirectoryPage using the new hook
- Show average star rating and total review count in the VendorStorePage header/hero section, updating reactively when new reviews are submitted
- Add a "Top Rated" / "Rating" sort option to VendorDirectoryPage sort controls that sorts vendors descending by average rating and syncs to URL params

**User-visible outcome:** Users browsing the vendor directory see star ratings on each vendor card and can sort by highest-rated vendors. Visitors to a vendor's storefront see the vendor's overall rating and review count at a glance.
