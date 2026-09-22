"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type SessionUser = {
  id: number;
  email: string;
  name: string;
  role: string;
  discord: string | null;
  createdAt: string;
};

type UserState = {
  user: SessionUser | null;
  setUser: (user: SessionUser | null) => void;
  ready: boolean;
  logout: () => Promise<void>;
};

const UserContext = createContext<UserState | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await apiFetch("/api/auth/me");
      const data = await res.json();
      setUser((data.user as SessionUser) ?? null);
    } catch {
      setUser(null);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    storeToken(null);
    setUser(null);
  }, []);

  const value = useMemo<UserState>(
    () => ({ user, setUser, ready, logout }),
    [user, ready, logout],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser turi būti UserProvider viduje");
  return ctx;
}

const TOKEN_KEY = "dt_token";

export function storeToken(token: string | null) {
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    // storage blocked — cookies still carry the session
  }
}

export function getToken(): string | null {
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

/** fetch wrapper that always carries the session (cookie + bearer fallback). */
export function apiFetch(input: string, init: RequestInit = {}) {
  const hdrs = new Headers(init.headers);
  const token = getToken();
  if (token) hdrs.set("x-dt-token", token);
  return fetch(input, { ...init, headers: hdrs, credentials: "include" });
}
