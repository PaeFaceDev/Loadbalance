'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { StockBalance } from '@/lib/types';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatNumber } from '@/lib/format';

export default function AlertsPage() {
  const [items, setItems] = useState<StockBalance[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .getStockBalances()
      .then(setItems)
      .catch((err) => setError(err instanceof Error ? err.message : 'โหลดไม่สำเร็จ'));
  }, []);

  const low = items.filter((item) => item.belowReorderLevel);
  const empty = items.filter((item) => Number(item.quantity) === 0);

  return (
    <div className="space-y-6">
      <PageHeader title="แจ้งเตือนคลัง" description="สินค้าต่ำกว่าจุดสั่งซื้อ และโลเคชันที่หมด" icon={<Bell className="h-6 w-6" />} />
      {error && <Card className="border-rose-200"><CardContent className="p-4 text-rose-700">{error}</CardContent></Card>}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <div className="text-sm text-slate-500">ต่ำกว่าจุดสั่งซื้อ</div>
            <div className="mt-1 text-3xl font-semibold text-rose-600">{low.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-sm text-slate-500">หมดสต็อก</div>
            <div className="mt-1 text-3xl font-semibold text-amber-600">{empty.length}</div>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-3">
        {low.map((item) => (
          <Card key={`${item.productId}-${item.locationId}`} className="border-rose-100">
            <CardContent className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{item.productName}</span>
                  <Badge variant="destructive">Reorder</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {item.productSku} ที่ {item.locationCode} · คงเหลือ {formatNumber(item.quantity)} / จุดสั่ง {formatNumber(item.reorderLevel)}
                </p>
              </div>
              <Link href="/inbound">
                <Button className="rounded-xl">สร้างใบรับเข้า</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
        {low.length === 0 && <p className="text-sm text-slate-500">ยังไม่มีการแจ้งเตือนระดับวิกฤต</p>}
      </div>
    </div>
  );
}
