import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { ProjectEntry, ShoppingItem, UserRole, AnalyticsEntry, RevenueShareConfig, UserProfile, Wallet, RewardCampaign, Vendor, Product, Order, OrderStatus, ExternalBlob } from '../backend';

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

  const query = useQuery<UserProfile | null>({
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
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Project Entries Queries
export function useGetProjectEntries() {
  const { actor, isFetching } = useActor();

  return useQuery<ProjectEntry[]>({
    queryKey: ['projectEntries'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProjectEntries();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddProjectEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: ProjectEntry) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addProjectEntry(entry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectEntries'] });
      queryClient.invalidateQueries({ queryKey: ['allAnalytics'] });
    },
  });
}

// Analytics Queries
export function useTrackProjectClick() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (projectId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.trackProjectClick(projectId);
    },
  });
}

export function useTrackProjectView() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (projectId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.trackProjectView(projectId);
    },
  });
}

export function useGetAllAnalytics(enabled: boolean = true) {
  const { actor, isFetching } = useActor();

  return useQuery<AnalyticsEntry[]>({
    queryKey: ['allAnalytics'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllAnalytics();
    },
    enabled: !!actor && !isFetching && enabled,
  });
}

export function useGetAnalytics(projectId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<AnalyticsEntry | null>({
    queryKey: ['analytics', projectId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getAnalytics(projectId);
    },
    enabled: !!actor && !isFetching && !!projectId,
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
      return actor.setStripeConfiguration(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isStripeConfigured'] });
    },
  });
}

export type CheckoutSession = {
  id: string;
  url: string;
};

export function useCreateCheckoutSession() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (items: ShoppingItem[]): Promise<CheckoutSession> => {
      if (!actor) throw new Error('Actor not available');
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const successUrl = `${baseUrl}/?payment=success`;
      const cancelUrl = `${baseUrl}/?payment=failure`;
      const result = await actor.createCheckoutSession(items, successUrl, cancelUrl);
      const session = JSON.parse(result) as CheckoutSession;
      return session;
    },
  });
}

// Revenue Share Config Queries
export function useCreateRevenueShareConfig() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: RevenueShareConfig) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createRevenueShareConfig(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revenueShareConfigs'] });
    },
  });
}

export function useUpdateRevenueShareConfig() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: RevenueShareConfig) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateRevenueShareConfig(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revenueShareConfigs'] });
    },
  });
}

export function useGetRevenueShareConfig(id: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<RevenueShareConfig | null>({
    queryKey: ['revenueShareConfig', id],
    queryFn: async () => {
      if (!actor || !id) return null;
      return actor.getRevenueShareConfig(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

// Wallet Queries
export function useGetWallet() {
  const { actor, isFetching } = useActor();

  return useQuery<Wallet | null>({
    queryKey: ['wallet'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getWallet();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useDepositToWallet() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ icpAmount, stripeAmount }: { icpAmount: bigint; stripeAmount: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.depositToWallet(icpAmount, stripeAmount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    },
  });
}

export function useWithdrawFromWallet() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ icpAmount, stripeAmount }: { icpAmount: bigint; stripeAmount: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.withdrawFromWallet(icpAmount, stripeAmount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    },
  });
}

// Reward Campaign Queries
export function useCreateRewardCampaign() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaign: RewardCampaign) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createRewardCampaign(campaign);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewardCampaigns'] });
    },
  });
}

export function useJoinRewardCampaign() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaignId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.joinRewardCampaign(campaignId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewardCampaigns'] });
    },
  });
}

export function useCompleteRewardCampaign() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaignId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.completeRewardCampaign(campaignId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['rewardCampaigns'] });
    },
  });
}

// E-commerce: Vendor Queries
export function useCreateVendor() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ displayName, bio }: { displayName: string; bio: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createVendor(displayName, bio);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myVendor'] });
      queryClient.invalidateQueries({ queryKey: ['vendorBalance'] });
    },
  });
}

export function useGetMyVendor() {
  const { actor, isFetching } = useActor();

  return useQuery<Vendor | null>({
    queryKey: ['myVendor'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMyVendor();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetVendorById(id: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<Vendor | null>({
    queryKey: ['vendor', id],
    queryFn: async () => {
      if (!actor || !id) return null;
      return actor.getVendorById(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

// E-commerce: Product Queries
export function useCreateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      vendorId,
      name,
      description,
      price,
      imageBlob,
      inventory,
    }: {
      vendorId: string;
      name: string;
      description: string;
      price: bigint;
      imageBlob: ExternalBlob;
      inventory: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createProduct(vendorId, name, description, price, imageBlob, inventory);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['vendorProducts'] });
    },
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      name,
      description,
      price,
      imageBlob,
      inventory,
    }: {
      productId: string;
      name: string;
      description: string;
      price: bigint;
      imageBlob: ExternalBlob;
      inventory: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateProduct(productId, name, description, price, imageBlob, inventory);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['vendorProducts'] });
    },
  });
}

export function useListProducts() {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useListProductsByVendor(vendorId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['vendorProducts', vendorId],
    queryFn: async () => {
      if (!actor || !vendorId) return [];
      return actor.listProductsByVendor(vendorId);
    },
    enabled: !!actor && !isFetching && !!vendorId,
  });
}

// E-commerce: Order Queries
export function useCreateOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      vendorId,
      productId,
      quantity,
    }: {
      vendorId: string;
      productId: string;
      quantity: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createOrder(vendorId, productId, quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myOrders'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['vendorProducts'] });
    },
  });
}

export function useGetOrder(orderId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<Order | null>({
    queryKey: ['order', orderId],
    queryFn: async () => {
      if (!actor || !orderId) return null;
      return actor.getOrder(orderId);
    },
    enabled: !!actor && !isFetching && !!orderId,
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, newStatus }: { orderId: string; newStatus: OrderStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateOrderStatus(orderId, newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myOrders'] });
      queryClient.invalidateQueries({ queryKey: ['vendorOrders'] });
      queryClient.invalidateQueries({ queryKey: ['order'] });
    },
  });
}

export function useListMyOrders() {
  const { actor, isFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ['myOrders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listMyOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useListOrdersByVendor(vendorId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ['vendorOrders', vendorId],
    queryFn: async () => {
      if (!actor || !vendorId) return [];
      return actor.listOrdersByVendor(vendorId);
    },
    enabled: !!actor && !isFetching && !!vendorId,
  });
}

// E-commerce: Vendor Balance Queries
export function useGetMyVendorBalance() {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['vendorBalance'],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getMyVendorBalance();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useWithdrawVendorBalance() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (amount: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.withdrawVendorBalance(amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorBalance'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    },
  });
}

export function useCreditVendor() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ vendorId, amount }: { vendorId: string; amount: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.creditVendor(vendorId, amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorBalance'] });
    },
  });
}
