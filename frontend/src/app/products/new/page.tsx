'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Package } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FeedbackBanner } from '@/components/feedback-banner';

export default function NewProductPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSaving(true);
    try {
      await apiClient.createProduct({
        sku: String(data.get('sku')),
        name: String(data.get('name')),
        unit: String(data.get('unit') || 'pcs'),
        reorderLevel: Number(data.get('reorderLevel') || 0),
      });
      router.push('/products');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'สร้างสินค้าไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="เพิ่มสินค้า" description="กำหนด SKU หน่วยนับ และจุดสั่งซื้อ" icon={<Package className="h-6 w-6" />} />
      <FeedbackBanner message={error} tone="error" />
      <Card>
        <CardContent className="p-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block text-sm font-medium">SKU *<Input name="sku" required className="mt-1.5 h-11" /></label>
            <label className="block text-sm font-medium">ชื่อ *<Input name="name" required className="mt-1.5 h-11" /></label>
            <label className="block text-sm font-medium">หน่วย<Input name="unit" defaultValue="pcs" className="mt-1.5 h-11" /></label>
            <label className="block text-sm font-medium">จุดสั่งซื้อ<Input name="reorderLevel" type="number" min="0" defaultValue={10} className="mt-1.5 h-11" /></label>
            <div className="flex justify-end gap-3">
              <Link href="/products"><Button type="button" variant="outline">ยกเลิก</Button></Link>
              <Button type="submit" disabled={saving}>{saving ? 'กำลังบันทึก...' : 'สร้างสินค้า'}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
