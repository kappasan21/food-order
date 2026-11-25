import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full px-4 py-10">
      <div className="mx-auto mb-8 max-w-md">
        <Link href="/" className="text-sm font-medium text-red-700">
          ← Back to Trattoria Test
        </Link>
      </div>
      {children}
    </div>
  );
}
