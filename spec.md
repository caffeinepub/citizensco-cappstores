# CitizensCo CAppStores

## Current State

The app has a full multi-vendor e-commerce backend (Motoko) and a React/TS frontend.

Backend `Product` type currently:
```
{ id, vendorId, name, description, price, stock, createdAt }
```
There is no image field on products.

Frontend:
- `ProductCard` renders product name, description, price, stock badge — no image.
- `ShopPage` renders a grid of `ProductCard` components with skeleton loaders that have no image placeholder.
- `VendorStorePage` renders a grid of `ProductCard` components — no image display.
- `VendorProductCreateForm` lets vendors create products (name, description, price, stock) — no image upload.
- `MyProductsSection` (in vendor dashboard) shows a compact list — no image thumbnail.

## Requested Changes (Diff)

### Add
- `imageUrl : ?Text` optional field to the `Product` Motoko type so vendors can attach an image URL to each product.
- Image URL input field in `VendorProductCreateForm` (text input accepting a URL string).
- Product image display in `ProductCard`: show the image at the top of the card when `imageUrl` is present; show a placeholder icon when absent.
- Thumbnail in `MyProductsSection` compact list rows.

### Modify
- `VendorProductCreateForm`: include `imageUrl` in the `Product` object sent to the backend (optional, defaults to `[]` / `null`).
- `ProductCard`: add an image zone at the card top.
- `ShopPage` skeleton loaders: add image placeholder height to match new card layout.
- `VendorStorePage` skeleton loaders: add image placeholder height.
- `MyProductsSection`: show small thumbnail next to product name.

### Remove
- Nothing removed.

## Implementation Plan

1. **Backend**: Add `imageUrl : ?Text` to the `Product` record type in `main.mo`. No other logic changes needed.
2. **Frontend — VendorProductCreateForm**: Add an optional "Product Image URL" text input. Pass `imageUrl: [urlValue]` (or `[]` if empty) when constructing the `Product` object.
3. **Frontend — ProductCard**: Add an image zone at top. If `imageUrl` is present, render `<img>`. If absent, render a `Package` icon placeholder with a subtle background.
4. **Frontend — ShopPage**: Update skeleton loader to include an image placeholder row at the top.
5. **Frontend — VendorStorePage**: Update skeleton loader similarly.
6. **Frontend — MyProductsSection**: Add a small 48×48 thumbnail (or icon fallback) to the left of the product name in each list row.
