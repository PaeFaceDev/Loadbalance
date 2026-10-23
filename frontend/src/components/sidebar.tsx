'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Suspense, useState } from 'react';
import {
  LayoutDashboard,
  Package,
  MapPin,
  Boxes,
  Truck,
  PackageMinus,
  ArrowLeftRight,
  ClipboardCheck,
  Bell,
  ListTodo,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth-provider';
import { canAccess } from '@/lib/auth';

const groups = [
  {
    label: 'ภาพรวม',
    items: [
      { href: '/', label: 'แดชบอร์ด', icon: LayoutDashboard },
      { href: '/tasks', label: 'งานคลัง', icon: ListTodo },
      { href: '/alerts', label: 'แจ้งเตือน', icon: Bell },
    ],
  },
  {
    label: 'ปฏิบัติการ',
    items: [
      { href: '/inbound', label: 'รับสินค้าเข้า', icon: Truck },
      { href: '/outbound', label: 'จ่าย/จัดส่ง', icon: PackageMinus },
      { href: '/transfers', label: 'โอนย้าย', icon: ArrowLeftRight },
      { href: '/cycle-count', label: 'นับสต็อก', icon: ClipboardCheck },
      { href: '/stock', label: 'ยอดคงเหลือ', icon: Boxes },
    ],
  },
  {
    label: 'มาสเตอร์',
    items: [
      { href: '/products', label: 'สินค้า', icon: Package },
      { href: '/locations', label: 'โลเคชัน', icon: MapPin },
      { href: '/reports', label: 'รายงาน', icon: BarChart3 },
      { href: '/settings', label: 'ตั้งค่า', icon: Settings },
    ],
  },
];

function SidebarContent() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-slate-800/80 bg-slate-950 text-slate-200 shadow-2xl transition-all duration-300',
        collapsed ? 'w-20' : 'w-72'
      )}
    >
      <div className="flex h-16 items-center border-b border-white/10 px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-900/40">
            <Boxes className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <div className="text-sm font-semibold tracking-wide text-white">NEXUS WMS</div>
              <div className="text-[11px] text-slate-400">Warehouse Control</div>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => setCollapsed((value) => !value)}
        className="absolute -right-3 top-20 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-300 shadow"
        aria-label="ย่อเมนู"
      >
        {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {groups.map((group) => {
          const items = group.items.filter((item) => canAccess(user?.role, item.href));
          if (items.length === 0) return null;
          return (
            <div key={group.label}>
              {!collapsed && (
                <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {group.label}
                </div>
              )}
              <div className="space-y-1">
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition',
                        isActive
                          ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-white shadow-inner'
                          : 'text-slate-400 hover:bg-white/5 hover:text-white'
                      )}
                    >
                      <Icon className={cn('h-5 w-5', isActive ? 'text-cyan-300' : '')} />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        {!collapsed && (
          <div className="rounded-2xl bg-white/5 p-3 text-xs text-slate-400">
            <div className="font-medium text-slate-200">กะปัจจุบัน · Day Shift</div>
            <div className="mt-1">เวอร์ชัน 2.0 · Auth แยกโมดูล</div>
          </div>
        )}
      </div>
    </aside>
  );
}

export default function Sidebar() {
  return (
    <Suspense fallback={<div className="fixed left-0 top-0 h-screen w-72 bg-slate-950" />}>
      <SidebarContent />
    </Suspense>
  );
}
