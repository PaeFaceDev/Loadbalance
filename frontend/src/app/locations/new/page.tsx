'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FeedbackBanner } from '@/components/feedback-banner';

export default function NewLocationPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSaving(true);
    try {
      await apiClient.createLocation({
        code: String(data.get('code')),
        name: String(data.get('name')),
        zone: String(data.get('zone') || 'A'),
      });
      router.push('/locations');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'สร้างโลเคชันไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="เพิ่มโลเคชัน" description="รหัสตำแหน่ง โซน และชื่อเรียก" icon={<MapPin className="h-6 w-6" />} />
      <FeedbackBanner message={error} tone="error" />
      <Card>
        <CardContent className="p-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block text-sm font-medium">รหัส *<Input name="code" required placeholder="A-01-02" className="mt-1.5 h-11" /></label>
            <label className="block text-sm font-medium">ชื่อ *<Input name="name" required className="mt-1.5 h-11" /></label>
            <label className="block text-sm font-medium">โซน *<Input name="zone" required defaultValue="A" className="mt-1.5 h-11" /></label>
            <div className="flex justify-end gap-3">
              <Link href="/locations"><Button type="button" variant="outline">ยกเลิก</Button></Link>
              <Button type="submit" disabled={saving}>{saving ? 'กำลังบันทึก...' : 'สร้างโลเคชัน'}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
