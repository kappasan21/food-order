import type { OrderStatus } from "@/lib/constants";
import { NEXT_STATUS } from "@/lib/constants";

export function getNextStatus(current: OrderStatus): OrderStatus | null {
  return NEXT_STATUS[current] ?? null;
}

export async function generateOrderNumber(
  existingCount: number,
): Promise<string> {
  const sequence = existingCount + 1;
  return `TT-${String(sequence).padStart(5, "0")}`;
}

export function isStripeEnabled(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
