'use client';

import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Download } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { apiClient } from '@/lib/api-client';
import { StockBalance, StockMovement } from '@/lib/types';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDateTime, formatNumber, movementLabel } from '@/lib/format';

export default function ReportsPage() {
  const [balances, setBalances] = useState<StockBalance[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);

  useEffect(() => {
    void Promise.all([apiClient.getStockBalances(), apiClient.getStockMovements(200)]).then(([b, m]) => {
      setBalances(b);
      setMovements(m);
    });
  }, []);

  const bySku = useMemo(() => {
    const map = new Map<string, number>();
    balances.forEach((item) => map.set(item.productSku, (map.get(item.productSku) || 0) + Number(item.quantity)));
    return Array.from(map.entries()).map(([name, quantity]) => ({ name, quantity }));
  }, [balances]);

  const exportCsv = () => {
    const header = 'sku,product,location,quantity,reorderLevel,below\n';
    const rows = balances
      .map((item) =>
        [item.productSku, item.productName, item.locationCode, item.quantity, item.reorderLevel, item.belowReorderLevel].join(',')
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'stock-report.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="รายงานคลัง"
        description="สรุปยอดคงเหลือและการเคลื่อนไหว พร้อมส่งออก CSV"
        icon={<BarChart3 className="h-6 w-6" />}
        actions={
          <Button variant="outline" className="gap-2 rounded-xl" onClick={exportCsv}>
            <Download className="h-4 w-4" />
            ส่งออก CSV
          </Button>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>ยอดคงเหลือตาม SKU</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={bySku}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="quantity" fill="#2563eb" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>ล็อกการเคลื่อนไหว</CardTitle>
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
                  <TableCell>{movementLabel(item.type)}</TableCell>
                  <TableCell>{item.productSku}</TableCell>
                  <TableCell>{item.locationCode}</TableCell>
                  <TableCell>{formatNumber(item.quantity)}</TableCell>
                  <TableCell>{item.reference}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
