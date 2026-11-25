import Link from "next/link";

export default function HomePage() {
  return (
    <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-red-800 via-red-700 to-amber-700 px-8 py-16 text-white shadow-lg">
      <p className="text-sm uppercase tracking-[0.3em] text-red-100">
        Test environment
      </p>
      <h1 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl">
        Order classic Italian dishes online
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-red-50">
        Browse 10 sample menu items, create your account, and place orders linked
        to both your profile and the dishes you selected.
      </p>
      <div className="mt-8 flex flex-wrap gap-4">
        <Link
          href="/menu"
          className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-red-800 transition hover:bg-red-50"
        >
          Browse menu
        </Link>
        <Link
          href="/register"
          className="rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          Create account
        </Link>
      </div>
    </section>
  );
}
