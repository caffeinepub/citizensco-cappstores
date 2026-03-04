import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Coins,
  CreditCard,
  History,
  TrendingUp,
  Wallet,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useDepositToWallet,
  useGetWallet,
  useWithdrawFromWallet,
} from "../hooks/useQueries";

export default function WalletPage() {
  const { data: wallet, isLoading } = useGetWallet();
  const depositMutation = useDepositToWallet();
  const withdrawMutation = useWithdrawFromWallet();

  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const icpBalance = wallet?.icpBalance ?? BigInt(0);
  const stripeBalance = wallet?.stripeBalance ?? BigInt(0);
  const transactionHistory = wallet?.transactionHistory ?? [];

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number.parseFloat(depositAmount);
    if (Number.isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid deposit amount");
      return;
    }
    const totalAmount = BigInt(Math.round(amount * 1e8));
    try {
      await depositMutation.mutateAsync(totalAmount);
      toast.success("Deposit initiated successfully");
      setDepositAmount("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Deposit failed";
      toast.error(msg);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number.parseFloat(withdrawAmount);
    if (Number.isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid withdrawal amount");
      return;
    }
    const totalAmount = BigInt(Math.round(amount * 1e8));
    try {
      await withdrawMutation.mutateAsync(totalAmount);
      toast.success("Withdrawal initiated successfully");
      setWithdrawAmount("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Withdrawal failed";
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Wallet className="h-7 w-7 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">Wallet</h1>
          </div>
          <p className="text-muted-foreground">
            Manage your ICP and fiat balances, deposits, and withdrawals.
          </p>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Card className="border border-border/60">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Coins className="h-4 w-4" />
                ICP Balance
              </CardDescription>
              <CardTitle className="text-2xl">
                {isLoading ? (
                  <Skeleton className="h-8 w-32" />
                ) : (
                  `${(Number(icpBalance) / 1e8).toFixed(4)} ICP`
                )}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="border border-border/60">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Fiat Balance (Stripe)
              </CardDescription>
              <CardTitle className="text-2xl">
                {isLoading ? (
                  <Skeleton className="h-8 w-32" />
                ) : (
                  `$${(Number(stripeBalance) / 100).toFixed(2)}`
                )}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Deposit / Withdraw Tabs */}
        <Card className="mb-8 border border-border/60">
          <CardContent className="pt-6">
            <Tabs defaultValue="deposit">
              <TabsList className="mb-6 w-full">
                <TabsTrigger value="deposit" className="flex-1">
                  <ArrowDownCircle className="h-4 w-4 mr-2" />
                  Deposit
                </TabsTrigger>
                <TabsTrigger value="withdraw" className="flex-1">
                  <ArrowUpCircle className="h-4 w-4 mr-2" />
                  Withdraw
                </TabsTrigger>
              </TabsList>

              <TabsContent value="deposit">
                <form onSubmit={handleDeposit} className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="deposit-amount">Amount (ICP)</Label>
                    <Input
                      id="deposit-amount"
                      type="number"
                      placeholder="0.0000"
                      min="0"
                      step="0.0001"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={depositMutation.isPending}
                  >
                    {depositMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <span className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Processing…
                      </span>
                    ) : (
                      "Deposit"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="withdraw">
                <form onSubmit={handleWithdraw} className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="withdraw-amount">Amount (ICP)</Label>
                    <Input
                      id="withdraw-amount"
                      type="number"
                      placeholder="0.0000"
                      min="0"
                      step="0.0001"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={withdrawMutation.isPending}
                  >
                    {withdrawMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <span className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Processing…
                      </span>
                    ) : (
                      "Withdraw"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card className="border border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <History className="h-5 w-5 text-primary" />
              Transaction History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {["sk-a", "sk-b", "sk-c", "sk-d"].map((id) => (
                  <Skeleton key={id} className="h-12 w-full" />
                ))}
              </div>
            ) : transactionHistory.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <TrendingUp className="h-8 w-8 mx-auto mb-3 opacity-40" />
                <p className="text-sm">No transactions yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {transactionHistory.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between py-3 border-b border-border/40 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      {tx.type === "deposit" ? (
                        <ArrowDownCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowUpCircle className="h-4 w-4 text-orange-500" />
                      )}
                      <div>
                        <p className="font-medium text-sm capitalize">
                          {tx.type}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(
                            Number(tx.timestamp) / 1_000_000,
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">
                        {(Number(tx.amount) / 1e8).toFixed(4)} ICP
                      </p>
                      <Badge variant="outline" className="text-xs capitalize">
                        {tx.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
