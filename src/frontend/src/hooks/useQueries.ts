import type { Principal } from "@dfinity/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Order,
  OrderStatus,
  Product,
  ProjectEntry,
  Review,
  RewardCampaign,
  StripeConfiguration,
  UserProfile,
  Vendor,
  VendorRatingSummary,
} from "../backend";
import type { AnalyticsEntry, Wallet } from "../types";
import { useActor } from "./useActor";

// ─── User Profile ────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
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
      if (!actor) throw new Error("Actor not available");
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

// ─── Admin helpers ────────────────────────────────────────────────────────────

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ["isCallerAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Projects ────────────────────────────────────────────────────────────────

export function useListProjectEntries() {
  const { actor, isFetching } = useActor();

  return useQuery<ProjectEntry[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      if (!actor) return [];
      return [];
    },
    enabled: !!actor && !isFetching,
  });
}

/** Alias kept for backward compatibility */
export const useGetProjectEntries = useListProjectEntries;

export function useGetProjectsByOwner(owner: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<ProjectEntry[]>({
    queryKey: ["projectsByOwner", owner?.toString()],
    queryFn: async () => {
      if (!actor || !owner) return [];
      return actor.getProjectsByOwner(owner);
    },
    enabled: !!actor && !isFetching && !!owner,
  });
}

export function useCreateProject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (project: ProjectEntry) => {
      if (!actor) throw new Error("Actor not available");
      await actor.createProject(project);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

/** Alias for AddDAppModal */
export const useAddProjectEntry = useCreateProject;

export function useTrackProjectView() {
  return useMutation({
    mutationFn: async (_projectId: string) => {
      // view tracking stub
    },
  });
}

export function useTrackProjectClick() {
  return useMutation({
    mutationFn: async (_projectId: string) => {
      // click tracking stub
    },
  });
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export function useGetAllAnalytics() {
  const { actor, isFetching } = useActor();

  return useQuery<AnalyticsEntry[]>({
    queryKey: ["allAnalytics"],
    queryFn: async (): Promise<AnalyticsEntry[]> => {
      if (!actor) return [];
      return [];
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Reward Campaigns ────────────────────────────────────────────────────────

export function useGetRewardCampaigns() {
  const { actor, isFetching } = useActor();

  return useQuery<RewardCampaign[]>({
    queryKey: ["rewardCampaigns"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listRewardCampaigns();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateRewardCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_campaign: RewardCampaign) => {
      // stub — backend does not support creating campaigns via frontend yet
      throw new Error(
        "Creating reward campaigns is not supported in the current backend version.",
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rewardCampaigns"] });
    },
  });
}

export function useJoinRewardCampaign() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_campaignId: string) => {
      if (!actor) throw new Error("Actor not available");
      // stub
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rewardCampaigns"] });
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

export function useCompleteRewardCampaign() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_campaignId: string) => {
      if (!actor) throw new Error("Actor not available");
      // stub
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rewardCampaigns"] });
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

// ─── Wallet ───────────────────────────────────────────────────────────────────

export function useGetWallet() {
  const { actor, isFetching } = useActor();

  return useQuery<Wallet>({
    queryKey: ["wallet"],
    queryFn: async (): Promise<Wallet> => {
      if (!actor) throw new Error("Actor not available");
      return {
        icpBalance: BigInt(0),
        stripeBalance: BigInt(0),
        transactionHistory: [],
      };
    },
    enabled: !!actor && !isFetching,
  });
}

export function useDepositToWallet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (_amount: bigint) => {
      throw new Error("Deposit not yet implemented in backend");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
  });
}

export function useWithdrawFromWallet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (_amount: bigint) => {
      throw new Error("Withdrawal not yet implemented in backend");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
  });
}

// ─── Stripe ───────────────────────────────────────────────────────────────────

export function useIsStripeConfigured() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ["isStripeConfigured"],
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
    mutationFn: async (config: StripeConfiguration) => {
      if (!actor) throw new Error("Actor not available");
      await actor.setStripeConfiguration(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["isStripeConfigured"] });
    },
  });
}

// ─── Vendors ─────────────────────────────────────────────────────────────────

export function useListPublicVendors() {
  const { actor, isFetching } = useActor();

  return useQuery<Vendor[]>({
    queryKey: ["publicVendors"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listPublicVendors();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useListPublicVendorsByCategory(category: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Vendor[]>({
    queryKey: ["publicVendorsByCategory", category],
    queryFn: async () => {
      if (!actor || !category) return [];
      return actor.listPublicVendorsByCategory(category);
    },
    enabled: !!actor && !isFetching && !!category,
  });
}

export function useGetVendor(vendorId: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Vendor | null>({
    queryKey: ["vendor", vendorId?.toString()],
    queryFn: async () => {
      if (!actor || !vendorId) return null;
      return actor.getVendor(vendorId);
    },
    enabled: !!actor && !isFetching && !!vendorId,
  });
}

export function useGetVendorBalance(vendorId: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ["vendorBalance", vendorId?.toString()],
    queryFn: async () => {
      if (!actor || !vendorId) return BigInt(0);
      return actor.getVendorBalance(vendorId);
    },
    enabled: !!actor && !isFetching && !!vendorId,
  });
}

export function useWithdrawVendorBalance() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (amount: bigint) => {
      if (!actor) throw new Error("Actor not available");
      await actor.withdrawVendorBalance(amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendorBalance"] });
    },
  });
}

export function useCreateVendor() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      displayName,
      bio,
      categories,
    }: {
      displayName: string;
      bio: string;
      categories: string[];
    }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.createVendor(displayName, bio, categories);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor"] });
      queryClient.invalidateQueries({ queryKey: ["publicVendors"] });
    },
  });
}

export function useUpdateVendorProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      displayName,
      bio,
      categories,
    }: {
      displayName: string;
      bio: string;
      categories: string[];
    }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.updateVendorProfile(displayName, bio, categories);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor"] });
      queryClient.invalidateQueries({ queryKey: ["publicVendors"] });
    },
  });
}

export function usePublishVendor() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      await actor.publishVendor();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor"] });
      queryClient.invalidateQueries({ queryKey: ["publicVendors"] });
    },
  });
}

export function useUnpublishVendor() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      await actor.unpublishVendor();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor"] });
      queryClient.invalidateQueries({ queryKey: ["publicVendors"] });
    },
  });
}

// ─── Products ─────────────────────────────────────────────────────────────────

export function useListProducts() {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useProductMap() {
  const { data: products = [], isLoading } = useListProducts();

  const productMap = new Map<string, string>(
    products.map((p) => [p.id, p.name]),
  );

  return { productMap, isLoading };
}

export function useCreateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: Product) => {
      if (!actor) throw new Error("Actor not available");
      await actor.createProduct(product);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      product,
    }: { productId: string; product: Product }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.updateProduct(productId, product);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export function useGetOrders() {
  const { actor, isFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetOrder(orderId: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Order | null>({
    queryKey: ["order", orderId],
    queryFn: async () => {
      if (!actor || !orderId) return null;
      return actor.getOrder(orderId);
    },
    enabled: !!actor && !isFetching && !!orderId,
  });
}

export function useGetVendorOrders() {
  const { actor, isFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ["vendorOrders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getVendorOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export interface CreateOrderInput {
  productId: string;
  vendorId: Principal;
  quantity: number;
  totalAmount: bigint;
}

export function useCreateOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateOrderInput): Promise<Order> => {
      if (!actor) throw new Error("Actor not available");

      const orderId = `order-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

      const order: Order = {
        id: orderId,
        customerId: input.vendorId,
        vendorId: input.vendorId,
        productId: input.productId,
        quantity: BigInt(input.quantity),
        totalAmount: input.totalAmount,
        status: "pending" as unknown as OrderStatus,
        createdAt: BigInt(Date.now() * 1_000_000),
      };

      // Simulate async; replace with actor.createOrder(order) once backend supports it
      await new Promise((resolve) => setTimeout(resolve, 600));

      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: { orderId: string; status: OrderStatus }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.updateOrderStatus(orderId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["vendorOrders"] });
    },
  });
}

// ─── Revenue Share ────────────────────────────────────────────────────────────

export function useCreateRevenueShareConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_config: unknown) => {
      throw new Error("Revenue share config not yet implemented in backend");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["revenueShareConfigs"] });
    },
  });
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export function useListAllVendors() {
  const { actor, isFetching } = useActor();

  return useQuery<Vendor[]>({
    queryKey: ["allVendors"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAllVendorsQuery();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useVerifyVendor() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vendorId: Principal) => {
      if (!actor) throw new Error("Actor not available");
      await actor.verifyVendor(vendorId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allVendors"] });
      queryClient.invalidateQueries({ queryKey: ["publicVendors"] });
    },
  });
}

// ─── Vendor Reviews & Ratings ─────────────────────────────────────────────────

export function useGetVendorReviews(vendorId: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Review[]>({
    queryKey: ["vendorReviews", vendorId],
    queryFn: async () => {
      if (!actor || !vendorId) return [];
      return actor.getVendorReviews(vendorId);
    },
    enabled: !!actor && !isFetching && !!vendorId,
  });
}

export function useGetAverageRating(vendorId: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<number>({
    queryKey: ["averageRating", vendorId],
    queryFn: async () => {
      if (!actor || !vendorId) return 0;
      try {
        return await actor.getAverageRating(vendorId);
      } catch {
        return 0;
      }
    },
    enabled: !!actor && !isFetching && !!vendorId,
  });
}

export function useGetVendorRatingSummary(vendorId: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<VendorRatingSummary>({
    queryKey: ["vendorRatingSummary", vendorId?.toString()],
    queryFn: async (): Promise<VendorRatingSummary> => {
      if (!actor || !vendorId) {
        return {
          vendorId: undefined,
          averageRating: 0,
          totalReviews: BigInt(0),
          starBreakdown: [
            BigInt(0),
            BigInt(0),
            BigInt(0),
            BigInt(0),
            BigInt(0),
          ],
        };
      }
      return actor.getVendorRatingSummary(vendorId);
    },
    enabled: !!actor && !isFetching && !!vendorId,
  });
}

export function useSubmitVendorReview() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      vendorId,
      rating,
      comment,
    }: {
      vendorId: string;
      rating: number;
      comment: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.submitReview(
        vendorId,
        BigInt(rating),
        comment,
      );
      if (result.__kind__ === "err") {
        throw new Error((result as { __kind__: "err"; err: string }).err);
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["vendorReviews", variables.vendorId],
      });
      queryClient.invalidateQueries({ queryKey: ["vendorRatingSummary"] });
      queryClient.invalidateQueries({
        queryKey: ["averageRating", variables.vendorId],
      });
    },
  });
}
