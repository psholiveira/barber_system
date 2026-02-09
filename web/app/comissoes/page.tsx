"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/Card";
import { PageTransition } from "@/components/PageTransition";
import { Skeleton } from "@/components/ui/Skeleton";
import { BadgePercent, CalendarDays, Scissors, User } from "lucide-react";

function money(v: any) {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n.toFixed(2) : "0.00";
}

export default function ComissoesPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["commissions"],
    queryFn: async () => (await api.get("/commissions/?ordering=-created_at")).data,
  });

  const rows = (data?.results ?? []).slice(0, 50);

  return (
    <AppShell title="Comissões">
      <PageTransition>
        <div className="grid gap-6 max-w-5xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
            <div>
              <div className="text-sm text-gray-500">Pagamentos e repasses</div>
              <div className="text-xl font-semibold text-gray-900">Comissões</div>
            </div>
            <div className="text-xs text-gray-500">
              Mostra suas comissões (ou todas, se Manager/Admin).
            </div>
          </div>

          <Card
            title="Comissões recentes"
            right={
              <span className="inline-flex items-center gap-2 text-xs text-gray-500">
                <BadgePercent size={16} /> Últimas 50
              </span>
            }
          >
            {isLoading ? (
              <div className="grid gap-2">
                <Skeleton className="h-14" />
                <Skeleton className="h-14" />
                <Skeleton className="h-14" />
                <Skeleton className="h-14" />
                <Skeleton className="h-14" />
              </div>
            ) : isError ? (
              <div className="text-sm text-red-600">Erro ao carregar comissões.</div>
            ) : rows.length === 0 ? (
              <div className="text-sm text-gray-500">
                Nenhuma comissão ainda. Registre um serviço para gerar.
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {rows.map((c: any) => (
                  <li key={c.id} className="py-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-900 truncate">
                          {c.barber_username ?? c.barber}
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                          <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2 py-1">
                            <User size={14} />
                            Barbeiro
                          </span>

                          {c.service_name ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2 py-1">
                              <Scissors size={14} />
                              {c.service_name}
                            </span>
                          ) : null}

                          {c.created_at ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2 py-1">
                              <CalendarDays size={14} />
                              {new Date(c.created_at).toLocaleString()}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-sm text-gray-500">Comissão</div>
                        <div className="text-lg font-semibold tracking-tight text-gray-900">
                          R$ {money(c.commission_amount ?? c.amount)}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </PageTransition>
    </AppShell>
  );
}
