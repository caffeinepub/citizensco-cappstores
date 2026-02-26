import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetWallet, useDepositToWallet, useWithdrawFromWallet } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wallet, ArrowDownToLine, ArrowUpFromLine, History, Coins, CreditCard, Zap } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

export default function WalletPage() {
  const { identity } = useInternetIdentity();
  const { data: wallet, isLoading } = useGetWallet();
  const depositMutation = useDepositToWallet();
  const withdrawMutation = useWithdrawFromWallet();

  const [depositIcp, setDepositIcp] = useState('');
  const [depositStripe, setDepositStripe] = useState('');
  const [withdrawIcp, setWithdrawIcp] = useState('');
  const [withdrawStripe, setWithdrawStripe] = useState('');

  const isAuthenticated = !!identity;

  const handleDeposit = async () => {
    const icpAmount = BigInt(Math.floor(parseFloat(depositIcp || '0') * 100000000));
    const stripeAmount = BigInt(Math.floor(parseFloat(depositStripe || '0') * 100));

    if (icpAmount === 0n && stripeAmount === 0n) {
      toast.error('Please enter an amount to deposit');
      return;
    }

    try {
      const totalAmount = icpAmount + stripeAmount;
      await depositMutation.mutateAsync({ amount: totalAmount });
      toast.success('Deposit successful with instant settlement!');
      setDepositIcp('');
      setDepositStripe('');
    } catch (error: any) {
      toast.error(error.message || 'Deposit failed');
    }
  };

  const handleWithdraw = async () => {
    const icpAmount = BigInt(Math.floor(parseFloat(withdrawIcp || '0') * 100000000));
    const stripeAmount = BigInt(Math.floor(parseFloat(withdrawStripe || '0') * 100));

    if (icpAmount === 0n && stripeAmount === 0n) {
      toast.error('Please enter an amount to withdraw');
      return;
    }

    try {
      const totalAmount = icpAmount + stripeAmount;
      await withdrawMutation.mutateAsync({ amount: totalAmount });
      toast.success('Withdrawal successful with instant settlement!');
      setWithdrawIcp('');
      setWithdrawStripe('');
    } catch (error: any) {
      toast.error(error.message || 'Withdrawal failed');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-16">
        <Card className="max-w-2xl mx-auto text-center">
          <CardHeader>
            <CardTitle className="text-2xl">Wallet Access Required</CardTitle>
            <CardDescription>Please log in to access your enhanced multi-currency wallet</CardDescription>
          </CardHeader>
          <CardContent>
            <Wallet className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Your wallet supports simultaneous real-time balances in ICP tokens and fiat currencies with instant settlement options.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Safely read wallet fields with fallbacks
  const icpBalance = wallet?.icpBalance ?? BigInt(0);
  const stripeBalance = wallet?.stripeBalance ?? BigInt(0);
  const transactionHistory = wallet?.transactionHistory ?? [];

  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Wallet className="h-10 w-10 text-primary" />
          Enhanced Multi-Currency Wallet
        </h1>
        <p className="text-muted-foreground">
          Manage your ICP and fiat balances with real-time updates and instant settlement
        </p>
      </div>

      {/* Balance Cards with Instant Settlement Badge */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-primary/10 to-chart-1/10 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-primary" />
                ICP Balance
              </CardTitle>
              <Badge variant="outline" className="gap-1">
                <Zap className="h-3 w-3" />
                Instant
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-3xl font-bold animate-pulse">...</div>
            ) : (
              <div className="text-3xl font-bold">
                {(Number(icpBalance) / 100000000).toFixed(8)} ICP
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-2">Internet Computer Protocol tokens</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-chart-2/10 to-accent/10 border-chart-2/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-chart-2" />
                Fiat Balance
              </CardTitle>
              <Badge variant="outline" className="gap-1">
                <Zap className="h-3 w-3" />
                Instant
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-3xl font-bold animate-pulse">...</div>
            ) : (
              <div className="text-3xl font-bold">
                ${(Number(stripeBalance) / 100).toFixed(2)}
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-2">Stripe-based fiat currency (USD)</p>
          </CardContent>
        </Card>
      </div>

      {/* Wallet Interface Image */}
      <div className="mb-8">
        <img 
          src="/assets/generated/wallet-interface.dim_400x300.png" 
          alt="Wallet Interface" 
          className="w-full max-w-md mx-auto rounded-lg shadow-lg"
        />
      </div>

      {/* Transactions */}
      <Tabs defaultValue="deposit" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="deposit">Deposit</TabsTrigger>
          <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="deposit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowDownToLine className="h-5 w-5" />
                Deposit Funds
              </CardTitle>
              <CardDescription>
                Add ICP tokens or fiat currency to your wallet with instant settlement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deposit-icp">ICP Amount</Label>
                <Input
                  id="deposit-icp"
                  type="number"
                  step="0.00000001"
                  placeholder="0.00000000"
                  value={depositIcp}
                  onChange={(e) => setDepositIcp(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deposit-stripe">Fiat Amount (USD)</Label>
                <Input
                  id="deposit-stripe"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={depositStripe}
                  onChange={(e) => setDepositStripe(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleDeposit} 
                disabled={depositMutation.isPending}
                className="w-full gap-2"
              >
                {depositMutation.isPending ? 'Processing...' : (
                  <>
                    <Zap className="h-4 w-4" />
                    Deposit with Instant Settlement
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdraw" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpFromLine className="h-5 w-5" />
                Withdraw Funds
              </CardTitle>
              <CardDescription>
                Transfer funds from your wallet with instant settlement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="withdraw-icp">ICP Amount</Label>
                <Input
                  id="withdraw-icp"
                  type="number"
                  step="0.00000001"
                  placeholder="0.00000000"
                  value={withdrawIcp}
                  onChange={(e) => setWithdrawIcp(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="withdraw-stripe">Fiat Amount (USD)</Label>
                <Input
                  id="withdraw-stripe"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={withdrawStripe}
                  onChange={(e) => setWithdrawStripe(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleWithdraw} 
                disabled={withdrawMutation.isPending}
                className="w-full gap-2"
              >
                {withdrawMutation.isPending ? 'Processing...' : (
                  <>
                    <Zap className="h-4 w-4" />
                    Withdraw with Instant Settlement
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Transaction History
              </CardTitle>
              <CardDescription>
                View your recent wallet transactions with instant settlement records
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-pulse text-muted-foreground">Loading transactions...</div>
                </div>
              ) : transactionHistory.length === 0 ? (
                <div className="text-center py-8">
                  <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No transactions yet</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {transactionHistory.map((transaction, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Coins className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{transaction}</p>
                            <p className="text-sm text-muted-foreground">Transaction #{index + 1}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="gap-1">
                          <Zap className="h-3 w-3" />
                          Instant
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
