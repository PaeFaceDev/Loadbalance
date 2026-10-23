'use client';

import {
  createContext,
  Suspense,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AuthUser, LoginResponse } from '@/lib/types';
import {
  clearSession,
  getStoredUser,
  loginRequest,
  persistSession,
} from '@/lib/auth';

interface AuthContextValue {
  user: AuthUser | null;
  ready: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function AuthProviderContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const stored = getStoredUser();

    setUser(stored);

    if (!stored) {
      clearSession();
    }

    setReady(true);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      ready,

      login: async (username, password) => {
        const session: LoginResponse = await loginRequest(
          username,
          password
        );

        persistSession(session);
        setUser(session.user);

        router.push('/');
      },

      logout: () => {
        clearSession();
        setUser(null);

        router.push('/login');
      },
    }),
    [user, ready, router]
  );

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">
        กำลังโหลดระบบคลัง...
      </div>
    );
  }

  if (!user && pathname !== '/login') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">
        กำลังไปหน้าเข้าสู่ระบบ...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">
          กำลังโหลดระบบคลัง...
        </div>
      }
    >
      <AuthProviderContent>{children}</AuthProviderContent>
    </Suspense>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}