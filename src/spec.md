# Specification

## Summary
**Goal:** Wire the React frontend to the new e-commerce backend canister endpoints and prevent non-admin users from calling admin-only analytics.

**Planned changes:**
- Add React Query query/mutation hooks in `frontend/src/hooks/useQueries.ts` for: `createVendor`, `getMyVendor`, `getVendorById`, `createProduct`, `updateProduct`, `listProducts`, `listProductsByVendor`, `createOrder`, `getOrder`, `updateOrderStatus`, `listMyOrders`, `listOrdersByVendor`, `creditVendor` (admin-only), `getMyVendorBalance`, `withdrawVendorBalance`, using the existing `useActor()` pattern and disabling hooks when the actor is unavailable.
- Ensure mutations invalidate the appropriate cached queries (e.g., product lists after create/update; order lists after create/status update; vendor balance after withdraw/credit).
- Update existing pages/components to use the new hooks instead of mock/local-only data for product browsing, vendor onboarding/dashboard, checkout/order placement, order history/detail, and vendor order management where present.
- Guard admin-only analytics usage so `getAllAnalytics` is only invoked for admins; non-admin pages render safely with empty/limited analytics defaults and no authorization traps.

**User-visible outcome:** Signed-in users can create and view vendor profiles, browse products, place orders, and view up-to-date order details using live backend data; vendor owners/admins can manage vendor orders and order statuses where applicable; non-admin users no longer see unauthorized analytics errors while admin analytics continues to work for admins.
