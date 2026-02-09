"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PageTransition } from "@/components/PageTransition";
import { Skeleton } from "@/components/ui/Skeleton";
import { useMemo, useState } from "react";
import { BadgePercent, PlusCircle, Scissors } from "lucide-react";

function money(v: any) {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n.toFixed(2) : "0.00";
}

export default function ServicosPage() {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("0");
  const [commission, setCommission] = useState("50");

  const { data, isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: async () => (await api.get("/services/?ordering=name")).data,
  });

  const createMut = useMutation({
    mutationFn: async () =>
      (
        await api.post("/services/", {
          name,
          default_price: price,
          default_commission_percent: commission,
          active: true,
        })
      ).data,
    onSuccess: () => {
      setName("");
      setPrice("0");
      setCommission("50");
      qc.invalidateQueries({ queryKey: ["services"] });
    },
  });

  const services = useMemo(() => (data?.results ?? data ?? []), [data]);

  return (
    <AppShell title="Serviços">
      <PageTransition>
        <div className="grid gap-6 max-w-5xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
            <div>
              <div className="text-sm text-gray-500">Catálogo</div>
              <div className="text-xl font-semibold text-gray-900">Serviços</div>
            </div>
            <div className="text-xs text-gray-500">
              Dica: defina a comissão padrão por serviço.
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
            {/* Create */}
            <Card
              title="Novo serviço"
              right={
                <span className="inline-flex items-center gap-2 text-xs text-gray-500">
                  <PlusCircle size={16} /> Cadastro
                </span>
              }
            >
              <div className="grid gap-3">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Nome</div>
                  <Input placeholder="Ex: Corte" value={name} onChange={(e) => setName(e.target.value)} />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Preço padrão</div>
                    <Input placeholder="Ex: 35.00" value={price} onChange={(e) => setPrice(e.target.value)} />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Comissão padrão (%)</div>
                    <Input placeholder="Ex: 50" value={commission} onChange={(e) => setCommission(e.target.value)} />
                  </div>
                </div>

                <Button onClick={() => createMut.mutate()} disabled={!name || createMut.isPending}>
                  {createMut.isPending ? "Salvando..." : "Adicionar serviço"}
                </Button>

                <div className="text-xs text-gray-500">
                  O valor e comissão podem ser ajustados por regras depois, se você quiser.
                </div>
              </div>
            </Card>

            {/* List */}
            <Card
              title="Serviços cadastrados"
              right={
                <span className="inline-flex items-center gap-2 text-xs text-gray-500">
                  <Scissors size={16} /> {services.length}
                </span>
              }
            >
              {isLoading ? (
                <div className="grid gap-2">
                  <Skeleton className="h-14" />
                  <Skeleton className="h-14" />
                  <Skeleton className="h-14" />
                  <Skeleton className="h-14" />
                </div>
              ) : services.length === 0 ? (
                <div className="text-sm text-gray-500">
                  Nenhum serviço cadastrado ainda.
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {services.map((s: any) => (
                    <li key={s.id} className="py-3 text-sm flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900 truncate">{s.name}</div>
                        <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-2">
                          <span>Preço: <b className="text-gray-900">R$ {money(s.default_price)}</b></span>
                          <span className="text-gray-300">•</span>
                          <span className="inline-flex items-center gap-1">
                            <BadgePercent size={14} />
                            Comissão: <b className="text-gray-900">{s.default_commission_percent}%</b>
                          </span>
                        </div>
                      </div>

                      <span
                        className={[
                          "text-xs px-2 py-1 rounded-full border",
                          s.active
                            ? "bg-green-50 text-green-700 border-green-100"
                            : "bg-gray-100 text-gray-600 border-gray-200",
                        ].join(" ")}
                      >
                        {s.active ? "Ativo" : "Inativo"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </div>
      </PageTransition>
    </AppShell>
  );
}
