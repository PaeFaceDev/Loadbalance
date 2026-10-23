'use client';

import { FormEvent, useEffect, useState } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Location, Product, StockMovement } from '@/lib/types';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FeedbackBanner } from '@/components/feedback-banner';
import { formatDateTime, formatNumber, movementLabel } from '@/lib/format';
import { Badge } from '@/components/ui/badge';

export default function TransfersPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [tone, setTone] = useState<'ok' | 'error'>('ok');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [p, l, m] = await Promise.all([
      apiClient.getProducts(true),
      apiClient.getLocations(true),
      apiClient.getStockMovements(80),
    ]);
    setProducts(p);
    setLocations(l);
    setMovements(m.filter((item) => String(item.type).includes('Transfer') || item.type === '3' || item.type === '4'));
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
      await apiClient.transferStock({
        productId: String(data.get('productId')),
        fromLocationId: String(data.get('fromLocationId')),
        toLocationId: String(data.get('toLocationId')),
        quantity: Number(data.get('quantity')),
        reference: String(data.get('reference')),
        note: String(data.get('note') || '') || undefined,
      });
      form.reset();
      setTone('ok');
      setMessage('โอนย้ายเรียบร้อย');
      await load();
    } catch (err) {
      setTone('error');
      setMessage(err instanceof Error ? err.message : 'โอนย้ายไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="โอนย้ายโลเคชัน"
        description="Putaway จากโซนรับเข้าไปชั้นเก็บ หรือย้ายระหว่างทางเดิน"
        icon={<ArrowLeftRight className="h-6 w-6" />}
      />
      <FeedbackBanner message={message} tone={tone} />
      <div className="grid gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>ใบโอนย้าย</CardTitle>
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
                จากโลเคชัน
                <Select name="fromLocationId" required className="mt-1.5">
                  <option value="">ต้นทาง</option>
                  {locations.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.code} · {item.name}
                    </option>
                  ))}
                </Select>
              </label>
              <label className="block text-sm font-medium">
                ไปโลเคชัน
                <Select name="toLocationId" required className="mt-1.5">
                  <option value="">ปลายทาง</option>
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
                <Input name="reference" required placeholder="TR-2026-015" className="mt-1.5 h-11" />
              </label>
              <label className="block text-sm font-medium">
                หมายเหตุ
                <Input name="note" placeholder="Putaway / ย้ายชั้น" className="mt-1.5 h-11" />
              </label>
              <Button type="submit" disabled={saving} className="h-11 w-full rounded-xl">
                {saving ? 'กำลังโอน...' : 'ยืนยันโอนย้าย'}
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>ประวัติโอนย้าย</CardTitle>
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
                {movements.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{formatDateTime(item.createdAt)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{movementLabel(item.type)}</Badge>
                    </TableCell>
                    <TableCell>{item.productSku}</TableCell>
                    <TableCell>{item.locationCode}</TableCell>
                    <TableCell>{formatNumber(item.quantity)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
