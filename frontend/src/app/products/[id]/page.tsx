'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Package } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Product } from '@/lib/types';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FeedbackBanner } from '@/components/feedback-banner';

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiClient.getProductById(id).then(setProduct).catch((err) => setError(err instanceof Error ? err.message : 'โหลดไม่สำเร็จ'));
  }, [id]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!product) return;
    const data = new FormData(event.currentTarget);
    setSaving(true);
    try {
      await apiClient.updateProduct(id, {
        name: String(data.get('name')),
        unit: String(data.get('unit')),
        reorderLevel: Number(data.get('reorderLevel')),
        isActive: data.get('isActive') === 'on',
      });
      router.push('/products');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'บันทึกไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  if (!product && !error) return <p className="text-slate-500">กำลังโหลด...</p>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="แก้ไขสินค้า" description={product?.sku} icon={<Package className="h-6 w-6" />} />
      <FeedbackBanner message={error} tone="error" />
      {product && (
        <Card>
          <CardContent className="p-6">
            <form onSubmit={onSubmit} className="space-y-4">
              <label className="block text-sm font-medium">ชื่อ *<Input name="name" defaultValue={product.name} required className="mt-1.5 h-11" /></label>
              <label className="block text-sm font-medium">หน่วย<Input name="unit" defaultValue={product.unit} className="mt-1.5 h-11" /></label>
              <label className="block text-sm font-medium">จุดสั่งซื้อ<Input name="reorderLevel" type="number" min="0" defaultValue={product.reorderLevel} className="mt-1.5 h-11" /></label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="isActive" defaultChecked={product.isActive} />
                ใช้งาน
              </label>
              <div className="flex justify-end gap-3">
                <Link href="/products"><Button type="button" variant="outline">ยกเลิก</Button></Link>
                <Button type="submit" disabled={saving}>{saving ? 'กำลังบันทึก...' : 'บันทึก'}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
