# Specification

## Summary
**Goal:** Make vendor category storage, filtering, and selection more consistent and easier to use.

**Planned changes:**
- Normalize and de-duplicate vendor categories on backend writes (createVendor, updateVendorProfile) by trimming, collapsing whitespace, and handling case consistently; reject empty/whitespace-only categories with a clear error.
- Refine backend filtering for listPublicVendorsByCategory to use case-insensitive, whitespace-normalized equality matching (no substring/partial matches).
- Update the VendorCategoryInput UX so suggestions can show on focus (even when empty), improve keyboard navigation (highlight + Enter to add), and support Escape/outside-click to close without removing selected categories.

**User-visible outcome:** Vendor categories behave consistently across creation, editing, and browsing: duplicates are prevented, category filtering is exact (after normalization), and selecting categories is easier with better suggestions and keyboard controls.
