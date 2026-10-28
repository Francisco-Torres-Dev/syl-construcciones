import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from './api';
import type { User } from './types';

type AuthCtx = {
  user: User | null; loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (d: { name: string; email: string; phone?: string; password: string }) => Promise<{ needsVerification?: boolean; message?: string }>;
  google: (credential: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (u: User) => void;
};
const Ctx = createContext<AuthCtx>(null!);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{ user: User | null }>('/auth/me').then((r) => setUser(r.user)).catch(() => setUser(null)).finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => setUser((await api<{ user: User }>('/auth/login', { json: { email, password } })).user), []);
  const google = useCallback(async (credential: string) => setUser((await api<{ user: User }>('/auth/google', { json: { credential } })).user), []);
  const register = useCallback(async (d: { name: string; email: string; phone?: string; password: string }) => {
    const r = await api<{ user?: User; needsVerification?: boolean; message?: string }>('/auth/register', { json: d });
    if (r.user) setUser(r.user);
    return r;
  }, []);
  const logout = useCallback(async () => { await api('/auth/logout', { method: 'POST' }); setUser(null); }, []);

  const value = useMemo(() => ({ user, loading, login, register, google, logout, setUser }), [user, loading, login, register, google, logout]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
