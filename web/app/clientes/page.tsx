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
import { Search, UserPlus, Users } from "lucide-react";

export default function ClientesPage() {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["customers", search],
    queryFn: async () =>
      (await api.get(`/customers/?search=${encodeURIComponent(search)}`)).data,
  });

  const createMut = useMutation({
    mutationFn: async () => (await api.post("/customers/", { name })).data,
    onSuccess: () => {
      setName("");
      qc.invalidateQueries({ queryKey: ["customers"] });
      qc.invalidateQueries({ queryKey: ["customers", search] });
    },
  });

  const customers = useMemo(() => data?.results ?? [], [data]);

  return (
    <AppShell title="Clientes">
      <PageTransition>
        <div className="grid gap-6 max-w-4xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
            <div>
              <div className="text-sm text-gray-500">Base de clientes</div>
              <div className="text-xl font-semibold text-gray-900">Clientes</div>
            </div>
            <div className="text-xs text-gray-500">
              Dica: use o campo de busca para achar rápido.
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
            {/* Criar cliente */}
            <Card
              title="Novo cliente"
              right={
                <span className="inline-flex items-center gap-2 text-xs text-gray-500">
                  <UserPlus size={16} /> Cadastro
                </span>
              }
            >
              <div className="grid gap-3">
                <div className="text-xs text-gray-500">Nome</div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    placeholder="Ex: João Silva"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <Button
                    onClick={() => createMut.mutate()}
                    disabled={!name || createMut.isPending}
                    className="sm:w-40"
                  >
                    {createMut.isPending ? "Salvando..." : "Adicionar"}
                  </Button>
                </div>

                <div className="text-xs text-gray-500">
                  O cliente é opcional no registro de serviços — mas ajuda no histórico.
                </div>
              </div>
            </Card>

            {/* Lista + busca */}
            <Card
              title="Lista"
              right={
                <span className="inline-flex items-center gap-2 text-xs text-gray-500">
                  <Users size={16} /> {customers.length}
                </span>
              }
            >
              {/* Busca */}
              <div className="mb-3">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Search size={16} />
                  </span>
                  <Input
                    className="pl-9"
                    placeholder="Buscar por nome..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Conteúdo */}
              {isLoading ? (
                <div className="grid gap-2">
                  <Skeleton className="h-11" />
                  <Skeleton className="h-11" />
                  <Skeleton className="h-11" />
                  <Skeleton className="h-11" />
                  <Skeleton className="h-11" />
                </div>
              ) : customers.length === 0 ? (
                <div className="text-sm text-gray-500">
                  Nenhum cliente encontrado.
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {customers.map((c: any) => (
                    <li
                      key={c.id}
                      className="py-3 text-sm flex items-center justify-between"
                    >
                      <span className="font-medium text-gray-900">{c.name}</span>
                      <span className="text-xs text-gray-400">#{c.id}</span>
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
