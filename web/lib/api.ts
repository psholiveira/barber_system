import axios from "axios";
import { getTokens, setTokens, clearTokens } from "./auth";

const rawBase = process.env.NEXT_PUBLIC_API_BASE;
if (!rawBase) {
  throw new Error("NEXT_PUBLIC_API_BASE não definido");
}

// remove barra final para evitar // nas rotas
const API_BASE = rawBase.replace(/\/+$/, "");

export const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  if (typeof window === "undefined") return config;
  const t = getTokens();
  if (t?.access) config.headers.Authorization = `Bearer ${t.access}`;
  return config;
});

let refreshing = false;
let queued: Array<(token: string | null) => void> = [];

function queue(cb: (token: string | null) => void) {
  queued.push(cb);
}
function flush(token: string | null) {
  queued.forEach((cb) => cb(token));
  queued = [];
}

api.interceptors.response.use(
  (r) => r,
  async (err) => {
    const original = err.config;

    // se não tem config ou já tentamos uma vez, devolve o erro
    if (!original || original._retry) throw err;

    // evita loop: se o 401 veio do refresh, não tente refresh de novo
    const url = String(original.url ?? "");
    if (err.response?.status === 401 && typeof window !== "undefined") {
      if (url.includes("/auth/refresh/")) {
        clearTokens();
        window.location.href = "/login";
        throw err;
      }

      const tokens = getTokens();
      if (!tokens?.refresh) {
        clearTokens();
        window.location.href = "/login";
        throw err;
      }

      original._retry = true;

      if (refreshing) {
        return new Promise((resolve, reject) => {
          queue((token) => {
            if (!token) return reject(err);
            original.headers.Authorization = `Bearer ${token}`;
            resolve(api(original));
          });
        });
      }

      refreshing = true;
      try {
        const resp = await axios.post(`${API_BASE}/auth/refresh/`, { refresh: tokens.refresh });
        const newAccess = resp.data.access as string;

        setTokens({ access: newAccess, refresh: tokens.refresh });
        flush(newAccess);

        original.headers.Authorization = `Bearer ${newAccess}`;
        return api(original);
      } catch {
        flush(null);
        clearTokens();
        window.location.href = "/login";
        throw err;
      } finally {
        refreshing = false;
      }
    }

    throw err;
  }
);
