"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/Card";
import { PageTransition } from "@/components/PageTransition";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ArrowDownLeft, ArrowUpRight, CircleDollarSign, Lock, Wallet } from "lucide-react";

type CashSummary =
  | { open: false }
  | {
      open: true;
      cash_session_id: number;
      opened_at: string;
      initial_amount: string | number;
      payments_total: string | number;
      entries_in: string | number;
      entries_out: string | number;
      expected_amount: string | number;
    };

function money(v: any) {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n.toFixed(2) : "0.00";
}

export default function CaixaPage() {
  const qc = useQueryClient();

  // Abrir caixa
  const [initial, setInitial] = useState("0");

  // Entrada / saída
  const [entryType, setEntryType] = useState<"IN" | "OUT">("IN");
  const [entryAmount, setEntryAmount] = useState("");
  const [entryDesc, setEntryDesc] = useState("");

  // Fechamento
  const [closingAmount, setClosingAmount] = useState("");

  const {
    data: summary,
    isLoading: loadingSummary,
    error: summaryErr,
  } = useQuery({
    queryKey: ["cash-open-summary"],
    queryFn: async () => (await api.get("/cash/open-summary/")).data as CashSummary,
    refetchInterval: 15_000,
    retry: false,
  });

  const openCashMut = useMutation({
    mutationFn: async () => (await api.post("/cash-sessions/", { initial_amount: initial })).data,
    onSuccess: () => {
      setInitial("0");
      qc.invalidateQueries({ queryKey: ["cash-open-summary"] });
    },
  });

  const addEntryMut = useMutation({
    mutationFn: async () => {
      if (!summary || summary.open === false) throw new Error("Não há caixa aberto.");
      return (
        await api.post("/cash-entries/", {
          cash_session: summary.cash_session_id,
          type: entryType,
          amount: entryAmount,
          description: entryDesc,
        })
      ).data;
    },
    onSuccess: () => {
      setEntryAmount("");
      setEntryDesc("");
      qc.invalidateQueries({ queryKey: ["cash-open-summary"] });
    },
  });

  const closeCashMut = useMutation({
    mutationFn: async () => {
      if (!summary || summary.open === false) throw new Error("Não há caixa aberto.");
      return (
        await api.post(`/cash-sessions/${summary.cash_session_id}/close/`, {
          closing_amount: closingAmount,
        })
      ).data;
    },
    onSuccess: () => {
      setClosingAmount("");
      qc.invalidateQueries({ queryKey: ["cash-open-summary"] });
    },
  });

  const expected = useMemo(() => {
    if (!summary || summary.open === false) return null;
    const n = Number(summary.expected_amount);
    return Number.isFinite(n) ? n : null;
  }, [summary]);

  const diff = useMemo(() => {
    if (expected === null || !closingAmount) return null;
    const n = Number(closingAmount) - expected;
    return Number.isFinite(n) ? n : null;
  }, [expected, closingAmount]);

  return (
    <AppShell title="Caixa">
      <PageTransition>
        <div className="grid gap-6 max-w-4xl">
          {/* Top summary */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card
              title="Status"
              right={
                <span className="inline-flex items-center gap-2 text-xs text-gray-500">
                  <Wallet size={16} /> Caixa
                </span>
              }
            >
              {loadingSummary ? (
                <div className="grid gap-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-28" />
                </div>
              ) : summaryErr ? (
                <div className="text-sm text-red-600">Erro ao carregar resumo.</div>
              ) : summary?.open ? (
                <div className="text-sm">
                  <div className="text-gray-500">Aberto em</div>
                  <div className="font-medium text-gray-900">
                    {new Date(summary.opened_at).toLocaleString()}
                  </div>
                  <div className="mt-2 inline-flex items-center gap-2 text-xs rounded-full bg-green-50 text-green-700 px-2 py-1">
                    <CircleDollarSign size={14} /> Aberto
                  </div>
                </div>
              ) : (
                <div className="text-sm">
                  <div className="text-gray-500">Nenhum caixa aberto</div>
                  <div className="mt-2 inline-flex items-center gap-2 text-xs rounded-full bg-gray-100 text-gray-700 px-2 py-1">
                    <Lock size={14} /> Fechado
                  </div>
                </div>
              )}
            </Card>

            <Card title="Esperado">
              {loadingSummary ? (
                <Skeleton className="h-8 w-44" />
              ) : summary?.open ? (
                <div className="text-sm">
                  <div className="text-gray-500">Total esperado</div>
                  <div className="text-2xl font-semibold tracking-tight">
                    R$ {money(summary.expected_amount)}
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Inicial + Pagamentos + Entradas − Saídas
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-600">Abra o caixa para ver o esperado.</div>
              )}
            </Card>

            <Card title="Movimentação">
              {loadingSummary ? (
                <div className="grid gap-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-4 w-44" />
                </div>
              ) : summary?.open ? (
                <div className="text-sm space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Inicial</span>
                    <b>R$ {money(summary.initial_amount)}</b>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Pagamentos</span>
                    <b>R$ {money(summary.payments_total)}</b>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Entradas</span>
                    <b>R$ {money(summary.entries_in)}</b>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Saídas</span>
                    <b>R$ {money(summary.entries_out)}</b>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-600">Sem movimentação.</div>
              )}
            </Card>
          </div>

          {/* Open cash */}
          {summary?.open === false && (
            <Card
              title="Abrir caixa"
              right={<span className="text-xs text-gray-500">Somente Manager/Admin</span>}
            >
              <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
                <div className="sm:w-56">
                  <div className="text-xs text-gray-500 mb-1">Valor inicial</div>
                  <Input value={initial} onChange={(e) => setInitial(e.target.value)} placeholder="Ex: 100.00" />
                </div>

                <Button onClick={() => openCashMut.mutate()} disabled={openCashMut.isPending}>
                  {openCashMut.isPending ? "Abrindo..." : "Abrir caixa"}
                </Button>

                {openCashMut.isError && (
                  <div className="text-sm text-red-600">Erro ao abrir caixa.</div>
                )}
              </div>
            </Card>
          )}

          {/* Entries + Close */}
          {summary?.open && (
            <div className="grid gap-6 md:grid-cols-2">
              <Card
                title="Entrada / Saída"
                right={
                  <span className="inline-flex items-center gap-2 text-xs text-gray-500">
                    {entryType === "IN" ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                    Lançamento
                  </span>
                }
              >
                <div className="grid gap-3">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Tipo</div>
                    <Select value={entryType} onChange={(e) => setEntryType(e.target.value as "IN" | "OUT")}>
                      <option value="IN">Entrada</option>
                      <option value="OUT">Saída</option>
                    </Select>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 mb-1">Valor</div>
                    <Input
                      value={entryAmount}
                      onChange={(e) => setEntryAmount(e.target.value)}
                      placeholder="Ex: 25.00"
                    />
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 mb-1">Descrição</div>
                    <Input
                      value={entryDesc}
                      onChange={(e) => setEntryDesc(e.target.value)}
                      placeholder="Ex: compra de lâminas"
                    />
                  </div>

                  <Button
                    onClick={() => addEntryMut.mutate()}
                    disabled={addEntryMut.isPending || !entryAmount || !entryDesc}
                  >
                    {addEntryMut.isPending ? "Registrando..." : "Registrar lançamento"}
                  </Button>

                  {addEntryMut.isError && (
                    <div className="text-sm text-red-600">Erro ao registrar lançamento.</div>
                  )}
                </div>
              </Card>

              <Card
                title="Fechar caixa"
                right={<span className="text-xs text-gray-500">Conferência final</span>}
              >
                <div className="grid gap-3">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Valor contado</div>
                    <Input
                      value={closingAmount}
                      onChange={(e) => setClosingAmount(e.target.value)}
                      placeholder="Ex: 350.00"
                    />
                  </div>

                  {expected !== null && closingAmount && (
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Esperado</span>
                        <b>R$ {expected.toFixed(2)}</b>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-gray-600">Diferença</span>
                        <b className={diff !== null && diff < 0 ? "text-red-700" : "text-gray-900"}>
                          R$ {(diff ?? 0).toFixed(2)}
                        </b>
                      </div>
                    </div>
                  )}

                  <Button
                    variant="danger"
                    onClick={() => closeCashMut.mutate()}
                    disabled={closeCashMut.isPending || !closingAmount}
                  >
                    {closeCashMut.isPending ? "Fechando..." : "Fechar caixa"}
                  </Button>

                  {closeCashMut.isError && (
                    <div className="text-sm text-red-600">Erro ao fechar o caixa.</div>
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>
      </PageTransition>
    </AppShell>
  );
}
