import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useGetMyVendor,
  useCreateVendor,
  useGetMyVendorBalance,
  useWithdrawVendorBalance,
  useListOrdersByVendor,
  useUpdateOrderStatus,
} from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Store, Loader2, Wallet, Package } from 'lucide-react';
import { toast } from 'sonner';
import { OrderStatus } from '../backend';

export default function VendorPage() {
  const { identity } = useInternetIdentity();
  const { data: vendor, isLoading: vendorLoading } = useGetMyVendor();
  const { data: balance = BigInt(0) } = useGetMyVendorBalance();
  const { data: orders = [] } = useListOrdersByVendor(vendor?.id);
  const createVendor = useCreateVendor();
  const withdrawBalance = useWithdrawVendorBalance();
  const updateOrderStatus = useUpdateOrderStatus();

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const isAuthenticated = !!identity;

  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || !bio.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    try {
      await createVendor.mutateAsync({ displayName, bio });
      toast.success('Vendor created successfully!');
      setDisplayName('');
      setBio('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create vendor');
    }
  };

  const handleWithdraw = async () => {
    const amount = BigInt(withdrawAmount || '0');
    if (amount <= BigInt(0)) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (amount > balance) {
      toast.error('Insufficient balance');
      return;
    }
    try {
      await withdrawBalance.mutateAsync(amount);
      toast.success('Withdrawal successful!');
      setWithdrawAmount('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to withdraw');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus.mutateAsync({ orderId, newStatus });
      toast.success('Order status updated!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update order status');
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'fulfilled':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'declined':
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-16">
        <Card className="max-w-2xl mx-auto text-center">
          <CardHeader>
            <CardTitle className="text-2xl">Vendor Access Required</CardTitle>
            <CardDescription>Please log in to manage your vendor account</CardDescription>
          </CardHeader>
          <CardContent>
            <Store className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Create your vendor profile and start selling products.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (vendorLoading) {
    return (
      <div className="container py-16">
        <div className="flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // Vendor Onboarding
  if (!vendor) {
    return (
      <div className="container py-12">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Store className="h-10 w-10 text-primary" />
              Become a Vendor
            </h1>
            <p className="text-muted-foreground">Create your vendor profile to start selling</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Vendor Registration</CardTitle>
              <CardDescription>Fill in your vendor details to get started</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateVendor} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Display Name</label>
                  <Input
                    placeholder="Your vendor name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Bio</label>
                  <Textarea
                    placeholder="Tell customers about your business..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={createVendor.isPending}>
                  {createVendor.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Creating Vendor...
                    </>
                  ) : (
                    'Create Vendor Profile'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Vendor Dashboard
  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Store className="h-10 w-10 text-primary" />
          Vendor Dashboard
        </h1>
        <p className="text-muted-foreground">Manage your products, orders, and earnings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Vendor Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Display Name</p>
              <p className="font-bold">{vendor.displayName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bio</p>
              <p className="text-sm">{vendor.bio}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Balance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Available Balance</p>
              <p className="text-3xl font-bold text-primary">{Number(balance)} ICP</p>
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Amount"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                min="1"
              />
              <Button onClick={handleWithdraw} disabled={withdrawBalance.isPending}>
                {withdrawBalance.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Withdraw'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="text-3xl font-bold">{orders.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Management</CardTitle>
          <CardDescription>View and manage orders for your products</CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No orders yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Product ID</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">{order.id.slice(0, 12)}...</TableCell>
                    <TableCell className="font-mono text-xs">{order.productId.slice(0, 12)}...</TableCell>
                    <TableCell>{Number(order.quantity)}</TableCell>
                    <TableCell className="font-bold">{Number(order.totalAmount)} ICP</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(order.status)} className="capitalize">
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Select
                        value={order.status}
                        onValueChange={(value) => handleUpdateOrderStatus(order.id, value as OrderStatus)}
                        disabled={updateOrderStatus.isPending}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="fulfilled">Fulfilled</SelectItem>
                          <SelectItem value="declined">Declined</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
