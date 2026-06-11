import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppShell } from "@/components/layout/AppShell";

// Layout del área de administración. Solo SUPER_ADMIN; comparte el mismo
// shell (Sidebar) que el dashboard.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") redirect("/");

  return <AppShell>{children}</AppShell>;
}
