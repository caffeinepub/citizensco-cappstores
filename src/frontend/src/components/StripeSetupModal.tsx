import { useState, useEffect } from 'react';
import { useIsCallerAdmin, useIsStripeConfigured, useSetStripeConfiguration } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function StripeSetupModal() {
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: isConfigured, isLoading } = useIsStripeConfigured();
  const setConfig = useSetStripeConfiguration();
  const [open, setOpen] = useState(false);
  const [secretKey, setSecretKey] = useState('');
  const [countries, setCountries] = useState('US,CA,GB,EU');

  useEffect(() => {
    if (isAdmin && !isLoading && isConfigured === false) {
      setOpen(true);
    }
  }, [isAdmin, isConfigured, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secretKey.trim()) {
      toast.error('Please enter your Stripe secret key');
      return;
    }

    const allowedCountries = countries.split(',').map(c => c.trim()).filter(c => c);
    if (allowedCountries.length === 0) {
      toast.error('Please enter at least one country code');
      return;
    }

    try {
      await setConfig.mutateAsync({ secretKey: secretKey.trim(), allowedCountries });
      toast.success('Stripe configured successfully!');
      setOpen(false);
    } catch (error) {
      toast.error('Failed to configure Stripe');
      console.error(error);
    }
  };

  if (!isAdmin || isConfigured) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configure Stripe Payment</DialogTitle>
          <DialogDescription>
            Set up Stripe to enable payment processing for the marketplace.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="secretKey">Stripe Secret Key</Label>
            <Input
              id="secretKey"
              type="password"
              placeholder="sk_test_..."
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="countries">Allowed Countries (comma-separated)</Label>
            <Input
              id="countries"
              placeholder="US,CA,GB,EU"
              value={countries}
              onChange={(e) => setCountries(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Example: US, CA, GB, EU
            </p>
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={setConfig.isPending}>
              {setConfig.isPending ? 'Configuring...' : 'Configure Stripe'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Skip
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
