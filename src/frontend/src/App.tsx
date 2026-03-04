import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import AdminPanel from "./components/AdminPanel";
import Footer from "./components/Footer";
import Header from "./components/Header";
import StripeSetupModal from "./components/StripeSetupModal";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import DiscoveryHubPage from "./pages/DiscoveryHubPage";
import GlobalDashboardPage from "./pages/GlobalDashboardPage";
import MarketplacePage from "./pages/MarketplacePage";
import OrdersPage from "./pages/OrdersPage";
import RewardsPage from "./pages/RewardsPage";
import ShopPage from "./pages/ShopPage";
import VendorDirectoryPage from "./pages/VendorDirectoryPage";
import VendorPage from "./pages/VendorPage";
import VendorStorePage from "./pages/VendorStorePage";
import WalletPage from "./pages/WalletPage";

// Layout component with Header and Footer
function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      {/* StripeSetupModal is self-contained — manages its own open state */}
      <StripeSetupModal />
      <Toaster />
    </div>
  );
}

// Define routes
const rootRoute = createRootRoute({ component: Layout });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: MarketplacePage,
});

const walletRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/wallet",
  component: WalletPage,
});

const rewardsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/rewards",
  component: RewardsPage,
});

const discoveryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/discovery",
  component: DiscoveryHubPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: GlobalDashboardPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: () => <AdminPanel onClose={() => window.history.back()} />,
});

const shopRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/shop",
  component: ShopPage,
});

const ordersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/orders",
  component: OrdersPage,
});

const vendorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/vendor",
  component: VendorPage,
});

const vendorsDirectoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/vendors",
  component: VendorDirectoryPage,
});

const vendorStoreRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/vendors/$vendorId",
  component: VendorStorePage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  walletRoute,
  rewardsRoute,
  discoveryRoute,
  dashboardRoute,
  adminRoute,
  shopRoute,
  ordersRoute,
  vendorRoute,
  vendorsDirectoryRoute,
  vendorStoreRoute,
]);

const router = createRouter({ routeTree });

export default function App() {
  const { isInitializing } = useInternetIdentity();

  if (isInitializing) {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="text-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
            <p className="text-muted-foreground">Initializing...</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
