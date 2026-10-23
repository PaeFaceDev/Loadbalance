'use client';

import { FormEvent, useEffect, useState } from 'react';
import { PackageMinus } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Location, Product, StockBalance, StockMovement } from '@/lib/types';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FeedbackBanner } from '@/components/feedback-banner';
import { formatDateTime, formatNumber } from '@/lib/format';

export default function OutboundPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [balances, setBalances] = useState<StockBalance[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [tone, setTone] = useState<'ok' | 'error'>('ok');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [p, l, b, m] = await Promise.all([
      apiClient.getProducts(true),
      apiClient.getLocations(true),
      apiClient.getStockBalances(),
      apiClient.getStockMovements(80),
    ]);
    setProducts(p);
    setLocations(l);
    setBalances(b);
    setMovements(m.filter((item) => item.type === 'Issue' || item.type === '2'));
  };

  useEffect(() => {
    void load().catch((err) => {
      setTone('error');
      setMessage(err instanceof Error ? err.message : 'โหลดข้อมูลไม่สำเร็จ');
    });
  }, []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setSaving(true);
    try {
      await apiClient.issueStock({
        productId: String(data.get('productId')),
        locationId: String(data.get('locationId')),
        quantity: Number(data.get('quantity')),
        reference: String(data.get('reference')),
        note: String(data.get('note') || '') || undefined,
      });
      form.reset();
      setTone('ok');
      setMessage('จ่ายสินค้าออกเรียบร้อย');
      await load();
    } catch (err) {
      setTone('error');
      setMessage(err instanceof Error ? err.message : 'จ่ายออกไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="จ่าย / จัดส่ง"
        description="ตัดสต็อกตามใบเบิก หรือออเดอร์จัดส่ง"
        icon={<PackageMinus className="h-6 w-6" />}
      />
      <FeedbackBanner message={message} tone={tone} />
      <div className="grid gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>ใบจ่ายออก</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <label className="block text-sm font-medium">
                สินค้า
                <Select name="productId" required className="mt-1.5">
                  <option value="">เลือก SKU</option>
                  {products.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.sku} · {item.name}
                    </option>
                  ))}
                </Select>
              </label>
              <label className="block text-sm font-medium">
                โลเคชันหยิบ
                <Select name="locationId" required className="mt-1.5">
                  <option value="">เลือกตำแหน่ง</option>
                  {locations.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.code} · {item.name}
                    </option>
                  ))}
                </Select>
              </label>
              <label className="block text-sm font-medium">
                จำนวน
                <Input name="quantity" type="number" min="1" required className="mt-1.5 h-11" />
              </label>
              <label className="block text-sm font-medium">
                เลขที่เอกสาร *
                <Input name="reference" required placeholder="SO-2026-441 / PICK-12" className="mt-1.5 h-11" />
              </label>
              <label className="block text-sm font-medium">
                หมายเหตุ
                <Input name="note" placeholder="ลูกค้า / รอบรถ" className="mt-1.5 h-11" />
              </label>
              <Button type="submit" disabled={saving} className="h-11 w-full rounded-xl">
                {saving ? 'กำลังตัดสต็อก...' : 'ยืนยันจ่ายออก'}
              </Button>
            </form>
          </CardContent>
        </Card>
        <div className="space-y-6 xl:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>ตำแหน่งที่หยิบได้</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>โลเคชัน</TableHead>
                    <TableHead>คงเหลือ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {balances.slice(0, 8).map((item) => (
                    <TableRow key={`${item.productId}-${item.locationId}`}>
                      <TableCell>
                        {item.productSku}
                        <div className="text-xs text-slate-500">{item.productName}</div>
                      </TableCell>
                      <TableCell>{item.locationCode}</TableCell>
                      <TableCell className="font-semibold">{formatNumber(item.quantity)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>ประวัติจ่ายออก</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>เวลา</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>จำนวน</TableHead>
                    <TableHead>เอกสาร</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{formatDateTime(item.createdAt)}</TableCell>
                      <TableCell>{item.productSku}</TableCell>
                      <TableCell>{formatNumber(item.quantity)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.reference}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
