'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { ClipboardCheck } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Location, Product, StockBalance } from '@/lib/types';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FeedbackBanner } from '@/components/feedback-banner';
import { formatNumber } from '@/lib/format';

export default function CycleCountPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [balances, setBalances] = useState<StockBalance[]>([]);
  const [productId, setProductId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [counted, setCounted] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [tone, setTone] = useState<'ok' | 'error'>('ok');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [p, l, b] = await Promise.all([
      apiClient.getProducts(true),
      apiClient.getLocations(true),
      apiClient.getStockBalances(),
    ]);
    setProducts(p);
    setLocations(l);
    setBalances(b);
  };

  useEffect(() => {
    void load().catch((err) => {
      setTone('error');
      setMessage(err instanceof Error ? err.message : 'โหลดข้อมูลไม่สำเร็จ');
    });
  }, []);

  const current = useMemo(
    () => balances.find((item) => item.productId === productId && item.locationId === locationId)?.quantity ?? 0,
    [balances, productId, locationId]
  );

  const delta = counted === '' ? 0 : Number(counted) - Number(current);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (delta === 0) {
      setTone('error');
      setMessage('ยอดที่นับเท่ากับระบบ ไม่ต้องปรับ');
      return;
    }
    setSaving(true);
    try {
      await apiClient.adjustStock({
        productId,
        locationId,
        delta,
        reference: `CC-${new Date().toISOString().slice(0, 10)}`,
        note: `นับได้ ${counted} ระบบ ${current}`,
      });
      setTone('ok');
      setMessage(`ปรับยอดแล้ว Δ ${delta}`);
      setCounted('');
      await load();
    } catch (err) {
      setTone('error');
      setMessage(err instanceof Error ? err.message : 'ปรับยอดไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="นับสต็อก (Cycle Count)"
        description="กรอกยอดที่นับได้ ระบบจะปรับเป็นส่วนต่างอัตโนมัติ"
        icon={<ClipboardCheck className="h-6 w-6" />}
      />
      <FeedbackBanner message={message} tone={tone} />
      <div className="grid gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>บันทึกการนับ</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <label className="block text-sm font-medium">
                สินค้า
                <Select name="productId" required className="mt-1.5" value={productId} onChange={(e) => setProductId(e.target.value)}>
                  <option value="">เลือก SKU</option>
                  {products.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.sku} · {item.name}
                    </option>
                  ))}
                </Select>
              </label>
              <label className="block text-sm font-medium">
                โลเคชัน
                <Select name="locationId" required className="mt-1.5" value={locationId} onChange={(e) => setLocationId(e.target.value)}>
                  <option value="">เลือกตำแหน่ง</option>
                  {locations.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.code} · {item.name}
                    </option>
                  ))}
                </Select>
              </label>
              <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                ยอดในระบบ: <span className="font-semibold text-slate-900">{formatNumber(current)}</span>
                <span className="ml-3">ส่วนต่าง: {delta}</span>
              </div>
              <label className="block text-sm font-medium">
                ยอดที่นับได้
                <Input
                  type="number"
                  min="0"
                  required
                  className="mt-1.5 h-11"
                  value={counted}
                  onChange={(e) => setCounted(e.target.value)}
                />
              </label>
              <Button type="submit" disabled={saving || !productId || !locationId} className="h-11 w-full rounded-xl">
                {saving ? 'กำลังบันทึก...' : 'ยืนยันการนับ'}
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>รายการแนะนำให้นับ</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>โลเคชัน</TableHead>
                  <TableHead>คงเหลือ</TableHead>
                  <TableHead>จุดสั่งซื้อ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {balances.map((item) => (
                  <TableRow
                    key={`${item.productId}-${item.locationId}`}
                    className="cursor-pointer"
                    onClick={() => {
                      setProductId(item.productId);
                      setLocationId(item.locationId);
                    }}
                  >
                    <TableCell>
                      {item.productSku}
                      <div className="text-xs text-slate-500">{item.productName}</div>
                    </TableCell>
                    <TableCell>{item.locationCode}</TableCell>
                    <TableCell>{formatNumber(item.quantity)}</TableCell>
                    <TableCell>{formatNumber(item.reorderLevel)}</TableCell>
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
