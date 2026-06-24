import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppShell } from "@/components/layout/AppShell";

// Layout del área de gestión. SUPER_ADMIN y AREA_LEADER (líder de área).
// Usuarios y Grupos siguen restringidos a SUPER_ADMIN en cada página.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = session?.user?.role;
  if (role !== "SUPER_ADMIN" && role !== "AREA_LEADER") redirect("/");

  return <AppShell>{children}</AppShell>;
}
