"use client";
import { clearTokens } from "@/lib/auth";

export function Topbar() {
  return (
    <header className="h-14 border-b bg-white px-4 flex items-center justify-end">
      <button
        onClick={() => {
          clearTokens();
          window.location.href = "/login";
        }}
        className="rounded-lg border px-3 py-2 hover:bg-gray-50"
      >
        Sair
      </button>
    </header>
  );
}
