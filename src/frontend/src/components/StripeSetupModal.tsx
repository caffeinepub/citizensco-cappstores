import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  useIsCallerAdmin,
  useIsStripeConfigured,
  useSetStripeConfiguration,
} from "../hooks/useQueries";

/**
 * Self-contained Stripe setup modal — auto-opens for admins when Stripe is not yet configured.
 * No props required; manages its own open/close state.
 */
export default function StripeSetupModal() {
  const [open, setOpen] = useState(false);
  const [secretKey, setSecretKey] = useState("");
  const [countries, setCountries] = useState("US, CA, GB");

  const { data: isAdmin } = useIsCallerAdmin();
  const { data: isConfigured, isLoading: configLoading } =
    useIsStripeConfigured();
  const setConfig = useSetStripeConfiguration();

  // Auto-open for admins when Stripe is not configured
  useEffect(() => {
    if (isAdmin && !configLoading && isConfigured === false) {
      setOpen(true);
    }
  }, [isAdmin, isConfigured, configLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!secretKey.trim()) {
      toast.error("Stripe secret key is required");
      return;
    }

    const allowedCountries = countries
      .split(",")
      .map((c) => c.trim().toUpperCase())
      .filter(Boolean);

    if (allowedCountries.length === 0) {
      toast.error("At least one allowed country is required");
      return;
    }

    try {
      await setConfig.mutateAsync({
        secretKey: secretKey.trim(),
        allowedCountries,
      });
      toast.success("Stripe configuration saved successfully");
      setOpen(false);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to save Stripe configuration";
      toast.error(msg);
    }
  };

  if (!isAdmin) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configure Stripe Payments</DialogTitle>
          <DialogDescription>
            Set up Stripe to enable payment processing on the platform.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1">
            <Label htmlFor="stripe-secret-key">
              Secret Key <span className="text-destructive">*</span>
            </Label>
            <Input
              id="stripe-secret-key"
              type="password"
              placeholder="sk_live_... or sk_test_..."
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="stripe-countries">
              Allowed Countries <span className="text-destructive">*</span>
            </Label>
            <Input
              id="stripe-countries"
              placeholder="US, CA, GB, AU"
              value={countries}
              onChange={(e) => setCountries(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated ISO country codes (e.g. US, CA, GB)
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Skip for now
            </Button>
            <Button type="submit" disabled={setConfig.isPending}>
              {setConfig.isPending ? "Saving…" : "Save Configuration"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
