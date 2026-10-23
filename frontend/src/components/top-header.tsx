'use client';

import { Bell, LogOut, Search, Warehouse } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';

export function TopHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur-md md:px-8">
      <div className="hidden max-w-md flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400 md:flex">
        <Search className="h-4 w-4" />
        ค้นหา SKU, ใบรับ, ใบจ่าย, โลเคชัน...
      </div>
      <div className="ml-auto flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 sm:flex">
          <Warehouse className="h-3.5 w-3.5 text-cyan-700" />
          {user?.warehouse ?? 'BKK-DC01'}
        </div>
        <button className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-100" aria-label="การแจ้งเตือน">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500" />
        </button>
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white py-1 pl-1 pr-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-600 to-blue-700 text-sm font-semibold text-white">
            {user?.displayName?.slice(0, 1) ?? 'W'}
          </div>
          <div className="hidden leading-tight sm:block">
            <div className="text-sm font-semibold text-slate-800">{user?.displayName}</div>
            <div className="text-[11px] text-slate-500">{user?.role}</div>
          </div>
          <Button variant="ghost" size="icon" onClick={logout} className="h-8 w-8 text-slate-500" title="ออกจากระบบ">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
