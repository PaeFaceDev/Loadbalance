'use client';

import { FormEvent, useState } from 'react';
import { Boxes, Lock, ShieldCheck, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/components/auth-provider';
import { DEMO_ACCOUNTS } from '@/lib/auth';

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(username, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เข้าสู่ระบบไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className="warehouse-grid relative hidden overflow-hidden bg-slate-950 px-12 py-16 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600">
              <Boxes className="h-6 w-6" />
            </div>
            <div>
              <div className="text-lg font-semibold">NEXUS WMS</div>
              <div className="text-sm text-slate-400">โมดูลยืนยันตัวตนแยกจากระบบคลัง</div>
            </div>
          </div>
        </div>
        <div className="relative max-w-lg">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Warehouse Control Tower</p>
          <h1 className="mt-4 text-5xl font-semibold leading-tight">
            มองเห็นสต็อก
            <br />
            ควบคุมทุกกะงาน
          </h1>
          <p className="mt-5 text-slate-300">
            รับเข้า จ่ายออก โอนย้าย นับสต็อก และคิวงานคลังในที่เดียว พร้อมสิทธิ์ตามบทบาท Admin / Manager / Operator
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4 text-sm">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-2xl font-semibold">3</div>
              <div className="text-slate-400">บทบาทผู้ใช้</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-2xl font-semibold">JWT</div>
              <div className="text-slate-400">Auth API</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-2xl font-semibold">WMS</div>
              <div className="text-slate-400">Inbound / Outbound</div>
            </div>
          </div>
        </div>
        <div className="relative flex items-center gap-2 text-sm text-slate-400">
          <ShieldCheck className="h-4 w-4 text-cyan-300" />
          เซสชันถูกเก็บแยกจากหน้าปฏิบัติการคลัง
        </div>
      </section>

      <section className="flex items-center justify-center bg-[#F4F7FB] px-6 py-12">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/70">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900">เข้าสู่ระบบ</h2>
            <p className="mt-1 text-sm text-slate-500">ใช้บัญชีคลังเพื่อเข้าสู่ NEXUS WMS</p>
          </div>
          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              ชื่อผู้ใช้
              <div className="relative mt-1.5">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input className="h-11 pl-10" value={username} onChange={(e) => setUsername(e.target.value)} required />
              </div>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              รหัสผ่าน
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  className="h-11 pl-10"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </label>
            {error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}
            <Button type="submit" disabled={loading} className="h-11 w-full rounded-xl bg-slate-900 hover:bg-slate-800">
              {loading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}
            </Button>
          </form>
          <div className="mt-6">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">บัญชีทดลอง</p>
            <div className="space-y-2">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.username}
                  type="button"
                  onClick={() => {
                    setUsername(account.username);
                    setPassword(account.password);
                  }}
                  className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-left text-sm hover:border-cyan-300 hover:bg-cyan-50"
                >
                  <span className="font-medium text-slate-800">{account.displayName}</span>
                  <span className="font-mono text-xs text-slate-500">
                    {account.username} / {account.password}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
