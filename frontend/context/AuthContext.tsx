"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";

export interface NexusUser {
  id: string;
  email: string;
  name: string;
  role: "investor" | "ceo" | "student" | "admin";
}

interface AuthContextValue {
  user: NexusUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = "nexus_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<NexusUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.sessionStorage.getItem(TOKEN_KEY) : null;
    if (stored) {
      setToken(stored);
      apiFetch<NexusUser>("/api/auth/me", { token: stored })
        .then(setUser)
        .catch(() => {
          window.sessionStorage.removeItem(TOKEN_KEY);
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const persistSession = useCallback((newToken: string, newUser: NexusUser) => {
    window.sessionStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setUser(newUser);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await apiFetch<{ token: string; user: NexusUser }>("/api/auth/login", {
        method: "POST",
        body: { email, password },
      });
      persistSession(result.token, result.user);
    },
    [persistSession]
  );

  const register = useCallback(
    async (email: string, password: string, name: string) => {
      const result = await apiFetch<{ token: string; user: NexusUser }>("/api/auth/register", {
        method: "POST",
        body: { email, password, name, role: "investor" },
      });
      persistSession(result.token, result.user);
    },
    [persistSession]
  );

  const logout = useCallback(() => {
    window.sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout }),
    [user, token, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
