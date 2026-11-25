import { count, desc, eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/db";
import { menuItems, orderItems, orders, users } from "@/db/schema";
import { authOptions } from "@/lib/auth";
import { ORDER_TYPES } from "@/lib/constants";
import { generateOrderNumber, isStripeEnabled } from "@/lib/orders";
import { createStripeCheckoutSession } from "@/lib/stripe";

const orderItemSchema = z.object({
  menuItemId: z.string().min(1),
  quantity: z.number().int().min(1).max(20),
});

const checkoutSchema = z
  .object({
    items: z.array(orderItemSchema).min(1, "Add at least one item to order"),
    orderType: z.enum(ORDER_TYPES),
    phoneNumber: z.string().trim().min(7, "Enter a valid phone number"),
    deliveryAddress: z.string().trim().optional(),
  })
  .superRefine((data, context) => {
    if (data.orderType === "delivery" && !data.deliveryAddress?.trim()) {
      context.addIssue({
        code: "custom",
        message: "Delivery address is required for delivery orders",
        path: ["deliveryAddress"],
      });
    }
  });

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "You must be signed in to place an order" },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid checkout" },
        { status: 400 },
      );
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const requestedItems = parsed.data.items;
    const menu = await db.select().from(menuItems);
    const menuById = new Map(menu.map((item) => [item.id, item]));

    for (const item of requestedItems) {
      if (!menuById.has(item.menuItemId)) {
        return NextResponse.json(
          { error: `Menu item not found: ${item.menuItemId}` },
          { status: 400 },
        );
      }
    }

    const menuItemIds = requestedItems.map((item) => item.menuItemId);
    const uniqueIds = new Set(menuItemIds);
    if (uniqueIds.size !== menuItemIds.length) {
      return NextResponse.json(
        { error: "Duplicate menu items must be combined into one quantity" },
        { status: 400 },
      );
    }

    const orderId = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const [{ value: orderCount }] = await db.select({ value: count() }).from(orders);
    const orderNumber = await generateOrderNumber(orderCount);

    const lineItems = requestedItems.map((requested) => {
      const menuItem = menuById.get(requested.menuItemId)!;

      return {
        id: crypto.randomUUID(),
        orderId,
        menuItemId: menuItem.id,
        menuItemName: menuItem.name,
        menuItemDescription: menuItem.description,
        menuItemPriceCents: menuItem.priceCents,
        menuItemImageUrl: menuItem.imageUrl,
        quantity: requested.quantity,
      };
    });

    const totalCents = lineItems.reduce(
      (sum, item) => sum + item.menuItemPriceCents * item.quantity,
      0,
    );

    const stripeEnabled = isStripeEnabled();
    const paymentStatus = stripeEnabled ? "pending" : "unpaid";

    await db.insert(orders).values({
      id: orderId,
      orderNumber,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      orderType: parsed.data.orderType,
      phoneNumber: parsed.data.phoneNumber,
      deliveryAddress:
        parsed.data.orderType === "delivery"
          ? parsed.data.deliveryAddress?.trim() ?? null
          : null,
      status: "pending",
      paymentStatus,
      totalCents,
      createdAt,
    });

    await db.insert(orderItems).values(lineItems);

    if (stripeEnabled) {
      const checkoutUrl = await createStripeCheckoutSession({
        orderId,
        orderNumber,
        totalCents,
        customerEmail: user.email,
        lineItems: lineItems.map((item) => ({
          name: item.menuItemName,
          amountCents: item.menuItemPriceCents,
          quantity: item.quantity,
        })),
      });

      if (checkoutUrl) {
        return NextResponse.json({
          orderId,
          orderNumber,
          checkoutUrl,
          requiresPayment: true,
        });
      }
    }

    return NextResponse.json({
      orderId,
      orderNumber,
      requiresPayment: false,
      message:
        "Order placed successfully. Stripe is not configured yet, so payment was skipped in test mode.",
    });
  } catch (error) {
    console.error("Checkout failed:", error);
    return NextResponse.json(
      { error: "Unable to complete checkout" },
      { status: 500 },
    );
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, session.user.id))
      .orderBy(desc(orders.createdAt));

    const ordersWithItems = await Promise.all(
      userOrders.map(async (order) => {
        const items = await db
          .select()
          .from(orderItems)
          .where(eq(orderItems.orderId, order.id));

        return { ...order, items };
      }),
    );

    return NextResponse.json(ordersWithItems);
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json(
      { error: "Unable to load orders" },
      { status: 500 },
    );
  }
}
