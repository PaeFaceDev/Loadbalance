'use client';

import { useEffect, useMemo, useState } from 'react';
import { Boxes, Search } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { StockBalance, StockMovement } from '@/lib/types';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDateTime, formatNumber, movementLabel } from '@/lib/format';

export default function StockPage() {
  const [balances, setBalances] = useState<StockBalance[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [term, setTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([apiClient.getStockBalances(), apiClient.getStockMovements(80)])
      .then(([b, m]) => {
        setBalances(b);
        setMovements(m);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'โหลดสต็อกไม่สำเร็จ'));
  }, []);

  const filtered = useMemo(() => {
    const q = term.toLowerCase();
    return balances.filter(
      (item) =>
        item.productSku.toLowerCase().includes(q) ||
        item.productName.toLowerCase().includes(q) ||
        item.locationCode.toLowerCase().includes(q)
    );
  }, [balances, term]);

  return (
    <div className="space-y-6">
      <PageHeader title="ยอดคงเหลือ" description="ดูสต็อกทุกโลเคชันและความเคลื่อนไหวล่าสุด" icon={<Boxes className="h-6 w-6" />} />
      {error && <Card className="border-rose-200"><CardContent className="p-4 text-rose-700">{error}</CardContent></Card>}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input className="h-11 pl-10" placeholder="ค้นหา SKU / สินค้า / โลเคชัน" value={term} onChange={(e) => setTerm(e.target.value)} />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{filtered.length} รายการ</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>สินค้า</TableHead>
                <TableHead>โลเคชัน</TableHead>
                <TableHead>คงเหลือ</TableHead>
                <TableHead>จุดสั่งซื้อ</TableHead>
                <TableHead>สถานะ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={`${item.productId}-${item.locationId}`}>
                  <TableCell>
                    <div className="font-medium">{item.productName}</div>
                    <div className="text-xs text-slate-500">{item.productSku}</div>
                  </TableCell>
                  <TableCell>{item.locationCode}</TableCell>
                  <TableCell className="font-semibold">{formatNumber(item.quantity)}</TableCell>
                  <TableCell>{formatNumber(item.reorderLevel)}</TableCell>
                  <TableCell>
                    {item.belowReorderLevel ? <Badge variant="destructive">ต่ำ</Badge> : <Badge>ปกติ</Badge>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>ความเคลื่อนไหว</CardTitle>
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
                <TableHead>เอกสาร</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{formatDateTime(item.createdAt)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{movementLabel(item.type)}</Badge>
                  </TableCell>
                  <TableCell>{item.productSku}</TableCell>
                  <TableCell>{item.locationCode}</TableCell>
                  <TableCell>{formatNumber(item.quantity)}</TableCell>
                  <TableCell>{item.reference || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
