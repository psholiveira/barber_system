"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Scissors,
  Wallet,
  BadgePercent,
  CalendarDays,
} from "lucide-react";

type Role = "ADMIN" | "MANAGER" | "BARBER" | null;

export function Sidebar() {
  const pathname = usePathname();

  const { data } = useQuery({
    queryKey: ["me"],
    queryFn: async () => (await api.get("/me/")).data,
    staleTime: 60_000,
  });

  const role: Role = data?.role ?? null;

  const items = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["ADMIN", "MANAGER", "BARBER"] },
    { href: "/registros", label: "Registros", icon: ClipboardList, roles: ["ADMIN", "MANAGER", "BARBER"] },
    { href: "/clientes", label: "Clientes", icon: Users, roles: ["ADMIN", "MANAGER", "BARBER"] },
    { href: "/comissoes", label: "Comissões", icon: BadgePercent, roles: ["ADMIN", "MANAGER", "BARBER"] },
    { href: "/agenda", label: "Agenda", icon: CalendarDays, roles: ["ADMIN", "MANAGER"] },
    { href: "/caixa", label: "Caixa", icon: Wallet, roles: ["ADMIN", "MANAGER"] },
    { href: "/servicos", label: "Serviços", icon: Scissors, roles: ["ADMIN", "MANAGER"] },
  ];

  const filtered = items.filter((it) => !role || it.roles.includes(role));

  return (
    <aside className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div>
          <Image
    src="/brand/logo.png"
    alt="Rasoir Barbearia"
    width={180}
    height={48}
    className="object-contain"
  />
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {filtered.map((it) => {
          const active = pathname === it.href;
          const Icon = it.icon;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={[
                "group flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition",
                active ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
              ].join(" ")}
            >
              <Icon
                size={18}
                className={[
                  "transition",
                  active ? "text-white" : "text-gray-500 group-hover:text-gray-800",
                ].join(" ")}
              />
              <span className="font-medium">{it.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-5 text-xs text-gray-500">
        {data?.username ? (
          <>
            Logado: <b>{data.username}</b> {role ? <>· <b>{role}</b></> : null}
          </>
        ) : (
          "Carregando usuário..."
        )}
      </div>
    </aside>
  );
}
