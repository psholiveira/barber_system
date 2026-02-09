"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { setTokens } from "@/lib/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PageTransition } from "@/components/PageTransition";
import { Lock, User, Scissors } from "lucide-react";
import Image from "next/image";


export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    if (loading) return;
    setErr(null);
    setLoading(true);
    try {
      const resp = await api.post("/auth/login/", { username, password });
      setTokens({ access: resp.data.access, refresh: resp.data.refresh });
      window.location.href = "/dashboard";
    } catch (e: any) {
      setErr(e?.response?.data?.detail || "Usuário ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <PageTransition>
        <div className="w-full max-w-md">
          {/* Brand */}
          <div className="flex items-center justify-center mb-4">
           <Image
            src="/brand/logo.png"
            alt="Rasoir Barbearia"
            width={200}
            height={60}
           priority
           className="object-contain"
           />
</div>


          {/* Card */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
            <div className="text-xl font-semibold text-gray-900">Entrar</div>
            <div className="text-sm text-gray-500 mt-1">Acesse o painel da barbearia</div>

            <div className="mt-5 grid gap-3">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <User size={16} />
                </span>
                <Input
                  className="pl-9"
                  placeholder="Usuário"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onSubmit();
                  }}
                />
              </div>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={16} />
                </span>
                <Input
                  className="pl-9"
                  placeholder="Senha"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onSubmit();
                  }}
                />
              </div>

              {err && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {err}
                </div>
              )}

              <Button onClick={onSubmit} disabled={loading || !username || !password}>
                {loading ? "Entrando..." : "Entrar"}
              </Button>

              <div className="text-xs text-gray-500 text-center">
                Se você esqueceu o acesso, peça ao gerente/admin para resetar sua senha.
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} Barbearia · Painel interno
          </div>
        </div>
      </PageTransition>
    </div>
  );
}
