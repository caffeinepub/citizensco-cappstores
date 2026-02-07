import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface RevenueShareConfig {
    id: string;
    participants: Array<RevenueShareParticipant>;
}
export interface ProjectEntry {
    id: string;
    url: string;
    revenueShareConfigId?: string;
    logo: ExternalBlob;
    name: string;
    description: string;
    category: string;
}
export interface Product {
    id: string;
    imageBlob: ExternalBlob;
    inventory: bigint;
    name: string;
    createdAt: bigint;
    description: string;
    vendorId: string;
    price: bigint;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface AnalyticsEntry {
    clicks: bigint;
    views: bigint;
    projectId: string;
}
export interface Order {
    id: string;
    status: OrderStatus;
    createdAt: bigint;
    productId: string;
    totalAmount: bigint;
    vendorId: string;
    buyerPrincipal: Principal;
    quantity: bigint;
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
export interface Wallet {
    stripeBalance: bigint;
    icpBalance: bigint;
    transactionHistory: Array<string>;
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
export interface RevenueShareParticipant {
    principal?: Principal;
    stripeId?: string;
    percentage: bigint;
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
    id: string;
    bio: string;
    displayName: string;
    ownerPrincipal: Principal;
    createdAt: bigint;
}
export interface UserProfile {
    name: string;
    email?: string;
    preferences: Array<string>;
}
export enum OrderStatus {
    cancelled = "cancelled",
    pending = "pending",
    fulfilled = "fulfilled",
    declined = "declined"
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
    createOrder(vendorId: string, productId: string, quantity: bigint): Promise<string>;
    createProduct(vendorId: string, name: string, description: string, price: bigint, imageBlob: ExternalBlob, inventory: bigint): Promise<string>;
    createRevenueShareConfig(config: RevenueShareConfig): Promise<void>;
    createRewardCampaign(campaign: RewardCampaign): Promise<void>;
    createVendor(displayName: string, bio: string): Promise<string>;
    creditVendor(vendorId: string, amount: bigint): Promise<void>;
    depositToWallet(icpAmount: bigint, stripeAmount: bigint): Promise<void>;
    getAllAnalytics(): Promise<Array<AnalyticsEntry>>;
    getAnalytics(projectId: string): Promise<AnalyticsEntry | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMyVendor(): Promise<Vendor | null>;
    getMyVendorBalance(): Promise<bigint>;
    getOrder(orderId: string): Promise<Order | null>;
    getProjectEntries(): Promise<Array<ProjectEntry>>;
    getRevenueShareConfig(id: string): Promise<RevenueShareConfig | null>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVendorById(id: string): Promise<Vendor | null>;
    getWallet(): Promise<Wallet | null>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    joinRewardCampaign(campaignId: string): Promise<void>;
    listMyOrders(): Promise<Array<Order>>;
    listOrdersByVendor(vendorId: string): Promise<Array<Order>>;
    listProducts(): Promise<Array<Product>>;
    listProductsByVendor(vendorId: string): Promise<Array<Product>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    trackProjectClick(projectId: string): Promise<void>;
    trackProjectView(projectId: string): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<void>;
    updateProduct(productId: string, name: string, description: string, price: bigint, imageBlob: ExternalBlob, inventory: bigint): Promise<void>;
    updateRevenueShareConfig(config: RevenueShareConfig): Promise<void>;
    withdrawFromWallet(icpAmount: bigint, stripeAmount: bigint): Promise<void>;
    withdrawVendorBalance(amount: bigint): Promise<void>;
}
