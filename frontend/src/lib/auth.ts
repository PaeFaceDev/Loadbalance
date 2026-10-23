import { AuthUser, LoginResponse } from './types';

const TOKEN_KEY = 'wms_token';
const USER_KEY = 'wms_user';
const COOKIE = 'wms_auth';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const DEMO_ACCOUNTS = [
  { username: 'admin', password: 'Admin@123', role: 'Admin', displayName: 'Warehouse Admin' },
  { username: 'manager', password: 'Manager@123', role: 'Manager', displayName: 'ผู้จัดการคลัง' },
  { username: 'operator', password: 'Operator@123', role: 'Operator', displayName: 'พนักงานคลัง' },
] as const;

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function persistSession(session: LoginResponse) {
  localStorage.setItem(TOKEN_KEY, session.token);
  localStorage.setItem(USER_KEY, JSON.stringify(session.user));
  document.cookie = `${COOKIE}=1; path=/; max-age=${60 * 60 * 8}; SameSite=Lax`;
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  document.cookie = `${COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

export async function loginRequest(username: string, password: string): Promise<LoginResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      return response.json();
    }

    if (response.status === 401) {
      throw new Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }

    if (response.status !== 404) {
      const text = await response.text();
      throw new Error(text || `เข้าสู่ระบบไม่สำเร็จ (${response.status})`);
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('ไม่ถูกต้อง')) {
      throw error;
    }
  }

  const demo = DEMO_ACCOUNTS.find(
    (account) => account.username === username && account.password === password
  );
  if (!demo) {
    throw new Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
  }

  return {
    token: `demo.${btoa(`${demo.username}:${Date.now()}`)}`,
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    user: {
      id: `usr-${demo.username}`,
      username: demo.username,
      displayName: demo.displayName,
      role: demo.role,
      warehouse: 'BKK-DC01',
    },
  };
}

export function canAccess(role: string | undefined, href: string): boolean {
  if (!role) return false;
  if (role === 'Admin' || role === 'Manager') return true;
  const operatorAllowed = ['/', '/inbound', '/outbound', '/transfers', '/tasks', '/stock', '/alerts'];
  return operatorAllowed.includes(href);
}
