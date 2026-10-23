'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowLeftRight,
  Boxes,
  ClipboardCheck,
  Package,
  RefreshCw,
  Truck,
} from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { postgrestClient } from '@/lib/postgrest-client';
import { apiClient } from '@/lib/api-client';
import { StockBalance, StockMovement, SystemInfo } from '@/lib/types';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDateTime, formatNumber, movementLabel } from '@/lib/format';
import { useAuth } from '@/components/auth-provider';

const COLORS = ['#0ea5e9', '#2563eb', '#14b8a6', '#f59e0b', '#f43f5e'];

export default function DashboardPage() {
  const { user } = useAuth();
  const [balances, setBalances] = useState<StockBalance[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [overview, setOverview] = useState<any[]>([]);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const [stock, moves, restOverview, info] = await Promise.all([
        apiClient.getStockBalances(),
        apiClient.getStockMovements(30),
        postgrestClient.getStockOverview().catch(() => []),
        apiClient.getSystemInfo().catch(() => null),
      ]);
      setBalances(stock);
      setMovements(moves);
      setOverview(restOverview);
      setSystemInfo(info);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'โหลดแดชบอร์ดไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const metrics = useMemo(() => {
    const totalQty = balances.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    const low = balances.filter((item) => item.belowReorderLevel);
    const inbound = movements.filter((item) => item.type === 'Receive' || item.type === '1');
    const outbound = movements.filter((item) => item.type === 'Issue' || item.type === '2');
    return {
      skus: new Set(balances.map((item) => item.productId)).size,
      totalQty,
      locations: new Set(balances.map((item) => item.locationId)).size,
      low: low.length,
      inboundQty: inbound.reduce((sum, item) => sum + Number(item.quantity), 0),
      outboundQty: outbound.reduce((sum, item) => sum + Number(item.quantity), 0),
    };
  }, [balances, movements]);

  const locationChart = useMemo(() => {
    const map = new Map<string, number>();
    balances.forEach((item) => {
      map.set(item.locationCode, (map.get(item.locationCode) || 0) + Number(item.quantity || 0));
    });
    return Array.from(map.entries()).map(([name, quantity]) => ({ name, quantity }));
  }, [balances]);

  const pieData = useMemo(() => {
    const map: Record<string, number> = {};
    movements.forEach((item) => {
      const label = movementLabel(item.type);
      map[label] = (map[label] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [movements]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-80" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-rose-200">
        <CardContent className="p-6 text-rose-700">{error}</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={`สวัสดี ${user?.displayName ?? ''}`}
        description={`ศูนย์ควบคุมคลัง ${user?.warehouse ?? ''} · ${systemInfo ? `instance ${systemInfo.instanceId}` : 'พร้อมปฏิบัติงาน'}`}
        icon={<LayoutIcon />}
        actions={
          <Button variant="outline" className="gap-2 rounded-xl" onClick={() => void load()}>
            <RefreshCw className="h-4 w-4" />
            รีเฟรช
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="SKU ในคลัง" value={metrics.skus} icon={<Package className="h-5 w-5" />} hint="สินค้าที่มีสต็อก" />
        <StatCard label="ยอดคงเหลือรวม" value={formatNumber(metrics.totalQty)} icon={<Boxes className="h-5 w-5" />} tone="teal" />
        <StatCard label="โลเคชันที่ใช้งาน" value={metrics.locations} icon={<ClipboardCheck className="h-5 w-5" />} tone="slate" />
        <StatCard
          label="ต่ำกว่าจุดสั่งซื้อ"
          value={metrics.low}
          icon={<AlertTriangle className="h-5 w-5" />}
          tone="rose"
          hint="ต้องเติมหรือรับเข้า"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/inbound" className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <Truck className="h-5 w-5 text-cyan-600" />
          <div className="mt-3 font-semibold">รับสินค้าเข้า</div>
          <p className="mt-1 text-sm text-slate-500">บันทึก ASN / GRN เข้าโลเคชันรับ</p>
          <p className="mt-3 text-xs text-slate-400">ปริมาณรับล่าสุด {formatNumber(metrics.inboundQty)}</p>
        </Link>
        <Link href="/outbound" className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <Package className="h-5 w-5 text-blue-600" />
          <div className="mt-3 font-semibold">จ่าย / จัดส่ง</div>
          <p className="mt-1 text-sm text-slate-500">ตัดสต็อกตามออเดอร์หรือใบเบิก</p>
          <p className="mt-3 text-xs text-slate-400">ปริมาณจ่ายล่าสุด {formatNumber(metrics.outboundQty)}</p>
        </Link>
        <Link href="/transfers" className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <ArrowLeftRight className="h-5 w-5 text-teal-600" />
          <div className="mt-3 font-semibold">โอนย้ายโลเคชัน</div>
          <p className="mt-1 text-sm text-slate-500">Putaway จาก STAGING ไปชั้นเก็บ</p>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>สต็อกตามโลเคชัน</CardTitle>
            <CardDescription>ยอดคงเหลือรวมในแต่ละตำแหน่ง</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={locationChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Bar dataKey="quantity" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>ประเภทการเคลื่อนไหว</CardTitle>
            <CardDescription>สัดส่วนรายการล่าสุด</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>ความเคลื่อนไหวล่าสุด</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>เวลา</TableHead>
                  <TableHead>ประเภท</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>โลเคชัน</TableHead>
                  <TableHead>จำนวน</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.slice(0, 8).map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-slate-500">{formatDateTime(item.createdAt)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{movementLabel(item.type)}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{item.productSku}</TableCell>
                    <TableCell>{item.locationCode}</TableCell>
                    <TableCell>{formatNumber(item.quantity)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>รายการต้องเติม</CardTitle>
            <CardDescription>ต่ำกว่า reorder level</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {balances
              .filter((item) => item.belowReorderLevel)
              .slice(0, 6)
              .map((item) => (
                <div key={`${item.productId}-${item.locationId}`} className="rounded-xl border border-rose-100 bg-rose-50/60 p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-slate-800">{item.productName}</div>
                    <Badge variant="destructive">ต่ำ</Badge>
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {item.productSku} · {item.locationCode} · คงเหลือ {formatNumber(item.quantity)} / จุดสั่ง {formatNumber(item.reorderLevel)}
                  </div>
                </div>
              ))}
            {balances.filter((item) => item.belowReorderLevel).length === 0 && (
              <p className="text-sm text-slate-500">ไม่มีรายการต่ำกว่าจุดสั่งซื้อ</p>
            )}
            {overview.length > 0 && (
              <p className="text-xs text-slate-400">อ่านภาพรวมเพิ่มจาก PostgREST {overview.length} แถว</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function LayoutIcon() {
  return <Boxes className="h-6 w-6" />;
}
