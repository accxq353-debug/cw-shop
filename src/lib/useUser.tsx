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
  refresh: () => Promise<void>;
};

const UserContext = createContext<UserState | null>(null);

const TOKEN_KEY = "dt_token";
const USER_KEY = "dt_user_cached";

export function storeToken(token: string | null) {
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch {}
}

export function getToken(): string | null {
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function storeCachedUser(user: SessionUser | null) {
  try {
    if (user) window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    else window.localStorage.removeItem(USER_KEY);
  } catch {}
}

export function getCachedUser(): SessionUser | null {
  try {
    const raw = window.localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** fetch wrapper that always carries the session (cookie + bearer fallback). */
export function apiFetch(input: string, init: RequestInit = {}) {
  const hdrs = new Headers(init.headers);
  const token = getToken();
  if (token) {
    hdrs.set("x-dt-token", token);
    hdrs.set("Authorization", `Bearer ${token}`);
  }
  return fetch(input, { ...init, headers: hdrs, credentials: "include" });
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);

  const setUser = useCallback((newUser: SessionUser | null) => {
    setUserState(newUser);
    storeCachedUser(newUser);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const res = await apiFetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data && data.user) {
          const u = data.user as SessionUser;
          setUserState(u);
          storeCachedUser(u);
          if (data.token) {
            storeToken(data.token);
          }
          return;
        }
      }
      
      // If server returned 401 or null user, only clear if we didn't have an auth token
      // or if server explicitly said null
      const token = getToken();
      if (!token) {
        setUserState(null);
        storeCachedUser(null);
      } else {
        // If server failed (e.g. temporary network or warm-up), fall back to cached user
        const cached = getCachedUser();
        if (cached) {
          setUserState(cached);
        }
      }
    } catch {
      // Network error - keep cached user if we have a token
      const cached = getCachedUser();
      if (cached && getToken()) {
        setUserState(cached);
      }
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    // Immediately load cached user from localStorage on mount so UI doesn't flicker or log out instantly
    const cached = getCachedUser();
    if (cached) {
      setUserState(cached);
    }
    void refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } catch {}
    storeToken(null);
    storeCachedUser(null);
    setUserState(null);
  }, []);

  const value = useMemo<UserState>(
    () => ({ user, setUser, ready, logout, refresh }),
    [user, setUser, ready, logout, refresh],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser turi būti UserProvider viduje");
  return ctx;
}
