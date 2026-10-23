'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Edit, MapPin, Plus, Search, Trash2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Location } from '@/lib/types';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [term, setTerm] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLocations(await apiClient.getLocations(false));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'โหลดโลเคชันไม่สำเร็จ');
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    return locations.filter((item) => {
      if (!showAll && !item.isActive) return false;
      const q = term.toLowerCase();
      return item.name.toLowerCase().includes(q) || item.code.toLowerCase().includes(q) || item.zone.toLowerCase().includes(q);
    });
  }, [locations, term, showAll]);

  const deactivate = async (id: string) => {
    const location = locations.find((item) => item.id === id);
    if (!location || !confirm('ต้องการปิดใช้งานโลเคชันนี้?')) return;
    await apiClient.updateLocation(id, { name: location.name, zone: location.zone, isActive: false });
    await load();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="โลเคชัน"
        description="ชั้นเก็บ โซน และพื้นที่ปฏิบัติการในคลัง"
        icon={<MapPin className="h-6 w-6" />}
        actions={
          <Link href="/locations/new">
            <Button className="h-11 gap-2 rounded-xl">
              <Plus className="h-4 w-4" />
              เพิ่มโลเคชัน
            </Button>
          </Link>
        }
      />
      {error && (
        <Card className="border-rose-200">
          <CardContent className="p-4 text-rose-700">{error}</CardContent>
        </Card>
      )}
      <Card>
        <CardContent className="flex flex-col gap-3 pt-6 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input className="h-11 pl-10" placeholder="ค้นหารหัส ชื่อ หรือโซน" value={term} onChange={(e) => setTerm(e.target.value)} />
          </div>
          <Button variant={showAll ? 'default' : 'outline'} className="h-11 rounded-xl" onClick={() => setShowAll((v) => !v)}>
            {showAll ? 'เฉพาะที่ใช้งาน' : 'แสดงทั้งหมด'}
          </Button>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from(new Set(filtered.map((item) => item.zone))).map((zone) => (
          <Card key={zone}>
            <CardContent className="p-5">
              <div className="text-sm text-slate-500">โซน {zone}</div>
              <div className="mt-1 text-2xl font-semibold">{filtered.filter((item) => item.zone === zone).length} ช่อง</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{filtered.length} ตำแหน่ง</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>รหัส</TableHead>
                <TableHead>ชื่อ</TableHead>
                <TableHead>โซน</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead className="text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((location) => (
                <TableRow key={location.id}>
                  <TableCell className="font-medium">{location.code}</TableCell>
                  <TableCell>{location.name}</TableCell>
                  <TableCell>{location.zone}</TableCell>
                  <TableCell>
                    <Badge variant={location.isActive ? 'default' : 'secondary'}>{location.isActive ? 'ใช้งาน' : 'ปิด'}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/locations/${location.id}`}>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    {location.isActive && (
                      <Button variant="ghost" size="icon" className="text-rose-600" onClick={() => void deactivate(location.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
