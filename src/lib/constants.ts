export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "delivered",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_TYPES = ["pickup", "delivery"] as const;

export type OrderType = (typeof ORDER_TYPES)[number];

export const PAYMENT_STATUSES = [
  "pending",
  "paid",
  "unpaid",
  "failed",
  "refunded",
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const USER_ROLES = ["customer", "admin"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  delivered: "Delivered",
};

export const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: "confirmed",
  confirmed: "preparing",
  preparing: "delivered",
};
