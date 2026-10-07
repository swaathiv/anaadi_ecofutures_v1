/** Shared data shapes (website + Cloud Functions). Keep import-free. */

export interface DeliveryDetails {
  name: string;
  /** 10-digit Indian mobile, no prefix. */
  phone: string;
  line1: string;
  line2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
}

/** Firestore: users/{uid}. */
export interface Profile {
  name: string;
  /** E.164, e.g. +919876543210. */
  phone?: string;
  email?: string;
  address?: DeliveryDetails;
  createdAt: string;
}

export type OrderStatus = "placed" | "confirmed" | "shipped" | "delivered" | "cancelled";

export interface OrderLine {
  slug: string;
  name: string;
  quantity: number;
  unitPrice: number | null;
  lineTotal: number | null;
}

/** Firestore: orders/{id}. Written only by Cloud Functions. */
export interface Order {
  id: string;
  userId: string;
  /** Account contact at the time of ordering. */
  customer: { name: string; phone?: string; email?: string };
  lines: OrderLine[];
  delivery: DeliveryDetails;
  notes?: string;
  /** Answer to "How did you hear about us?" (optional). */
  referral?: { source: string; detail?: string };
  subtotal: number;
  shipping: number;
  codFee: number;
  total: number;
  hasUnpricedItems: boolean;
  paymentMethod: "cod";
  status: OrderStatus;
  history: { status: OrderStatus; at: string; note?: string }[];
  /** ISO 8601 timestamps (sortable as strings). */
  createdAt: string;
  updatedAt: string;
}

/** Firestore: admins/{uid}. Presence of the document grants admin access. */
export interface AdminEntry {
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  addedBy?: string;
  addedAt?: string;
}

/**
 * "How did you hear about us?" options. Edit freely; the placeOrder function
 * accepts only these values.
 */
export const REFERRAL_SOURCES = [
  "Friend or family",
  "Instagram",
  "Facebook",
  "WhatsApp",
  "YouTube",
  "Google search",
  "Workshop or event",
  "Goshala or farm visit",
  "Other",
] as const;

export const ORDER_STATUSES: OrderStatus[] = ["placed", "confirmed", "shipped", "delivered", "cancelled"];

export const statusLabels: Record<OrderStatus, string> = {
  placed: "Order placed",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};
