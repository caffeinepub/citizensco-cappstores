// Frontend-only types for features not yet implemented in backend
import { Principal } from '@dfinity/principal';
import { ExternalBlob as BackendExternalBlob } from './backend';

// Note: ProjectEntry is now imported directly from backend
// The backend ProjectEntry only has: id, name, description, owner, views, clicks, createdAt
// Frontend features like url, category, logo are not yet in backend

export interface AnalyticsEntry {
  projectId: string;
  projectName: string;
  clicks: number;
  views: number;
  conversionRate: number;
}

export interface RevenueShareConfig {
  id: string;
  participants: RevenueShareParticipant[];
}

export interface RevenueShareParticipant {
  principal?: Principal;
  stripeId?: string;
  percentage: bigint;
}

export interface Wallet {
  icpBalance: bigint;
  stripeBalance: bigint;
  transactionHistory: string[];
}

export interface Vendor {
  id: string;
  ownerPrincipal: Principal;
  displayName: string;
  bio: string;
  balance: bigint;
  createdAt: number;
  categories?: string[];
}

export interface PublicVendor {
  id: string;
  principalId: string;
  displayName: string;
  bio: string;
  createdAt: number;
  categories: string[];
}

export interface Product {
  id: string;
  vendorId: string;
  name: string;
  description: string;
  price: bigint;
  stock: bigint;
  image?: BackendExternalBlob;
  createdAt: bigint;
}

export interface Order {
  id: string;
  buyerPrincipal: Principal;
  customerId: string;
  vendorId: string;
  productId: string;
  quantity: bigint;
  totalAmount: bigint;
  status: OrderStatus;
  createdAt: bigint;
}

export enum OrderStatus {
  pending = 'pending',
  paid = 'paid',
  shipped = 'shipped',
  delivered = 'delivered',
  cancelled = 'cancelled',
}

// Re-export the backend ExternalBlob for convenience
export { ExternalBlob } from './backend';
