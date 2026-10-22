'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Suspense } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  MapPin, 
  TrendingUp, 
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

function SidebarContent() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/products', label: 'Products', icon: Package },
    { href: '/locations', label: 'Locations', icon: MapPin },
    { href: '/stock', label: 'Stock Operations', icon: TrendingUp },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div
      className={cn(
        "fixed left-0 top-0 h-screen bg-white border-r border-gray-200 shadow-sm transition-all duration-300 z-50 flex flex-col",
        collapsed ? "w-20" : "w-72"
      )}
    >
      {/* Logo */}
      <div className="h-20 flex items-center justify-center border-b border-gray-100">
        {!collapsed ? (
          <div className="flex items-center gap-3 px-6">
            <div className="w-10 h-10 bg-gradient-to-br from-[#0066CC] to-[#00B4D8] rounded-xl flex items-center justify-center shadow-lg">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-[#0066CC] block">Warehouse</span>
              <span className="text-xs text-gray-500">Management</span>
            </div>
          </div>
        ) : (
          <div className="w-10 h-10 bg-gradient-to-br from-[#0066CC] to-[#00B4D8] rounded-xl flex items-center justify-center shadow-lg">
            <Package className="h-6 w-6 text-white" />
          </div>
        )}
      </div>

      {/* Collapse Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-24 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 z-10 transition-all hover:shadow-md"
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4 text-gray-600" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-gray-600" />
        )}
      </button>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive
                  ? "bg-gradient-to-r from-[#E6F2FF] to-[#D6E8FF] text-[#0066CC] font-medium shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className={cn("h-5 w-5 flex-shrink-0 transition-colors", isActive ? "text-[#0066CC]" : "group-hover:text-[#0066CC]")} />
              {!collapsed && (
                <span className="transition-all">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100">
        {!collapsed && (
          <div className="bg-gradient-to-r from-[#E6F2FF] to-[#D6E8FF] rounded-xl p-4">
            <div className="text-xs font-semibold text-[#0066CC] mb-1">Warehouse System</div>
            <div className="text-xs text-gray-600">Version 1.0.0</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Sidebar() {
  return (
    <Suspense fallback={<div className="fixed left-0 top-0 h-screen w-72 bg-white border-r border-gray-200" />}>
      <SidebarContent />
    </Suspense>
  );
}
