# Execution Plan

## Stage 1: Project Setup & Core Infrastructure ✅
- [x] Initialize React + TypeScript + Vite frontend
- [x] Configure Tailwind CSS with OKLCH color system
- [x] Set up TanStack Router with route definitions
- [x] Set up TanStack Query (React Query) provider
- [x] Configure shadcn/ui components
- [x] Create base layout with Header and Footer
- [x] Wire up Internet Identity authentication
- [x] Create useActor hook for backend communication

## Stage 2: User Authentication & Profile Management ✅
- [x] Implement login/logout with Internet Identity
- [x] Create ProfileSetupModal for first-time users
- [x] Implement useGetCallerUserProfile hook
- [x] Implement useSaveCallerUserProfile hook
- [x] Show profile setup modal on first login
- [x] Display user name in header after login
- [x] Handle anonymous/guest users gracefully

## Stage 3: Marketplace & DApp Listings ✅
- [x] Create MarketplacePage with DApp grid
- [x] Implement DAppCard component
- [x] Create AddDAppModal for submitting new DApps
- [x] Implement useListProjectEntries hook
- [x] Implement useCreateProject hook
- [x] Add search and sort functionality
- [x] Track views and clicks on DApp cards
- [x] Admin controls for managing listings

## Stage 4: Wallet & Payments ✅
- [x] Create WalletPage with ICP and fiat balances
- [x] Implement deposit/withdraw tabs
- [x] Display transaction history
- [x] Integrate Stripe configuration (admin)
- [x] Create StripeSetupModal
- [x] Implement useGetWallet hook
- [x] Handle bigint balance display

## Stage 5: Rewards Engine ✅
- [x] Create RewardsPage with campaign listings
- [x] Implement useGetRewardCampaigns hook
- [x] Add filter tabs (All/Active/Completed)
- [x] Implement join/complete campaign mutations
- [x] Create CreateRewardCampaignModal (admin)
- [x] Show per-card loading states
- [x] Display reward amounts in ICP

## Stage 6: Discovery Hub ✅
- [x] Create DiscoveryHubPage with trending DApps
- [x] Implement AI-powered recommendations panel
- [x] Show emerging DApps with growth potential
- [x] Display engagement leaderboard
- [x] Implement TalkOrTypeInput component
- [x] Add multilingual support indicators

## Stage 7: Global Dashboard & Analytics ✅
- [x] Create GlobalDashboardPage with unified metrics
- [x] Implement RevenueDashboard component
- [x] Show live reward campaign data
- [x] Display analytics charts with Recharts
- [x] Add AdminPanel with tabbed interface
- [x] Implement revenue share configuration modal

## Stage 8: Vendor Management ✅
- [x] Create VendorPage (vendor dashboard)
- [x] Implement vendor registration form
- [x] Add vendor profile editing
- [x] Create VendorOnboarding checklist component
- [x] Implement VendorProductCreateForm
- [x] Create MyProductsSection for vendor products
- [x] Add publish/unpublish vendor functionality
- [x] Implement useCreateVendor, useUpdateVendorProfile hooks
- [x] Add VendorCategoryInput with autocomplete

## Stage 9: Public Vendor Directory ✅
- [x] Create VendorDirectoryPage (public listing)
- [x] Implement category filtering with URL persistence
- [x] Add search functionality with debouncing
- [x] Create VendorStorePage (individual vendor storefront)
- [x] Display vendor profile header with bio and categories
- [x] Show vendor's product catalog
- [x] Add vendor discovery utilities (vendorDiscovery.ts)
- [x] Wire /vendors and /vendors/$vendorId routes in App.tsx
- [x] Add Vendors link to Header navigation

## Stage 10: Vendor Public Storefront & Product Orders ✅
- [x] Create ProductCard component with quantity selector
- [x] Implement order creation flow with useCreateOrder mutation
- [x] Add useGetOrder query hook for single order lookup
- [x] Create OrderConfirmationDialog with order details
- [x] Wire ProductCard into ShopPage replacing inline cards
- [x] Wire ProductCard into VendorStorePage
- [x] Show OrderConfirmationDialog after successful order placement
- [x] Add loading states during order submission (per-product spinner)
- [x] Display error messages via toast on order failure
- [x] Add OrderCreationRequest and OrderConfirmationData to types.ts
- [x] Navigate to /orders from OrderConfirmationDialog

## Stage 11: Orders System Polish & Admin Order Management (in progress)
- [x] Add status filter tabs with count badges to OrdersPage
- [x] Resolve product names in OrdersPage table (productMap)
- [x] Add product name display to OrderDetailDialog
- [x] Add "View Vendor Store" link in OrderDetailDialog
- [x] Add Orders badge count to VendorPage Orders tab
- [x] Add Orders tab to AdminPanel with full platform-wide order view
- [x] Admin order status filter (all/pending/paid/shipped/delivered/cancelled)
- [x] Admin order actions: Mark Paid, Mark Shipped, Mark Delivered, Cancel
- [x] Admin order table shows product name, vendor name, quantity, amount, date
- [ ] Product image support in ShopPage and VendorStorePage (next)
