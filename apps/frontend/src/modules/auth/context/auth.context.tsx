'use client';

import Cookies from 'js-cookie';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { decodeJwtPayload } from '../util/jwt.util';

const COOKIE_NAME = 'auth_token';
const COOKIE_EXPIRES_DAYS = 7;

type AuthUser = {
  id: string;
  name: string;
  email: string;
};

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  status: AuthStatus;
  login: (token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    const storedToken = Cookies.get(COOKIE_NAME);

    if (!storedToken) {
      setStatus('unauthenticated');
      return;
    }

    const payload = decodeJwtPayload(storedToken);

    if (!payload) {
      Cookies.remove(COOKIE_NAME);
      setStatus('unauthenticated');
      return;
    }

    setToken(storedToken);
    setUser({ id: payload.sub, name: payload.name, email: payload.email });
    setStatus('authenticated');
  }, []);

  function login(newToken: string) {
    const payload = decodeJwtPayload(newToken);
    if (!payload) return;

    Cookies.set(COOKIE_NAME, newToken, {
      expires: COOKIE_EXPIRES_DAYS,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    setToken(newToken);
    setUser({ id: payload.sub, name: payload.name, email: payload.email });
    setStatus('authenticated');
  }

  function logout() {
    Cookies.remove(COOKIE_NAME);
    setToken(null);
    setUser(null);
    setStatus('unauthenticated');
  }

  return (
    <AuthContext.Provider value={{ user, token, status, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
