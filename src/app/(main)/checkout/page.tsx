import Link from "next/link";
import { redirect } from "next/navigation";

type Props = {
  searchParams: Promise<{ cancelled?: string }>;
};

export default async function CheckoutPage({ searchParams }: Props) {
  const params = await searchParams;

  if (!params.cancelled) {
    redirect("/cart");
  }

  return (
    <section className="mx-auto max-w-md space-y-6 py-16 text-center">
      <div className="rounded-3xl border border-stone-200 bg-white p-10">
        <p className="text-sm uppercase tracking-[0.25em] text-stone-500">
          Payment cancelled
        </p>
        <h1 className="mt-4 text-2xl font-semibold text-stone-900">
          Your payment was not completed
        </h1>
        <p className="mt-3 text-stone-600">
          No charge was made. Your order is saved — you can return to your cart
          or browse the menu to start a new order.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/cart"
            className="rounded-full bg-red-700 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-red-800"
          >
            Back to cart
          </Link>
          <Link
            href="/orders"
            className="rounded-full border border-stone-300 px-6 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
          >
            View my orders
          </Link>
        </div>
      </div>
    </section>
  );
}
