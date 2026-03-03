# Specification

## Summary
**Goal:** Add a dedicated backend query for vendor rating summaries and wire it up to the frontend via a React Query hook, replacing frontend-side aggregation.

**Planned changes:**
- Add `getVendorRatingSummary(vendorId: Principal)` public query in `backend/main.mo` returning average rating (Float), total review count (Nat), and per-star breakdown (counts for stars 1–5); returns a zeroed summary when no reviews exist
- Add `useGetVendorRatingSummary(vendorId)` React Query hook in `frontend/src/hooks/useQueries.ts` calling the new backend query
- Update `VendorCard.tsx`, `VendorStorePage.tsx`, and `VendorReviewsSection.tsx` to use the new hook instead of computing rating summaries from raw reviews
- Handle loading and error states in the hook with appropriate fallback UI

**User-visible outcome:** Vendor rating summaries (average star rating, review count, per-star breakdown) are now computed on the backend and fetched efficiently, with proper loading and error states shown in vendor cards and pages.
