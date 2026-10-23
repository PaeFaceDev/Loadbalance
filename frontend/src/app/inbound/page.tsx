'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Truck } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Location, Product, StockMovement } from '@/lib/types';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FeedbackBanner } from '@/components/feedback-banner';
import { formatDateTime, formatNumber } from '@/lib/format';

export default function InboundPage() {
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
    setMovements(m.filter((item) => item.type === 'Receive' || item.type === '1'));
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
      await apiClient.receiveStock({
        productId: String(data.get('productId')),
        locationId: String(data.get('locationId')),
        quantity: Number(data.get('quantity')),
        reference: String(data.get('reference')),
        note: String(data.get('note') || '') || undefined,
      });
      form.reset();
      setTone('ok');
      setMessage('รับสินค้าเข้าเรียบร้อย');
      await load();
    } catch (err) {
      setTone('error');
      setMessage(err instanceof Error ? err.message : 'รับเข้าไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="รับสินค้าเข้า"
        description="บันทึก GRN / ASN แล้วเพิ่มยอดเข้าโลเคชันที่เลือก"
        icon={<Truck className="h-6 w-6" />}
      />
      <FeedbackBanner message={message} tone={tone} />
      <div className="grid gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>ใบรับเข้า</CardTitle>
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
                โลเคชันรับ
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
                <Input name="quantity" type="number" min="1" step="1" required className="mt-1.5 h-11" />
              </label>
              <label className="block text-sm font-medium">
                เลขที่เอกสาร *
                <Input name="reference" required placeholder="PO-2026-010 / ASN-88" className="mt-1.5 h-11" />
              </label>
              <label className="block text-sm font-medium">
                หมายเหตุ
                <Input name="note" placeholder="ซัพพลายเออร์ / ทะเบียนรถ" className="mt-1.5 h-11" />
              </label>
              <Button type="submit" disabled={saving} className="h-11 w-full rounded-xl">
                {saving ? 'กำลังบันทึก...' : 'ยืนยันรับเข้า'}
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>ประวัติรับเข้า</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>เวลา</TableHead>
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
                    <TableCell className="font-medium">{item.productSku}</TableCell>
                    <TableCell>{item.locationCode}</TableCell>
                    <TableCell>{formatNumber(item.quantity)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{item.reference}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {movements.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-slate-500">
                      ยังไม่มีรายการรับเข้า
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
