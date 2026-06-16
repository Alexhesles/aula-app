import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-bg px-6">
      <Link
        href="/"
        className="mb-8 font-display text-2xl font-extrabold text-indigo"
      >
        Aula
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
