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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { Principal } from "@dfinity/principal";
import {
  DollarSign,
  Edit2,
  Loader2,
  Package,
  ShoppingBag,
  Star,
  Store,
} from "lucide-react";
import type React from "react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { OrderStatus } from "../backend";
import MyProductsSection from "../components/vendor/MyProductsSection";
import VendorCategoryInput from "../components/vendor/VendorCategoryInput";
import VendorOnboarding from "../components/vendor/VendorOnboarding";
import VendorProductCreateForm from "../components/vendor/VendorProductCreateForm";
import VendorReviewsSection from "../components/vendor/VendorReviewsSection";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useMyVendorProducts } from "../hooks/useMyVendorProducts";
import {
  useCreateVendor,
  useGetAverageRating,
  useGetVendor,
  useGetVendorBalance,
  useGetVendorOrders,
  useGetVendorReviews,
  useListPublicVendors,
  useUpdateOrderStatus,
  useUpdateVendorProfile,
  useWithdrawVendorBalance,
} from "../hooks/useQueries";
import { extractUniqueCategories } from "../utils/vendorDiscovery";

export default function VendorPage() {
  const { identity } = useInternetIdentity();
  const callerPrincipal: Principal | null = identity?.getPrincipal() ?? null;

  const {
    data: vendor,
    isLoading: vendorLoading,
    isFetched: vendorFetched,
  } = useGetVendor(callerPrincipal);

  const { data: balance = BigInt(0) } = useGetVendorBalance(callerPrincipal);
  const { data: vendorOrders = [], isLoading: ordersLoading } =
    useGetVendorOrders();

  const vendorIdStr = vendor?.principalId?.toString() ?? "";
  const {
    products,
    isLoading: _productsLoading,
    hasProducts,
  } = useMyVendorProducts(vendorIdStr || null);

  const { data: reviews = [] } = useGetVendorReviews(vendorIdStr);
  const { data: averageRating = 0 } = useGetAverageRating(vendorIdStr);

  const createVendor = useCreateVendor();
  const withdrawBalance = useWithdrawVendorBalance();
  const updateOrderStatus = useUpdateOrderStatus();
  const updateVendorProfile = useUpdateVendorProfile();

  const allVendorsQuery = useListPublicVendors();
  const categorySuggestions = useMemo(() => {
    if (allVendorsQuery.data) {
      return extractUniqueCategories(allVendorsQuery.data);
    }
    return [];
  }, [allVendorsQuery.data]);

  // Registration form state
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [categories, setCategories] = useState<string[]>([]);

  // Profile edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editCategories, setEditCategories] = useState<string[]>([]);

  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [showProductForm, setShowProductForm] = useState(false);

  const productFormRef = useRef<HTMLDivElement>(null);

  const isAuthenticated = !!identity;
  const isOnboardingIncomplete = vendor && !hasProducts;
  const hasReviews = reviews.length > 0;

  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      toast.error("Please enter a vendor name");
      return;
    }
    try {
      await createVendor.mutateAsync({
        displayName: displayName.trim(),
        bio: bio.trim(),
        categories,
      });
      toast.success("Vendor created successfully!");
      setDisplayName("");
      setBio("");
      setCategories([]);
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "Failed to create vendor";
      toast.error(msg);
    }
  };

  const handleStartEditProfile = () => {
    if (vendor) {
      setEditDisplayName(vendor.displayName ?? "");
      setEditBio(vendor.bio ?? "");
      setEditCategories(vendor.categories ?? []);
      setIsEditingProfile(true);
    }
  };

  const handleCancelEditProfile = () => {
    setIsEditingProfile(false);
  };

  const handleSaveProfile = async () => {
    if (!editDisplayName.trim()) {
      toast.error("Please enter a vendor name");
      return;
    }
    try {
      await updateVendorProfile.mutateAsync({
        displayName: editDisplayName.trim(),
        bio: editBio.trim(),
        categories: editCategories,
      });
      toast.success("Profile updated successfully!");
      setIsEditingProfile(false);
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "Failed to update profile";
      toast.error(msg);
    }
  };

  const handleWithdraw = async () => {
    const parsed = Number.parseFloat(withdrawAmount);
    if (Number.isNaN(parsed) || parsed <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    const amount = BigInt(Math.round(parsed * 1e8));
    if (amount > balance) {
      toast.error("Insufficient balance");
      return;
    }
    try {
      await withdrawBalance.mutateAsync(amount);
      toast.success("Withdrawal successful!");
      setWithdrawAmount("");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to withdraw";
      toast.error(msg);
    }
  };

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await updateOrderStatus.mutateAsync({ orderId, status });
      toast.success("Order status updated!");
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "Failed to update status";
      toast.error(msg);
    }
  };

  const handleScrollToProductForm = () => {
    setShowProductForm(true);
    setTimeout(() => {
      productFormRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  const getStatusBadgeVariant = (
    status: string,
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "delivered":
      case "paid":
        return "default";
      case "pending":
        return "secondary";
      case "shipped":
        return "outline";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-16">
        <Card className="max-w-2xl mx-auto text-center">
          <CardHeader>
            <CardTitle className="text-2xl">Vendor Access Required</CardTitle>
            <CardDescription>
              Please log in to access vendor features
            </CardDescription>
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
          <p className="text-muted-foreground">
            Create your vendor account to start selling
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Vendor Registration</CardTitle>
            <CardDescription>
              Fill in your vendor details to get started
            </CardDescription>
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

              <Button
                type="submit"
                className="w-full"
                disabled={createVendor.isPending}
              >
                {createVendor.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating Vendor...
                  </>
                ) : (
                  "Create Vendor Account"
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
        <p className="text-muted-foreground">
          Manage your vendor account, products, and orders
        </p>
        {/* Average Rating in header */}
        {hasReviews && (
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-0.5">
              {([0, 1, 2, 3, 4] as const).map((i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.round(averageRating)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-muted text-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-medium">
              {averageRating.toFixed(1)}
            </span>
            <span className="text-sm text-muted-foreground">
              ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
            </span>
          </div>
        )}
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
              {(Number(balance) / 1e8).toFixed(4)} ICP
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

      {/* Tabs: Profile / Products / Orders / My Reviews */}
      <Tabs defaultValue="profile">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders" data-ocid="vendor.orders.tab">
            Orders
            {vendorOrders.length > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {vendorOrders.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="reviews">
            My Reviews
            {hasReviews && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {reviews.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Vendor Profile</CardTitle>
                    <CardDescription>
                      Your vendor profile details
                    </CardDescription>
                  </div>
                  {!isEditingProfile && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleStartEditProfile}
                    >
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
                      <Button
                        onClick={handleSaveProfile}
                        disabled={updateVendorProfile.isPending}
                      >
                        {updateVendorProfile.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancelEditProfile}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Display Name
                      </p>
                      <p className="text-lg font-semibold">
                        {vendor?.displayName}
                      </p>
                    </div>
                    {vendor?.bio && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          Bio
                        </p>
                        <p className="text-sm">{vendor.bio}</p>
                      </div>
                    )}
                    {vendor?.categories && vendor.categories.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">
                          Categories
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {vendor.categories.map((category) => (
                            <Badge key={category} variant="secondary">
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    <Separator />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Vendor ID
                      </p>
                      <p className="font-mono text-xs break-all text-muted-foreground">
                        {vendor?.principalId?.toString()}
                      </p>
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
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Available Balance
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {(Number(balance) / 1e8).toFixed(8)} ICP
                  </p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="withdrawAmount">Withdraw Amount (ICP)</Label>
                  <Input
                    id="withdrawAmount"
                    type="number"
                    step="0.0001"
                    min="0"
                    placeholder="0.0000"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                  />
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
                    "Withdraw"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                My Products
              </CardTitle>
              <CardDescription>Your product listings</CardDescription>
            </CardHeader>
            <CardContent>
              <MyProductsSection
                vendorId={vendorIdStr ?? ""}
                onAddProduct={handleScrollToProductForm}
              />
            </CardContent>
          </Card>

          {/* Create Product Form */}
          {(showProductForm || isOnboardingIncomplete) && (
            <div ref={productFormRef} className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Add New Product</CardTitle>
                  <CardDescription>
                    Create a new product listing for your store
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <VendorProductCreateForm
                    vendorId={vendorIdStr ?? ""}
                    onSuccess={() => setShowProductForm(false)}
                  />
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Orders
              </CardTitle>
              <CardDescription>Manage incoming orders</CardDescription>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : vendorOrders.length === 0 ? (
                <div className="text-center py-10">
                  <Package className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-muted-foreground text-sm">No orders yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendorOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-xs">
                          {order.id.slice(0, 12)}…
                        </TableCell>
                        <TableCell className="text-xs">
                          {order.productId.slice(0, 12)}…
                        </TableCell>
                        <TableCell>{order.quantity.toString()}</TableCell>
                        <TableCell>
                          {(Number(order.totalAmount) / 1e8).toFixed(4)} ICP
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(order.status)}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {order.status === OrderStatus.pending && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs h-7"
                                onClick={() =>
                                  handleUpdateStatus(order.id, OrderStatus.paid)
                                }
                              >
                                Mark Paid
                              </Button>
                            )}
                            {order.status === OrderStatus.paid && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs h-7"
                                onClick={() =>
                                  handleUpdateStatus(
                                    order.id,
                                    OrderStatus.shipped,
                                  )
                                }
                              >
                                Mark Shipped
                              </Button>
                            )}
                            {order.status === OrderStatus.shipped && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs h-7"
                                onClick={() =>
                                  handleUpdateStatus(
                                    order.id,
                                    OrderStatus.delivered,
                                  )
                                }
                              >
                                Mark Delivered
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Reviews Tab */}
        <TabsContent value="reviews">
          {vendorIdStr ? (
            <VendorReviewsSection vendorId={vendorIdStr} readOnly={true} />
          ) : (
            <div className="text-center py-10 text-muted-foreground text-sm">
              No vendor profile found.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
