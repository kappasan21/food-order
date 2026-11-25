import { CartView } from "@/components/cart/cart-view";

export default function CartPage() {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-red-700">Cart</p>
        <h1 className="mt-2 text-3xl font-semibold text-stone-900">
          Review your order
        </h1>
        <p className="mt-2 text-stone-600">
          Sign in before checkout so each order is linked to your account.
        </p>
      </div>
      <CartView />
    </section>
  );
}
