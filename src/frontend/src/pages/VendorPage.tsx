import { useState, useRef, useMemo } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useGetMyVendor,
  useCreateVendor,
  useGetVendorBalance,
  useWithdrawVendorBalance,
  useGetVendorOrders,
  useUpdateOrderStatus,
  useUpdateVendorProfile,
  useListPublicVendors,
} from '../hooks/useQueries';
import { useMyVendorProducts } from '../hooks/useMyVendorProducts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Store, Loader2, DollarSign, Package, ShoppingBag, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { OrderStatus } from '../types';
import VendorOnboarding from '../components/vendor/VendorOnboarding';
import VendorProductCreateForm from '../components/vendor/VendorProductCreateForm';
import MyProductsSection from '../components/vendor/MyProductsSection';
import VendorCategoryInput from '../components/vendor/VendorCategoryInput';
import { extractUniqueCategories } from '../utils/vendorDiscovery';

export default function VendorPage() {
  const { identity } = useInternetIdentity();
  const { data: vendor, isLoading: vendorLoading, isFetched: vendorFetched } = useGetMyVendor();
  const { data: balance = BigInt(0) } = useGetVendorBalance();
  const { data: vendorOrders = [], isLoading: ordersLoading } = useGetVendorOrders();
  const { products, isLoading: productsLoading, hasProducts } = useMyVendorProducts();
  const createVendor = useCreateVendor();
  const withdrawBalance = useWithdrawVendorBalance();
  const updateOrderStatus = useUpdateOrderStatus();
  const updateVendorProfile = useUpdateVendorProfile();

  // Fetch all public vendors for category suggestions
  const allVendorsQuery = useListPublicVendors();
  const categorySuggestions = useMemo(() => {
    if (allVendorsQuery.data) {
      return extractUniqueCategories(allVendorsQuery.data);
    }
    return [];
  }, [allVendorsQuery.data]);

  // Registration form state
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  // Profile edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editCategories, setEditCategories] = useState<string[]>([]);

  const [withdrawAmount, setWithdrawAmount] = useState('');

  const productFormRef = useRef<HTMLDivElement>(null);

  const isAuthenticated = !!identity;

  // Determine onboarding state
  const isOnboardingIncomplete = vendor && !hasProducts;

  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      toast.error('Please enter a vendor name');
      return;
    }

    try {
      await createVendor.mutateAsync({ 
        displayName: displayName.trim(), 
        bio: bio.trim(),
        categories: categories
      });
      toast.success('Vendor created successfully!');
      setDisplayName('');
      setBio('');
      setCategories([]);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create vendor');
    }
  };

  const handleStartEditProfile = () => {
    if (vendor) {
      setEditDisplayName(vendor.displayName || '');
      setEditBio(vendor.bio || '');
      setEditCategories(vendor.categories || []);
      setIsEditingProfile(true);
    }
  };

  const handleCancelEditProfile = () => {
    setIsEditingProfile(false);
    setEditDisplayName('');
    setEditBio('');
    setEditCategories([]);
  };

  const handleSaveProfile = async () => {
    if (!editDisplayName.trim()) {
      toast.error('Please enter a vendor name');
      return;
    }

    try {
      await updateVendorProfile.mutateAsync({
        displayName: editDisplayName.trim(),
        bio: editBio.trim(),
        categories: editCategories,
      });
      toast.success('Profile updated successfully!');
      setIsEditingProfile(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    }
  };

  const handleWithdraw = async () => {
    const amount = BigInt(withdrawAmount);
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

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await updateOrderStatus.mutateAsync({ orderId, status });
      toast.success('Order status updated!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  const handleScrollToProductForm = () => {
    productFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'paid':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'shipped':
        return 'outline';
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
            <CardDescription>Please log in to access vendor features</CardDescription>
          </CardHeader>
          <CardContent>
            <Store className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Create your vendor account and start selling.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (vendorLoading) {
    return (
      <div className="container py-16 text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Loading vendor information...</p>
      </div>
    );
  }

  if (!vendor && vendorFetched) {
    return (
      <div className="container py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Store className="h-10 w-10 text-primary" />
            Become a Vendor
          </h1>
          <p className="text-muted-foreground">Create your vendor account to start selling</p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Vendor Registration</CardTitle>
            <CardDescription>Fill in your vendor details to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateVendor} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Vendor Name *</Label>
                <Input
                  id="displayName"
                  placeholder="Enter your vendor name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio (Optional)</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about your business"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                />
              </div>

              <VendorCategoryInput
                label="Categories (Optional)"
                placeholder="Add a category (e.g., Electronics, Fashion)"
                categories={categories}
                onCategoriesChange={setCategories}
                suggestions={categorySuggestions}
                disabled={createVendor.isPending}
              />

              <Button type="submit" className="w-full" disabled={createVendor.isPending}>
                {createVendor.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating Vendor...
                  </>
                ) : (
                  'Create Vendor Account'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-12 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Store className="h-10 w-10 text-primary" />
          Vendor Dashboard
        </h1>
        <p className="text-muted-foreground">Manage your vendor account, products, and orders</p>
      </div>

      {/* Onboarding Alert */}
      {isOnboardingIncomplete && (
        <VendorOnboarding
          hasVendor={!!vendor}
          hasProducts={hasProducts}
          onScrollToProductForm={handleScrollToProductForm}
        />
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">
              {(Number(balance) / 100000000).toFixed(2)} ICP
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <ShoppingBag className="h-4 w-4" />
              Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{products.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <Package className="h-4 w-4" />
              Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{vendorOrders.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Vendor Info & Balance Management */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Vendor Profile</CardTitle>
                <CardDescription>Your vendor profile details</CardDescription>
              </div>
              {!isEditingProfile && (
                <Button variant="outline" size="sm" onClick={handleStartEditProfile}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditingProfile ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="editDisplayName">Display Name</Label>
                  <Input
                    id="editDisplayName"
                    value={editDisplayName}
                    onChange={(e) => setEditDisplayName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editBio">Bio</Label>
                  <Textarea
                    id="editBio"
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    rows={3}
                  />
                </div>
                <VendorCategoryInput
                  label="Categories"
                  placeholder="Add a category"
                  categories={editCategories}
                  onCategoriesChange={setEditCategories}
                  suggestions={categorySuggestions}
                  disabled={updateVendorProfile.isPending}
                />
                <div className="flex gap-2">
                  <Button onClick={handleSaveProfile} disabled={updateVendorProfile.isPending}>
                    {updateVendorProfile.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                  <Button variant="outline" onClick={handleCancelEditProfile}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Display Name</p>
                  <p className="text-lg font-semibold">{vendor?.displayName}</p>
                </div>
                {vendor?.bio && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Bio</p>
                    <p className="text-sm">{vendor.bio}</p>
                  </div>
                )}
                {vendor?.categories && vendor.categories.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Categories</p>
                    <div className="flex flex-wrap gap-2">
                      {vendor.categories.map((category, idx) => (
                        <Badge key={idx} variant="secondary">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Vendor ID</p>
                  <p className="font-mono text-xs break-all text-muted-foreground">{vendor?.id}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Balance Management</CardTitle>
            <CardDescription>Withdraw your earnings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Available Balance</p>
              <p className="text-2xl font-bold text-primary">
                {(Number(balance) / 100000000).toFixed(8)} ICP
              </p>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="withdrawAmount">Withdraw Amount (e8s)</Label>
              <Input
                id="withdrawAmount"
                type="number"
                placeholder="Enter amount in e8s"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                1 ICP = 100,000,000 e8s
              </p>
            </div>
            <Button
              onClick={handleWithdraw}
              disabled={withdrawBalance.isPending || !withdrawAmount}
              className="w-full"
            >
              {withdrawBalance.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                'Withdraw'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Products Section */}
      <MyProductsSection
        products={products}
        isLoading={productsLoading}
        onScrollToProductForm={handleScrollToProductForm}
      />

      {/* Create Product Form */}
      <div ref={productFormRef}>
        <VendorProductCreateForm />
      </div>

      {/* Orders Section */}
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>Manage your customer orders</CardDescription>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">Loading orders...</p>
            </div>
          ) : vendorOrders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">No orders yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendorOrders.map((order) => {
                  const product = products.find((p) => p.id === order.productId);
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs">
                        {order.id.slice(0, 12)}...
                      </TableCell>
                      <TableCell>{product?.name || 'Unknown'}</TableCell>
                      <TableCell>{Number(order.quantity)}</TableCell>
                      <TableCell>{(Number(order.totalAmount) / 100000000).toFixed(2)} ICP</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {order.status === OrderStatus.pending && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateStatus(order.id, OrderStatus.paid)}
                            >
                              Mark Paid
                            </Button>
                          )}
                          {order.status === OrderStatus.paid && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateStatus(order.id, OrderStatus.shipped)}
                            >
                              Mark Shipped
                            </Button>
                          )}
                          {order.status === OrderStatus.shipped && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateStatus(order.id, OrderStatus.delivered)}
                            >
                              Mark Delivered
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
