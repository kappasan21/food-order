"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";

import { useCart } from "@/components/providers/cart-provider";
import { formatPrice } from "@/lib/format";

type CheckoutResponse = {
  orderId?: string;
  orderNumber?: string;
  requiresPayment?: boolean;
  checkoutUrl?: string;
  message?: string;
  error?: string;
};

export function CartView() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, totalCents, updateQuantity, removeItem, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [orderType, setOrderType] = useState<"pickup" | "delivery">("pickup");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");

  async function placeOrder() {
    if (!session) {
      router.push("/login?callbackUrl=/cart");
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
          })),
          orderType,
          phoneNumber,
          deliveryAddress: orderType === "delivery" ? deliveryAddress : undefined,
        }),
      });

      const data = (await response.json()) as CheckoutResponse;

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to place order");
      }

      clearCart();

      if (data.requiresPayment && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      setMessage("Order placed successfully.");
      router.push("/orders");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to place order",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-10 text-center">
        <p className="text-lg font-medium text-stone-900">Your cart is empty</p>
        <p className="mt-2 text-sm text-stone-600">
          Browse the menu and add your favorite Italian dishes.
        </p>
        <Link
          href="/menu"
          className="mt-6 inline-flex rounded-full bg-red-700 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-800"
        >
          View menu
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {items.map((item) => (
          <article
            key={item.menuItemId}
            className="flex flex-col gap-4 rounded-3xl border border-stone-200 bg-white p-4 sm:flex-row sm:items-center"
          >
            <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-2xl sm:h-24 sm:w-32">
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                className="object-cover"
                sizes="128px"
              />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-stone-900">{item.name}</h3>
                  <p className="text-sm text-stone-600">{item.description}</p>
                </div>
                <p className="font-semibold text-red-700">
                  {formatPrice(item.priceCents * item.quantity)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <label className="text-sm text-stone-600">
                  Qty
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={item.quantity}
                    onChange={(event) =>
                      updateQuantity(
                        item.menuItemId,
                        Number(event.target.value),
                      )
                    }
                    className="ml-2 w-16 rounded-xl border border-stone-300 px-2 py-1"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => removeItem(item.menuItemId)}
                  className="text-sm font-medium text-stone-500 transition hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="rounded-3xl border border-stone-200 bg-white p-6">
        <div className="flex items-center justify-between text-lg font-semibold text-stone-900">
          <span>Total</span>
          <span>{formatPrice(totalCents)}</span>
        </div>

        {session && (
          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700">
                Order type
              </label>
              <select
                value={orderType}
                onChange={(e) =>
                  setOrderType(e.target.value as "pickup" | "delivery")
                }
                className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
              >
                <option value="pickup">Pickup</option>
                <option value="delivery">Delivery</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700">
                Phone number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 555 000 0000"
                className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
              />
            </div>

            {orderType === "delivery" && (
              <div>
                <label className="block text-sm font-medium text-stone-700">
                  Delivery address
                </label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="123 Main St, City"
                  className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
                />
              </div>
            )}
          </div>
        )}

        {!session && (
          <p className="mt-4 text-sm text-stone-600">
            You need an account to place an order.{" "}
            <Link href="/register" className="font-medium text-red-700">
              Create one
            </Link>{" "}
            or{" "}
            <Link href="/login" className="font-medium text-red-700">
              sign in
            </Link>
            .
          </p>
        )}

        {message && (
          <p className="mt-4 rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </p>
        )}

        {error && (
          <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={placeOrder}
          disabled={isSubmitting}
          className="mt-6 w-full rounded-full bg-red-700 px-5 py-3 text-sm font-medium text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Placing order..." : "Place order"}
        </button>
      </div>
    </div>
  );
}
