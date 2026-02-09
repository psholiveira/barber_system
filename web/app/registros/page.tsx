"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/Card";
import { PageTransition } from "@/components/PageTransition";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  Banknote,
  ClipboardList,
  CreditCard,
  DollarSign,
  Scissors,
  User,
} from "lucide-react";

type PaymentMethod = "PIX" | "CASH" | "CARD";

function todayISODate() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function money(v: any) {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n.toFixed(2) : "0.00";
}

export default function RegistrosPage() {
  const qc = useQueryClient();

  // Form
  const [serviceId, setServiceId] = useState<number | "">("");
  const [customerId, setCustomerId] = useState<number | "">("");
  const [price, setPrice] = useState<string>("");
  const [method, setMethod] = useState<PaymentMethod>("PIX");
  const [notes, setNotes] = useState<string>("");

  const [err, setErr] = useState<string | null>(null);

  // Serviços
  const { data: servicesData, isLoading: loadingServices } = useQuery({
    queryKey: ["services"],
    queryFn: async () => (await api.get("/services/?active=true&ordering=name")).data,
  });

  // Clientes
  const { data: customersData, isLoading: loadingCustomers } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => (await api.get("/customers/?ordering=name")).data,
  });

  // Caixa aberto (UX only — backend valida de verdade)
  const { data: cashSummary } = useQuery({
    queryKey: ["cash-open-summary"],
    queryFn: async () => (await api.get("/cash/open-summary/")).data,
    retry: false,
  });

  // Total do dia
  const { data: todayInfo, isLoading: loadingToday } = useQuery({
    queryKey: ["records-today"],
    queryFn: async () => (await api.get("/records/today/")).data,
  });

  // Últimos registros (MVP: pega os mais recentes)
  const { data: recordsData, isLoading: loadingRecords } = useQuery({
    queryKey: ["service-records-today"],
    queryFn: async () => (await api.get("/service-records/?ordering=-performed_at")).data,
  });

  const services = servicesData?.results ?? servicesData ?? [];
  const customers = customersData?.results ?? customersData ?? [];
  const records = (recordsData?.results ?? recordsData ?? []).slice(0, 20);

  const selectedService = useMemo(() => {
    if (!serviceId) return null;
    return services.find((s: any) => s.id === serviceId) ?? null;
  }, [serviceId, services]);

  // Auto-preço pelo default_price se vazio
  useMemo(() => {
    if (selectedService?.default_price != null && (!price || price === "0")) {
      setPrice(String(selectedService.default_price));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedService?.id]);

  const createMut = useMutation({
    mutationFn: async () => {
      setErr(null);

      if (!serviceId) throw new Error("Selecione um serviço.");
      if (!price) throw new Error("Informe o valor cobrado.");

      const payload: any = {
        service: serviceId,
        price_charged: price,
        performed_at: new Date().toISOString(),
        notes,
        payment_method: method,
        payment_amount: price,
      };

      if (customerId) payload.customer = customerId;

      return (await api.post("/service-records/", payload)).data;
    },
    onSuccess: async () => {
      setNotes("");
      setCustomerId("");
      qc.invalidateQueries({ queryKey: ["service-records-today"] });
      qc.invalidateQueries({ queryKey: ["records-today"] });
      qc.invalidateQueries({ queryKey: ["ops-summary"] });
    },
    onError: (e: any) => {
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.non_field_errors?.[0] ||
        e?.message ||
        "Erro ao registrar serviço.";
      setErr(String(msg));

      if (String(msg).toLowerCase().includes("caixa aberto")) {
        setTimeout(() => (window.location.href = "/caixa"), 600);
      }
    },
  });

  const methodIcon = useMemo(() => {
    if (method === "PIX") return <Banknote size={16} />;
    if (method === "CASH") return <DollarSign size={16} />;
    return <CreditCard size={16} />;
  }, [method]);

  return (
    <AppShell title="Registros">
      <PageTransition>
        <div className="grid gap-6 max-w-5xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
            <div>
              <div className="text-sm text-gray-500">Operação do dia</div>
              <div className="text-xl font-semibold text-gray-900">Registrar atendimento</div>
            </div>
            <div className="text-xs text-gray-500">
              Data: <b className="text-gray-900">{todayISODate()}</b>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card
              title="Hoje"
              right={
                <span className="inline-flex items-center gap-2 text-xs text-gray-500">
                  <ClipboardList size={16} /> Resumo
                </span>
              }
            >
              {loadingToday ? (
                <div className="grid gap-2">
                  <Skeleton className="h-6 w-44" />
                  <Skeleton className="h-4 w-28" />
                </div>
              ) : (
                <div className="text-sm">
                  <div className="text-gray-500">Total</div>
                  <div className="text-2xl font-semibold tracking-tight">
                    R$ {money(todayInfo?.total ?? 0)}
                  </div>
                  <div className="mt-2 text-gray-500">
                    Atendimentos: <b className="text-gray-900">{todayInfo?.count ?? 0}</b>
                  </div>
                </div>
              )}
            </Card>

            <Card title="Pagamento" right={<span className="text-xs text-gray-500">Na hora</span>}>
              <div className="text-sm text-gray-600 leading-relaxed">
                Ao registrar, o sistema cria o <b className="text-gray-900">pagamento</b> e a{" "}
                <b className="text-gray-900">comissão</b> automaticamente.
              </div>
            </Card>

            <Card title="Caixa" right={<span className="text-xs text-gray-500">Gerente/Admin</span>}>
              {cashSummary?.open === false ? (
                <div className="text-sm text-amber-700">
                  Não há caixa aberto. Abra em <b className="text-gray-900">Caixa</b>.
                </div>
              ) : (
                <div className="text-sm text-gray-600">
                  Se o caixa estiver aberto, os pagamentos entram automaticamente.
                </div>
              )}
            </Card>
          </div>

          {/* Form + recent list */}
          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            <Card
              title="Novo registro"
              right={
                <span className="inline-flex items-center gap-2 text-xs text-gray-500">
                  <Scissors size={16} /> Atendimento
                </span>
              }
            >
              <div className="grid gap-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Serviço</div>
                    <Select
                      value={serviceId}
                      onChange={(e) => setServiceId(e.target.value ? Number(e.target.value) : "")}
                    >
                      <option value="">
                        {loadingServices ? "Carregando..." : "Selecione..."}
                      </option>
                      {services.map((s: any) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 mb-1">Cliente (opcional)</div>
                    <Select
                      value={customerId}
                      onChange={(e) => setCustomerId(e.target.value ? Number(e.target.value) : "")}
                    >
                      <option value="">
                        {loadingCustomers ? "Carregando..." : "Sem cliente"}
                      </option>
                      {customers.map((c: any) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Valor cobrado</div>
                    <Input
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="Ex: 35.00"
                    />
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 mb-1">Método</div>
                    <Select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
                      <option value="PIX">PIX</option>
                      <option value="CASH">Dinheiro</option>
                      <option value="CARD">Cartão</option>
                    </Select>
                    <div className="mt-2 text-xs text-gray-500 inline-flex items-center gap-2">
                      {methodIcon} Pagamento na hora
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 mb-1">Observações</div>
                    <Input
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Opcional"
                    />
                  </div>
                </div>

                {err && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {err}
                  </div>
                )}

                <Button onClick={() => createMut.mutate()} disabled={createMut.isPending}>
                  {createMut.isPending ? "Salvando..." : "Registrar e receber"}
                </Button>
              </div>
            </Card>

            <Card
              title="Últimos registros"
              right={
                <span className="inline-flex items-center gap-2 text-xs text-gray-500">
                  <ClipboardList size={16} /> Recentes
                </span>
              }
            >
              {loadingRecords ? (
                <div className="grid gap-2">
                  <Skeleton className="h-14" />
                  <Skeleton className="h-14" />
                  <Skeleton className="h-14" />
                  <Skeleton className="h-14" />
                </div>
              ) : records.length === 0 ? (
                <div className="text-sm text-gray-500">Nenhum registro ainda.</div>
              ) : (
                <ul className="space-y-2">
                  {records.map((r: any) => (
                    <li key={r.id} className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-semibold text-sm text-gray-900 truncate">
                            {r.service_name ?? r.service}
                          </div>

                          <div className="text-xs text-gray-600 mt-1 flex flex-wrap gap-2">
                            {r.customer_name ? (
                              <span className="inline-flex items-center gap-1">
                                <User size={14} /> {r.customer_name}
                              </span>
                            ) : null}

                            {r.barber_username ? (
                              <span className="text-gray-500">• {r.barber_username}</span>
                            ) : null}
                          </div>

                          <div className="text-xs text-gray-500 mt-1">
                            {r.performed_at ? new Date(r.performed_at).toLocaleString() : ""}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-semibold text-gray-900">
                            R$ {money(r.price_charged)}
                          </div>
                        </div>
                      </div>
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
