export type Tokens = { access: string; refresh: string };

const ACCESS_KEY = "bb_access";
const REFRESH_KEY = "bb_refresh";

export function getTokens(): Tokens | null {
  const access = localStorage.getItem(ACCESS_KEY);
  const refresh = localStorage.getItem(REFRESH_KEY);
  if (!access || !refresh) return null;
  return { access, refresh };
}

export function setTokens(t: Tokens) {
  localStorage.setItem(ACCESS_KEY, t.access);
  localStorage.setItem(REFRESH_KEY, t.refresh);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}
