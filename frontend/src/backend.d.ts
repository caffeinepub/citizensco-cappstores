import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ReviewsAggregate {
    reviews: Array<Review>;
    count: bigint;
    averageRating: number;
}
export interface Review {
    createdAt: bigint;
    comment: string;
    vendorId: string;
    rating: bigint;
    reviewId: string;
    authorPrincipal: Principal;
}
export interface ProjectEntry {
    id: string;
    clicks: bigint;
    views: bigint;
    owner: Principal;
    name: string;
    createdAt: bigint;
    description: string;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
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
    pendingRewardCampaigns: Array<string>;
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
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createProduct(product: Product): Promise<void>;
    createProject(project: ProjectEntry): Promise<void>;
    createUserProfile(userProfile: UserProfile): Promise<void>;
    createVendor(displayName: string, bio: string, categories: Array<string>): Promise<void>;
    finishOnboarding(): Promise<void>;
    /**
     * / Returns the average rating for a given vendorId (principalId as Text).
     * / Read-only: accessible by anyone including guests.
     */
    getAverageRating(vendorId: string): Promise<number>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getOrder(orderId: string): Promise<Order | null>;
    getProject(projectId: string): Promise<ProjectEntry | null>;
    getProjectAnalytics(projectId: string): Promise<{
        clicks: bigint;
        views: bigint;
    } | null>;
    getProjectsByOwner(owner: Principal): Promise<Array<ProjectEntry>>;
    /**
     * / Aggregate review data for a vendor.
     */
    getReviewsAggregate(vendorId: string): Promise<ReviewsAggregate>;
    getRewardCampaign(campaignId: string): Promise<RewardCampaign | null>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserRole(user: Principal): Promise<UserRole>;
    getVendor(vendorId: Principal): Promise<Vendor | null>;
    getVendorBalance(vendorId: Principal): Promise<bigint>;
    getVendorOrders(): Promise<Array<Order>>;
    /**
     * / Returns all reviews for a given vendorId (principalId as text for frontend compatibility).
     * / Read-only: accessible by anyone including guests.
     */
    getVendorReviews(vendorId: string): Promise<Array<Review>>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    listAllUnpublishedVendors(): Promise<Array<Vendor>>;
    listAllVendorsQuery(): Promise<Array<Vendor>>;
    listOrders(): Promise<Array<Order>>;
    listProductStockByVendorId(vendorId: Principal): Promise<Array<Product>>;
    listProducts(): Promise<Array<Product>>;
    listPublicVendors(): Promise<Array<Vendor>>;
    listPublicVendorsByCategory(category: string): Promise<Array<Vendor>>;
    listRewardCampaigns(): Promise<Array<RewardCampaign>>;
    publishVendor(): Promise<void>;
    saveCallerUserProfile(userProfile: UserProfile): Promise<void>;
    searchCategory(category: string): Promise<Array<Vendor>>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    /**
     * / Creates a new review for the calling principal.
     * / Only authenticated users (#user role) may submit reviews.
     */
    submitReview(vendorId: string, rating: bigint, comment: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    unpublishVendor(): Promise<void>;
    updateOrderStatus(orderId: string, status: OrderStatus): Promise<void>;
    updateProduct(productId: string, product: Product): Promise<void>;
    updateVendorProfile(displayName: string, bio: string, categories: Array<string>): Promise<void>;
    verifyVendor(vendorId: Principal): Promise<void>;
    withdrawVendorBalance(amount: bigint): Promise<void>;
}
