import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ProjectEntry {
    id: string;
    clicks: bigint;
    views: bigint;
    owner: Principal;
    name: string;
    createdAt: bigint;
    description: string;
}
export interface Product {
    id: string;
    name: string;
    createdAt: bigint;
    description: string;
    stock: bigint;
    vendorId: Principal;
    price: bigint;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface Order {
    id: string;
    status: OrderStatus;
    createdAt: bigint;
    productId: string;
    totalAmount: bigint;
    vendorId: Principal;
    quantity: bigint;
    customerId: Principal;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface RewardCampaign {
    id: string;
    participants: Array<Principal>;
    rewardAmount: bigint;
    name: string;
    description: string;
    campaignType: RewardCampaignType;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface Vendor {
    bio: string;
    categories: Array<string>;
    balance: bigint;
    displayName: string;
    published: boolean;
    createdAt: bigint;
    vendorOwner: Principal;
    principalId: Principal;
}
export interface UserProfile {
    name: string;
    createdAt: bigint;
    email?: string;
}
export enum OrderStatus {
    shipped = "shipped",
    cancelled = "cancelled",
    pending = "pending",
    paid = "paid",
    delivered = "delivered"
}
export enum RewardCampaignType {
    reward = "reward",
    contest = "contest",
    workshop = "workshop",
    referral = "referral",
    earning = "earning",
    education = "education",
    commission = "commission",
    airdrop = "airdrop",
    bonus = "bonus",
    special = "special",
    volunteer = "volunteer"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addProjectEntry(entry: ProjectEntry): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    completeRewardCampaign(campaignId: string): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createOrder(order: Order): Promise<void>;
    createProduct(product: Product): Promise<void>;
    createRewardCampaign(campaign: RewardCampaign): Promise<void>;
    createVendor(displayName: string, bio: string, categories: Array<string>): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCampaignsState(): Promise<{
        users: Array<UserProfile>;
        campaigns: Array<RewardCampaign>;
    }>;
    getOrder(orderId: string): Promise<Order | null>;
    getProjectAnalytics(projectId: string): Promise<{
        clicks: bigint;
        views: bigint;
    } | null>;
    getPublicVendor(vendorId: Principal): Promise<Vendor | null>;
    getRewardCampaignsSample(): Promise<Array<RewardCampaign>>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVendor(vendorId: Principal): Promise<Vendor | null>;
    getVendorBalance(vendorId: Principal): Promise<bigint>;
    getVendorOrders(): Promise<Array<Order>>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    joinRewardCampaign(campaignId: string): Promise<void>;
    listOrders(): Promise<Array<Order>>;
    listProducts(): Promise<Array<Product>>;
    listProjectEntries(): Promise<Array<ProjectEntry>>;
    listPublicVendors(): Promise<Array<Vendor>>;
    listPublicVendorsByCategory(category: string): Promise<Array<Vendor>>;
    publishVendor(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    trackProjectClick(projectId: string): Promise<void>;
    trackProjectView(projectId: string): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    unpublishVendor(): Promise<void>;
    updateOrderStatus(orderId: string, status: OrderStatus): Promise<void>;
    updateProduct(productId: string, product: Product): Promise<void>;
    updateVendorProfile(displayName: string, bio: string, categories: Array<string>): Promise<void>;
    withdrawVendorBalance(amount: bigint): Promise<void>;
}
