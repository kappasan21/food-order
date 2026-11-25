"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { formatDate, formatPrice } from "@/lib/format";

type OrderItem = {
  id: string;
  menuItemName: string;
  menuItemDescription: string;
  menuItemPriceCents: number;
  menuItemImageUrl: string;
  quantity: number;
};

type Order = {
  id: string;
  userName: string;
  userEmail: string;
  status: string;
  totalCents: number;
  createdAt: string;
  items: OrderItem[];
};

export function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrders() {
      try {
        const response = await fetch("/api/orders");
        const data = (await response.json()) as Order[] | { error?: string };

        if (!response.ok) {
          throw new Error(
            "error" in data ? data.error : "Unable to load orders",
          );
        }

        setOrders(data as Order[]);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load orders",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadOrders();
  }, []);

  if (isLoading) {
    return <p className="text-stone-600">Loading your orders...</p>;
  }

  if (error) {
    return (
      <p className="rounded-3xl bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </p>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-10 text-center">
        <p className="text-lg font-medium text-stone-900">No orders yet</p>
        <p className="mt-2 text-sm text-stone-600">
          Your order history will appear here after checkout.
        </p>
        <Link
          href="/menu"
          className="mt-6 inline-flex rounded-full bg-red-700 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-800"
        >
          Order now
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <article
          key={order.id}
          className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm"
        >
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-100 pb-4">
            <div>
              <p className="text-sm uppercase tracking-wide text-stone-500">
                Order {order.id.slice(0, 8)}
              </p>
              <p className="mt-1 text-sm text-stone-600">
                {formatDate(order.createdAt)}
              </p>
              <p className="mt-2 text-sm text-stone-600">
                Customer: {order.userName} ({order.userEmail})
              </p>
            </div>
            <div className="text-right">
              <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-800">
                {order.status}
              </span>
              <p className="mt-2 text-lg font-semibold text-stone-900">
                {formatPrice(order.totalCents)}
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-4 sm:flex-row sm:items-center"
              >
                <div className="relative h-20 w-full overflow-hidden rounded-2xl sm:h-16 sm:w-24">
                  <Image
                    src={item.menuItemImageUrl}
                    alt={item.menuItemName}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-stone-900">{item.menuItemName}</p>
                  <p className="text-sm text-stone-600">
                    {item.menuItemDescription}
                  </p>
                </div>
                <div className="text-sm text-stone-600 sm:text-right">
                  <p>Qty {item.quantity}</p>
                  <p className="font-medium text-stone-900">
                    {formatPrice(item.menuItemPriceCents * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
