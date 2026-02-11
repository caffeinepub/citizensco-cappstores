import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { 
  ShoppingItem, 
  UserRole, 
  RewardCampaign, 
  ExternalBlob, 
  UserProfile as BackendUserProfile,
  OrderStatus as BackendOrderStatus,
  Product as BackendProduct,
  Order as BackendOrder,
  Vendor as BackendVendor,
  ProjectEntry as BackendProjectEntry,
} from '../backend';
import { Principal } from '@dfinity/principal';
import { 
  AnalyticsEntry, 
  RevenueShareConfig, 
  Wallet, 
  Vendor, 
  Product, 
  Order, 
  OrderStatus,
  PublicVendor,
} from '../types';
import { useInternetIdentity } from './useInternetIdentity';
import { getReadableErrorMessage } from '../utils/errors';

// Authorization Queries
export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCallerUserRole() {
  const { actor, isFetching } = useActor();

  return useQuery<UserRole>({
    queryKey: ['callerUserRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<BackendUserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: { name: string; email?: string }) => {
      if (!actor) throw new Error('Actor not available');
      
      // Backend controls createdAt, so we pass a placeholder that will be ignored
      const backendProfile: BackendUserProfile = {
        name: profile.name,
        email: profile.email,
        createdAt: BigInt(0), // Backend will set this
      };
      
      await actor.saveCallerUserProfile(backendProfile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
    onError: (error: any) => {
      throw new Error(getReadableErrorMessage(error));
    },
  });
}

// Reward Campaign Queries
export function useGetRewardCampaigns() {
  const { actor, isFetching } = useActor();

  return useQuery<RewardCampaign[]>({
    queryKey: ['rewardCampaigns'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRewardCampaignsSample();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useJoinRewardCampaign() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaignId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.joinRewardCampaign(campaignId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewardCampaigns'] });
    },
    onError: (error: any) => {
      throw new Error(getReadableErrorMessage(error));
    },
  });
}

export function useCompleteRewardCampaign() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaignId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.completeRewardCampaign(campaignId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewardCampaigns'] });
    },
    onError: (error: any) => {
      throw new Error(getReadableErrorMessage(error));
    },
  });
}

export function useCreateRewardCampaign() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaign: RewardCampaign) => {
      if (!actor) throw new Error('Actor not available');
      await actor.createRewardCampaign(campaign);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewardCampaigns'] });
    },
    onError: (error: any) => {
      throw new Error(getReadableErrorMessage(error));
    },
  });
}

// Project Entry Queries
export function useListProjectEntries() {
  const { actor, isFetching } = useActor();

  return useQuery<BackendProjectEntry[]>({
    queryKey: ['projectEntries'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listProjectEntries();
    },
    enabled: !!actor && !isFetching,
  });
}

// Alias for backward compatibility
export const useGetProjectEntries = useListProjectEntries;

export function useAddProjectEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: BackendProjectEntry) => {
      if (!actor) throw new Error('Actor not available');
      await actor.addProjectEntry(entry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectEntries'] });
    },
    onError: (error: any) => {
      throw new Error(getReadableErrorMessage(error));
    },
  });
}

export function useTrackProjectView() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.trackProjectView(projectId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectEntries'] });
    },
  });
}

export function useTrackProjectClick() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.trackProjectClick(projectId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectEntries'] });
    },
  });
}

// Analytics - derived from project entries
export function useGetAllAnalytics() {
  const { data: projectEntries = [], isLoading, error } = useListProjectEntries();

  const analytics: AnalyticsEntry[] = projectEntries.map((entry) => ({
    projectId: entry.id,
    projectName: entry.name,
    clicks: Number(entry.clicks),
    views: Number(entry.views),
    conversionRate: Number(entry.views) > 0 ? (Number(entry.clicks) / Number(entry.views)) * 100 : 0,
  }));

  return {
    data: analytics,
    isLoading,
    error,
  };
}

// Vendor Queries
export function useGetMyVendor() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Vendor | null>({
    queryKey: ['myVendor'],
    queryFn: async () => {
      if (!actor || !identity) return null;
      const principal = identity.getPrincipal();
      const backendVendor = await actor.getVendor(principal);
      if (!backendVendor) return null;
      
      return {
        id: backendVendor.principalId.toString(),
        ownerPrincipal: backendVendor.vendorOwner,
        displayName: backendVendor.displayName,
        bio: backendVendor.bio,
        balance: backendVendor.balance,
        createdAt: Number(backendVendor.createdAt),
        categories: backendVendor.categories,
      };
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useCreateVendor() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { displayName: string; bio: string; categories: string[] }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.createVendor(params.displayName, params.bio, params.categories);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myVendor'] });
      queryClient.invalidateQueries({ queryKey: ['publicVendors'] });
    },
    onError: (error: any) => {
      throw new Error(getReadableErrorMessage(error));
    },
  });
}

export function useUpdateVendorProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async (params: { displayName: string; bio: string; categories: string[] }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateVendorProfile(params.displayName, params.bio, params.categories);
    },
    onSuccess: () => {
      // Invalidate all vendor-related queries
      queryClient.invalidateQueries({ queryKey: ['myVendor'] });
      queryClient.invalidateQueries({ queryKey: ['publicVendors'] });
      queryClient.invalidateQueries({ queryKey: ['publicVendorsByCategory'] });
      
      // Also invalidate specific vendor query if we have identity
      if (identity) {
        const vendorId = identity.getPrincipal().toString();
        queryClient.invalidateQueries({ queryKey: ['publicVendor', vendorId] });
      }
    },
    onError: (error: any) => {
      throw new Error(getReadableErrorMessage(error));
    },
  });
}

export function useGetVendorBalance() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<bigint>({
    queryKey: ['vendorBalance'],
    queryFn: async () => {
      if (!actor || !identity) return BigInt(0);
      const principal = identity.getPrincipal();
      return actor.getVendorBalance(principal);
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useWithdrawVendorBalance() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (amount: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.withdrawVendorBalance(amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorBalance'] });
      queryClient.invalidateQueries({ queryKey: ['myVendor'] });
    },
    onError: (error: any) => {
      throw new Error(getReadableErrorMessage(error));
    },
  });
}

// Public Vendor Queries (no auth required)
export function useListPublicVendors() {
  const { actor, isFetching } = useActor();

  return useQuery<PublicVendor[]>({
    queryKey: ['publicVendors'],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Backend not available');
      }
      const vendors = await actor.listPublicVendors();
      return vendors.map((v) => ({
        id: v.principalId.toString(),
        principalId: v.principalId.toString(),
        displayName: v.displayName,
        bio: v.bio,
        createdAt: Number(v.createdAt),
        categories: v.categories,
      }));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useListPublicVendorsByCategory(category: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<PublicVendor[]>({
    queryKey: ['publicVendorsByCategory', category],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Backend not available');
      }
      if (!category) return [];
      
      const vendors = await actor.listPublicVendorsByCategory(category);
      return vendors.map((v) => ({
        id: v.principalId.toString(),
        principalId: v.principalId.toString(),
        displayName: v.displayName,
        bio: v.bio,
        createdAt: Number(v.createdAt),
        categories: v.categories,
      }));
    },
    enabled: !!actor && !isFetching && !!category,
  });
}

export function useGetPublicVendor(vendorId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<PublicVendor | null>({
    queryKey: ['publicVendor', vendorId],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Backend not available');
      }
      const principal = Principal.fromText(vendorId);
      const vendor = await actor.getPublicVendor(principal);
      if (!vendor) return null;
      
      return {
        id: vendor.principalId.toString(),
        principalId: vendor.principalId.toString(),
        displayName: vendor.displayName,
        bio: vendor.bio,
        createdAt: Number(vendor.createdAt),
        categories: vendor.categories,
      };
    },
    enabled: !!actor && !isFetching && !!vendorId,
  });
}

// Product Queries
export function useListProducts() {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      if (!actor) return [];
      const backendProducts = await actor.listProducts();
      return backendProducts.map((p) => ({
        id: p.id,
        vendorId: p.vendorId.toString(),
        name: p.name,
        description: p.description,
        price: p.price,
        stock: p.stock,
        createdAt: p.createdAt,
      }));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async (params: { name: string; description: string; price: bigint; stock: bigint }) => {
      if (!actor || !identity) throw new Error('Actor or identity not available');
      
      const vendorPrincipal = identity.getPrincipal();
      const productId = `product_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      const product: BackendProduct = {
        id: productId,
        vendorId: vendorPrincipal,
        name: params.name,
        description: params.description,
        price: params.price,
        stock: params.stock,
        createdAt: BigInt(Date.now()),
      };
      
      await actor.createProduct(product);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: any) => {
      throw new Error(getReadableErrorMessage(error));
    },
  });
}

// Order Queries
export function useGetOrders() {
  const { actor, isFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      if (!actor) return [];
      const backendOrders = await actor.listOrders();
      return backendOrders.map((o) => ({
        id: o.id,
        buyerPrincipal: o.customerId,
        customerId: o.customerId.toString(),
        vendorId: o.vendorId.toString(),
        productId: o.productId,
        quantity: o.quantity,
        totalAmount: o.totalAmount,
        status: o.status as OrderStatus,
        createdAt: o.createdAt,
      }));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetVendorOrders() {
  const { actor, isFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ['vendorOrders'],
    queryFn: async () => {
      if (!actor) return [];
      const backendOrders = await actor.getVendorOrders();
      return backendOrders.map((o) => ({
        id: o.id,
        buyerPrincipal: o.customerId,
        customerId: o.customerId.toString(),
        vendorId: o.vendorId.toString(),
        productId: o.productId,
        quantity: o.quantity,
        totalAmount: o.totalAmount,
        status: o.status as OrderStatus,
        createdAt: o.createdAt,
      }));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async (params: { vendorId: string; productId: string; quantity: bigint; totalAmount: bigint }) => {
      if (!actor || !identity) throw new Error('Actor or identity not available');
      
      const customerPrincipal = identity.getPrincipal();
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      const order: BackendOrder = {
        id: orderId,
        customerId: customerPrincipal,
        vendorId: Principal.fromText(params.vendorId),
        productId: params.productId,
        quantity: params.quantity,
        totalAmount: params.totalAmount,
        status: BackendOrderStatus.pending,
        createdAt: BigInt(Date.now()),
      };
      
      await actor.createOrder(order);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: any) => {
      throw new Error(getReadableErrorMessage(error));
    },
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { orderId: string; status: OrderStatus }) => {
      if (!actor) throw new Error('Actor not available');
      
      const backendStatus = params.status as BackendOrderStatus;
      await actor.updateOrderStatus(params.orderId, backendStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['vendorOrders'] });
    },
    onError: (error: any) => {
      throw new Error(getReadableErrorMessage(error));
    },
  });
}

// Stripe Queries
export function useIsStripeConfigured() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isStripeConfigured'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetStripeConfiguration() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: { secretKey: string; allowedCountries: string[] }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setStripeConfiguration(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isStripeConfigured'] });
    },
    onError: (error: any) => {
      throw new Error(getReadableErrorMessage(error));
    },
  });
}

export function useCreateCheckoutSession() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (items: ShoppingItem[]): Promise<{ id: string; url: string }> => {
      if (!actor) throw new Error('Actor not available');
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const successUrl = `${baseUrl}/payment-success`;
      const cancelUrl = `${baseUrl}/payment-failure`;
      const result = await actor.createCheckoutSession(items, successUrl, cancelUrl);
      const session = JSON.parse(result) as { id: string; url: string };
      if (!session?.url) {
        throw new Error('Stripe session missing url');
      }
      return session;
    },
    onError: (error: any) => {
      throw new Error(getReadableErrorMessage(error));
    },
  });
}

// Mock hooks for features not yet implemented in backend
export function useGetWallet() {
  return useQuery<Wallet>({
    queryKey: ['wallet'],
    queryFn: async () => ({
      icpBalance: BigInt(0),
      stripeBalance: BigInt(0),
      transactionHistory: [],
    }),
    enabled: false,
  });
}

export function useDepositToWallet() {
  return useMutation({
    mutationFn: async (_params?: { icpAmount: bigint; stripeAmount: bigint }) => {
      throw new Error('Wallet deposits not yet implemented');
    },
  });
}

export function useWithdrawFromWallet() {
  return useMutation({
    mutationFn: async (_params?: { icpAmount: bigint; stripeAmount: bigint }) => {
      throw new Error('Wallet withdrawals not yet implemented');
    },
  });
}

export function useCreateRevenueShareConfig() {
  return useMutation({
    mutationFn: async (config: RevenueShareConfig) => {
      throw new Error('Revenue share configuration not yet implemented');
    },
  });
}
