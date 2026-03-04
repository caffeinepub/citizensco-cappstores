import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  BarChart3,
  Compass,
  Gift,
  Menu,
  Moon,
  Package,
  Shield,
  ShoppingCart,
  Store,
  Sun,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsCallerAdmin } from "../hooks/useQueries";

export default function Header() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const isAuthenticated = !!identity;
  const disabled = loginStatus === "logging-in";
  const buttonText =
    loginStatus === "logging-in"
      ? "Logging in..."
      : isAuthenticated
        ? "Logout"
        : "Login";

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: "/" });
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error("Login error:", error);
        if (error.message === "User is already authenticated") {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <button
          type="button"
          className="flex items-center gap-3 cursor-pointer bg-transparent border-0 p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          onClick={() => navigate({ to: "/" })}
        >
          <img
            src="/assets/generated/logo.dim_200x200.png"
            alt="CitizensCo CAppStores"
            className="h-10 w-10"
          />
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary via-chart-1 to-chart-2 bg-clip-text text-transparent">
              CitizensCo CAppStores
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Decentralized DApp Marketplace
            </p>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: "/vendors" })}
            className="gap-2"
          >
            <Users className="h-4 w-4" />
            Vendors
          </Button>
          {isAuthenticated && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate({ to: "/shop" })}
                className="gap-2"
              >
                <ShoppingCart className="h-4 w-4" />
                Shop
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate({ to: "/orders" })}
                className="gap-2"
              >
                <Package className="h-4 w-4" />
                Orders
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate({ to: "/vendor" })}
                className="gap-2"
              >
                <Store className="h-4 w-4" />
                Vendor Dashboard
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate({ to: "/wallet" })}
                className="gap-2"
              >
                <Wallet className="h-4 w-4" />
                Wallet
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate({ to: "/rewards" })}
                className="gap-2"
              >
                <Gift className="h-4 w-4" />
                Rewards
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate({ to: "/discovery" })}
                className="gap-2"
              >
                <Compass className="h-4 w-4" />
                Discovery
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate({ to: "/dashboard" })}
                className="gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Dashboard
              </Button>
            </>
          )}
          {isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: "/admin" })}
              className="gap-2"
            >
              <Shield className="h-4 w-4" />
              Admin
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          <Button onClick={handleAuth} disabled={disabled} size="sm">
            {buttonText}
          </Button>
        </nav>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur">
          <nav className="container flex flex-col gap-2 py-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                navigate({ to: "/vendors" });
                setMobileMenuOpen(false);
              }}
              className="justify-start gap-2"
            >
              <Users className="h-4 w-4" />
              Vendors
            </Button>
            {isAuthenticated && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigate({ to: "/shop" });
                    setMobileMenuOpen(false);
                  }}
                  className="justify-start gap-2"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Shop
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigate({ to: "/orders" });
                    setMobileMenuOpen(false);
                  }}
                  className="justify-start gap-2"
                >
                  <Package className="h-4 w-4" />
                  Orders
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigate({ to: "/vendor" });
                    setMobileMenuOpen(false);
                  }}
                  className="justify-start gap-2"
                >
                  <Store className="h-4 w-4" />
                  Vendor Dashboard
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigate({ to: "/wallet" });
                    setMobileMenuOpen(false);
                  }}
                  className="justify-start gap-2"
                >
                  <Wallet className="h-4 w-4" />
                  Wallet
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigate({ to: "/rewards" });
                    setMobileMenuOpen(false);
                  }}
                  className="justify-start gap-2"
                >
                  <Gift className="h-4 w-4" />
                  Rewards
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigate({ to: "/discovery" });
                    setMobileMenuOpen(false);
                  }}
                  className="justify-start gap-2"
                >
                  <Compass className="h-4 w-4" />
                  Discovery
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigate({ to: "/dashboard" });
                    setMobileMenuOpen(false);
                  }}
                  className="justify-start gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  Dashboard
                </Button>
              </>
            )}
            {isAdmin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigate({ to: "/admin" });
                  setMobileMenuOpen(false);
                }}
                className="justify-start gap-2"
              >
                <Shield className="h-4 w-4" />
                Admin Panel
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setTheme(theme === "dark" ? "light" : "dark");
                setMobileMenuOpen(false);
              }}
              className="justify-start"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 mr-2" />
              ) : (
                <Moon className="h-4 w-4 mr-2" />
              )}
              Toggle Theme
            </Button>
            <Button onClick={handleAuth} disabled={disabled} size="sm">
              {buttonText}
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
