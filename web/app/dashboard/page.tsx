"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/Card";
import { PageTransition } from "@/components/PageTransition";
import { Skeleton } from "@/components/ui/Skeleton";
import { Banknote, ClipboardList, Wallet } from "lucide-react";

export default function DashboardPage() {
  const { data: today, isLoading } = useQuery({
    queryKey: ["records-today"],
    queryFn: async () => (await api.get("/records/today/")).data,
  });

  const total = Number(today?.total ?? 0);
  const count = Number(today?.count ?? 0);

  return (
    <AppShell title="Dashboard">
      <PageTransition>
        <div className="grid gap-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
            <div>
              <div className="text-sm text-gray-500">Visão geral do dia</div>
              <div className="text-xl font-semibold text-gray-900">Resumo</div>
            </div>
            <div className="text-xs text-gray-500">
              Atualiza automaticamente quando você registra um serviço.
            </div>
          </div>

          {/* Cards */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card
              title="Hoje"
              right={
                <span className="inline-flex items-center gap-2 text-xs text-gray-500">
                  <Banknote size={16} /> Faturamento
                </span>
              }
            >
              {isLoading ? (
                <div className="grid gap-2">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-28" />
                </div>
              ) : (
                <div className="text-sm">
                  <div className="text-gray-500">Total</div>
                  <div className="text-2xl font-semibold tracking-tight">
                    R$ {total.toFixed(2)}
                  </div>
                  <div className="mt-2 text-gray-500">
                    Atendimentos: <b className="text-gray-900">{count}</b>
                  </div>
                </div>
              )}
            </Card>

            <Card
              title="Operação"
              right={
                <span className="inline-flex items-center gap-2 text-xs text-gray-500">
                  <ClipboardList size={16} /> Lançamentos
                </span>
              }
            >
              <div className="text-sm text-gray-600 leading-relaxed">
                Use <b className="text-gray-900">Registros</b> para lançar serviços e pagamentos
                no dia a dia.
              </div>
            </Card>

            <Card
              title="Caixa"
              right={
                <span className="inline-flex items-center gap-2 text-xs text-gray-500">
                  <Wallet size={16} /> Financeiro
                </span>
              }
            >
              <div className="text-sm text-gray-600 leading-relaxed">
                Gerente/Admin: confira o <b className="text-gray-900">Caixa</b> para entradas,
                saídas e fechamento.
              </div>
            </Card>
          </div>

          {/* Next steps */}
          <Card title="Próximos passos">
            <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
              <li>Criar catálogo de serviços (Corte, Barba...)</li>
              <li>Abrir caixa (gerente/admin) no início do dia</li>
              <li>Registrar serviços com pagamento na hora</li>
            </ul>
          </Card>
        </div>
      </PageTransition>
    </AppShell>
  );
}
