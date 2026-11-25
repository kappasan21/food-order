import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { OrderList } from "@/components/orders/order-list";
import { authOptions } from "@/lib/auth";

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login?callbackUrl=/orders");
  }

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-red-700">
          Orders
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-stone-900">
          My order history
        </h1>
        <p className="mt-2 text-stone-600">
          Each order stores your account details together with the menu items you
          ordered.
        </p>
      </div>
      <OrderList />
    </section>
  );
}
