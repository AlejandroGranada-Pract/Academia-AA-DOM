"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MembershipToggle } from "@/components/admin/MembershipToggle";

type Item = { id: string; title: string; subtitle?: string; member: boolean };

export function MembershipPicker({
  grupoId,
  kind,
  items,
  placeholder,
}: {
  grupoId: string;
  kind: "course" | "user";
  items: Item[];
  placeholder: string;
}) {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const filtered = query
    ? items.filter(
        (i) =>
          i.title.toLowerCase().includes(query) ||
          (i.subtitle?.toLowerCase().includes(query) ?? false),
      )
    : items;

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="px-1 py-4 text-sm text-muted-foreground">
          Sin resultados para “{q}”.
        </p>
      ) : (
        filtered.map((i) => (
          <MembershipToggle
            key={i.id}
            grupoId={grupoId}
            itemId={i.id}
            kind={kind}
            member={i.member}
            title={i.title}
            subtitle={i.subtitle}
          />
        ))
      )}
    </div>
  );
}
