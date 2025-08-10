import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { adminApi } from '../lib/apiClient';

export interface AuthUser {
  id: string;
  email: string;
  is_superuser?: boolean;
  roles?: string[];
  [k: string]: any; // allow additional backend fields
}

interface AuthState {
  loading: boolean;
  authenticated: boolean;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) { setLoading(false); return; }
    adminApi.me().then(u => setUser(u)).catch(()=>{
      localStorage.removeItem('admin_token');
    }).finally(()=> setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    try {
      const data = await adminApi.login(email, password);
      localStorage.setItem('admin_token', data.access_token);
      const me = await adminApi.me();
      setUser(me);
      return true;
    } catch {
      return false;
    }
  }

  function logout() {
    localStorage.removeItem('admin_token');
    setUser(null);
    window.location.href = '/login';
  }

  return <AuthContext.Provider value={{ loading, authenticated: !!user, user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
