import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/get-user";
import { NavTabBar } from "@/components/shared/nav-tab-bar";

export default async function MaestroLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-dvh bg-bg pb-20">
      <div className="mx-auto max-w-lg">{children}</div>
      <NavTabBar />
    </div>
  );
}
