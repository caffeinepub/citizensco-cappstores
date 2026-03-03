import { Principal } from '@dfinity/principal';

// Re-export OrderStatus from backend for components that import it from types
export { OrderStatus } from './backend';

// Analytics — views/clicks kept as number for component compatibility
export interface AnalyticsEntry {
  projectId: string;
  views: number;
  clicks: number;
}

// Revenue Share
export interface RevenueShareParticipant {
  id: string;
  percentage: number;
  principal?: Principal;
  stripeId?: string;
}

export interface RevenueShareConfig {
  id: string;
  participants: RevenueShareParticipant[];
  createdAt: number;
}

// Wallet transaction
export interface WalletTransaction {
  id: string;
  amount: bigint;
  type: string;
  timestamp: bigint;
}

// Wallet
export interface Wallet {
  icpBalance: bigint;
  stripeBalance: bigint;
  transactionHistory: WalletTransaction[];
}

// Vendor (frontend-only extended type)
export interface PublicVendor {
  principalId: Principal;
  vendorOwner: Principal;
  displayName: string;
  bio: string;
  balance: bigint;
  createdAt: bigint;
  published: boolean;
  categories: string[];
}

// Product form helper (frontend-only)
export interface ProductFormData {
  name: string;
  description: string;
  price: string;
  stock: string;
}

// Order creation request (frontend-only)
export interface OrderCreationRequest {
  productId: string;
  vendorId: Principal;
  quantity: number;
  totalAmount: bigint;
}

// Order confirmation data (frontend-only, for dialog display)
export interface OrderConfirmationData {
  orderId: string;
  productName: string;
  vendorName: string;
  quantity: number;
  totalAmount: bigint;
  status: string;
}

// Review (frontend-only interface matching backend Review type)
export interface ReviewData {
  reviewId: string;
  vendorId: string;
  authorPrincipal: Principal;
  rating: bigint;
  comment: string;
  createdAt: bigint;
}
