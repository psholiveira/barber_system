"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/Button";

export function AppShell({ children, title }: { children: React.ReactNode; title?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setOpen(true)} className="md:hidden">
              Menu
            </Button>
            <div className="text-base font-semibold">{title ?? "Barbearia"}</div>
          </div>
          <div className="text-xs text-gray-500">Painel</div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {open && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
            <div className="absolute left-0 top-0 h-full w-70 bg-white p-4 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold">Menu</div>
                <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                  Fechar
                </Button>
              </div>
              <Sidebar />
            </div>
          </div>
        )}

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
