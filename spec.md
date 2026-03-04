# CitizensCo CAppStores

## Current State

Stage 11 is in progress. The app has a fully working multi-vendor marketplace with:
- OrdersPage: shows a list of orders from `listOrders()` backend call, clicking a row opens `OrderDetailDialog`
- OrderDetailDialog: shows raw order fields (order ID, product ID, vendor ID, customer ID, quantity, amount, status)
- VendorPage Orders tab: lets vendors see and update incoming order statuses (pending → paid → shipped → delivered)
- Products are stored with id, name, description, price, stock, vendorId
- `listProducts()` is available from the backend to resolve product names by ID

## Requested Changes (Diff)

### Add
- Status filter tabs on OrdersPage (All / Pending / Paid / Shipped / Delivered / Cancelled)
- Product name resolution in OrdersPage table: resolve product name from `listProducts()` instead of showing raw productId
- Product name resolution in OrderDetailDialog: show product name alongside product ID
- "View Vendor Store" button in OrderDetailDialog linking to `/vendors/$vendorId`
- Order count summary badges on VendorPage Orders tab title (e.g. "Orders (3)")
- Empty state improvements: add helpful call-to-action text on OrdersPage when no orders match active filter

### Modify
- OrdersPage: add filter tab bar above the orders table; default to "All"
- OrderDetailDialog: enrich display with product name and vendor store link
- VendorPage Orders tab trigger: show order count badge next to "Orders" label

### Remove
- Nothing removed

## Implementation Plan

1. Create a `useProductMap` utility hook in `useQueries.ts` that calls `listProducts()` and returns a `Map<string, string>` of productId → productName
2. Update `OrdersPage.tsx`:
   - Add `useListProducts` query and build product name map
   - Add status filter tabs (All / Pending / Paid / Shipped / Delivered / Cancelled) with state
   - Filter displayed orders based on active tab
   - Replace raw `productId` display with resolved product name (fallback to truncated ID)
   - Add empty state message per filter tab
   - Add deterministic `data-ocid` markers on tabs and table rows
3. Update `OrderDetailDialog.tsx`:
   - Accept optional `productName` prop or resolve internally via `useListProducts`
   - Show product name in the detail grid
   - Add "View Vendor Store" link button routing to `/vendors/${order.vendorId}`
4. Update `VendorPage.tsx` Orders TabsTrigger:
   - Show order count badge next to "Orders" label
