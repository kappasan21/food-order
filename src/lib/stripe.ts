import Stripe from "stripe";

import { isStripeEnabled } from "@/lib/orders";

let stripeClient: Stripe | null = null;

export function getStripeClient(): Stripe | null {
  if (!isStripeEnabled()) {
    return null;
  }

  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-06-24.dahlia",
    });
  }

  return stripeClient;
}

type CheckoutSessionInput = {
  orderId: string;
  orderNumber: string;
  totalCents: number;
  customerEmail: string;
  lineItems: Array<{
    name: string;
    amountCents: number;
    quantity: number;
  }>;
};

export async function createStripeCheckoutSession(
  input: CheckoutSessionInput,
): Promise<string | null> {
  const stripe = getStripeClient();

  if (!stripe) {
    return null;
  }

  const appUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: input.customerEmail,
    success_url: `${appUrl}/orders?paid=1`,
    cancel_url: `${appUrl}/checkout?cancelled=1`,
    metadata: {
      orderId: input.orderId,
      orderNumber: input.orderNumber,
    },
    line_items: input.lineItems.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: "usd",
        unit_amount: item.amountCents,
        product_data: {
          name: item.name,
        },
      },
    })),
  });

  return session.url;
}
