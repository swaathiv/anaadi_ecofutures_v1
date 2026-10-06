/** Shared data shapes for accounts and orders. */

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  createdAt: string;
  address?: DeliveryDetails;
}

export interface Session {
  tokenHash: string;
  userId: string;
  expiresAt: string;
}

export interface DeliveryDetails {
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
}

export type OrderStatus = "placed" | "confirmed" | "shipped" | "delivered" | "cancelled";

export interface OrderLine {
  slug: string;
  name: string;
  quantity: number;
  unitPrice: number | null;
  lineTotal: number | null;
}

export interface Order {
  id: string;
  userId: string;
  email: string;
  lines: OrderLine[];
  delivery: DeliveryDetails;
  notes?: string;
  subtotal: number;
  shipping: number;
  codFee: number;
  total: number;
  hasUnpricedItems: boolean;
  paymentMethod: "cod";
  status: OrderStatus;
  history: { status: OrderStatus; at: string; note?: string }[];
  createdAt: string;
}

export const ORDER_STATUSES: OrderStatus[] = ["placed", "confirmed", "shipped", "delivered", "cancelled"];

export const statusLabels: Record<OrderStatus, string> = {
  placed: "Order placed",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};
