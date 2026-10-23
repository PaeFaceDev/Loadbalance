'use client';

import { Settings } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/components/auth-provider';
import { DEMO_ACCOUNTS } from '@/lib/auth';

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <PageHeader title="ตั้งค่า" description="โปรไฟล์ผู้ใช้และโมดูล Auth ที่แยกจากระบบคลัง" icon={<Settings className="h-6 w-6" />} />
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>บัญชีที่เข้าใช้</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="ชื่อ" value={user?.displayName} />
            <Row label="ผู้ใช้" value={user?.username} />
            <Row label="บทบาท" value={user?.role} />
            <Row label="คลัง" value={user?.warehouse} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Auth Service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-600">
            <p>เข้าสู่ระบบผ่าน <code className="rounded bg-slate-100 px-1">POST /api/auth/login</code> แล้วออก JWT</p>
            <p>หน้าปฏิบัติการคลังจะถูกกันไว้จนกว่าจะมีคุกกี้เซสชัน</p>
            <p>บัญชีทดลอง:</p>
            <ul className="list-disc pl-5">
              {DEMO_ACCOUNTS.map((account) => (
                <li key={account.username}>
                  {account.displayName} — {account.username} / {account.password}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-800">{value ?? '-'}</span>
    </div>
  );
}
