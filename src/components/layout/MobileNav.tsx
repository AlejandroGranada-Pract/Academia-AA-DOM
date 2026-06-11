"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MAIN_NAV, isNavItemActive } from "@/components/layout/nav-items";

// Menú inferior fijo, solo visible en celular (≤768px). En desktop manda el Sidebar.
export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-card md:hidden">
      {MAIN_NAV.map(({ href, label, icon: Icon }) => {
        const active = isNavItemActive(href, pathname);
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] transition-colors ${
              active ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Icon className="h-[22px] w-[22px]" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
