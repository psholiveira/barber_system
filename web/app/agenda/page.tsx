"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";

export default function AgendaPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["appointments"],
    queryFn: async () => (await api.get("/appointments/?ordering=start_at")).data,
  });

  return (
    <AppShell>
      <Card title="Agendamentos">
        {isLoading ? "..." : (
          <ul className="text-sm space-y-2">
            {data?.results?.map?.((a: any) => (
              <li key={a.id} className="border rounded-lg p-2 bg-gray-50">
                <div><b>{a.customer_name}</b> — {a.service_name}</div>
                <div>{new Date(a.start_at).toLocaleString()} · {a.status} · {a.barber_username}</div>
              </li>
            )) || "Sem dados"}
          </ul>
        )}
      </Card>
    </AppShell>
  );
}
