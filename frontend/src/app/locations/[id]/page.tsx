'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { MapPin } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Location } from '@/lib/types';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FeedbackBanner } from '@/components/feedback-banner';

export default function EditLocationPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiClient.getLocations(false).then((items) => {
      const found = items.find((item) => item.id === id);
      if (!found) setError('ไม่พบโลเคชัน');
      else setLocation(found);
    }).catch((err) => setError(err instanceof Error ? err.message : 'โหลดไม่สำเร็จ'));
  }, [id]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!location) return;
    const data = new FormData(event.currentTarget);
    setSaving(true);
    try {
      await apiClient.updateLocation(id, {
        name: String(data.get('name')),
        zone: String(data.get('zone')),
        isActive: data.get('isActive') === 'on',
      });
      router.push('/locations');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'บันทึกไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="แก้ไขโลเคชัน" description={location?.code} icon={<MapPin className="h-6 w-6" />} />
      <FeedbackBanner message={error} tone="error" />
      {location && (
        <Card>
          <CardContent className="p-6">
            <form onSubmit={onSubmit} className="space-y-4">
              <label className="block text-sm font-medium">ชื่อ *<Input name="name" defaultValue={location.name} required className="mt-1.5 h-11" /></label>
              <label className="block text-sm font-medium">โซน *<Input name="zone" defaultValue={location.zone} required className="mt-1.5 h-11" /></label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="isActive" defaultChecked={location.isActive} />
                ใช้งาน
              </label>
              <div className="flex justify-end gap-3">
                <Link href="/locations"><Button type="button" variant="outline">ยกเลิก</Button></Link>
                <Button type="submit" disabled={saving}>{saving ? 'กำลังบันทึก...' : 'บันทึก'}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
