"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/format";

type OrderItem = {
  id: string;
  menuItemName: string;
  quantity: number;
  menuItemPriceCents: number;
};

type Order = {
  id: string;
  orderNumber: string;
  userName: string;
  userEmail: string;
  orderType: string;
  phoneNumber: string;
  status: string;
  paymentStatus: string;
  totalCents: number;
  createdAt: string;
  items: OrderItem[];
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  preparing: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
};

const NEXT_LABEL: Record<string, string> = {
  pending: "Confirm",
  confirmed: "Start preparing",
  preparing: "Mark delivered",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [advancing, setAdvancing] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      const res = await fetch("/api/admin/orders");
      const data = (await res.json()) as Order[] | { error: string };
      if (!res.ok) throw new Error("error" in data ? data.error : "Failed to load");
      setOrders(data as Order[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  }

  async function advanceStatus(orderId: string, currentStatus: string) {
    const nextMap: Record<string, string> = {
      pending: "confirmed",
      confirmed: "preparing",
      preparing: "delivered",
    };
    const next = nextMap[currentStatus];
    if (!next) return;

    setAdvancing(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error("Failed to update");
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: next } : o)),
      );
    } catch {
      alert("Failed to update order status");
    } finally {
      setAdvancing(null);
    }
  }

  if (isLoading) return <p className="text-stone-600">Loading orders...</p>;
  if (error) return <p className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</p>;

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-red-700">Admin</p>
        <h1 className="mt-2 text-3xl font-semibold text-stone-900">Orders</h1>
        <p className="mt-1 text-stone-500">{orders.length} total</p>
      </div>

      {orders.length === 0 && (
        <p className="text-stone-500">No orders yet.</p>
      )}

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-stone-900">{order.orderNumber}</p>
                <p className="text-sm text-stone-600">
                  {order.userName} · {order.userEmail}
                </p>
                <p className="text-sm text-stone-500">
                  {order.orderType} · {order.phoneNumber}
                </p>
                <p className="mt-1 text-xs text-stone-400">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${STATUS_COLORS[order.status] ?? "bg-stone-100 text-stone-700"}`}
                >
                  {order.status}
                </span>
                <span className="text-sm text-stone-500">
                  Payment: {order.paymentStatus}
                </span>
                <p className="font-semibold text-stone-900">
                  {formatPrice(order.totalCents)}
                </p>
              </div>
            </div>

            <div className="mt-4 border-t border-stone-100 pt-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-stone-400">
                Items
              </p>
              <ul className="space-y-1">
                {order.items.map((item) => (
                  <li key={item.id} className="flex justify-between text-sm text-stone-700">
                    <span>{item.menuItemName} × {item.quantity}</span>
                    <span>{formatPrice(item.menuItemPriceCents * item.quantity)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {NEXT_LABEL[order.status] && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => advanceStatus(order.id, order.status)}
                  disabled={advancing === order.id}
                  className="rounded-full bg-red-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-800 disabled:opacity-60"
                >
                  {advancing === order.id ? "Updating..." : NEXT_LABEL[order.status]}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
