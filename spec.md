# Specification

## Summary
**Goal:** Wire all remaining frontend pages to live backend data, complete pending integration tasks, and apply consistent UI polish across the CitizensCo CAppStores application.

**Planned changes:**
- Replace all mock/static analytics values in GlobalDashboardPage (views, clicks, active campaigns, reward pools, ad revenue) with live data fetched via React Query hooks against the backend actor.
- Audit all pages and components still using mock or local data and replace them with live React Query hooks covering all required backend calls.
- Apply UI polish across MarketplacePage, RewardsPage, ShopPage, VendorPage, VendorDirectoryPage, DiscoveryHubPage, OrdersPage, WalletPage, and AdminPanel to ensure consistent use of OKLCH design tokens for spacing, typography, badge styles, and card layouts.
- Ensure light and dark theme variants render correctly on all polished pages with no conflicting inline style overrides.

**User-visible outcome:** All dashboard and page metrics reflect live backend data with no mock values, and the entire app displays a visually consistent UI using the established design system across all pages and themes.
