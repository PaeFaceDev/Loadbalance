'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Edit, Package, Plus, Search, Trash2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Product } from '@/lib/types';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatNumber } from '@/lib/format';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [term, setTerm] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setProducts(await apiClient.getProducts(false));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'โหลดสินค้าไม่สำเร็จ');
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    return products.filter((item) => {
      if (!showAll && !item.isActive) return false;
      const q = term.toLowerCase();
      return item.name.toLowerCase().includes(q) || item.sku.toLowerCase().includes(q);
    });
  }, [products, term, showAll]);

  const deactivate = async (id: string) => {
    const product = products.find((item) => item.id === id);
    if (!product || !confirm('ต้องการปิดใช้งานสินค้านี้?')) return;
    await apiClient.updateProduct(id, {
      name: product.name,
      unit: product.unit,
      reorderLevel: product.reorderLevel,
      isActive: false,
    });
    await load();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="สินค้า"
        description="มาสเตอร์ SKU สำหรับรับเข้า จ่ายออก และนับสต็อก"
        icon={<Package className="h-6 w-6" />}
        actions={
          <Link href="/products/new">
            <Button className="h-11 gap-2 rounded-xl">
              <Plus className="h-4 w-4" />
              เพิ่มสินค้า
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
            <Input className="h-11 pl-10" placeholder="ค้นหาชื่อหรือ SKU" value={term} onChange={(e) => setTerm(e.target.value)} />
          </div>
          <Button variant={showAll ? 'default' : 'outline'} className="h-11 rounded-xl" onClick={() => setShowAll((v) => !v)}>
            {showAll ? 'เฉพาะที่ใช้งาน' : 'แสดงทั้งหมด'}
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{filtered.length} รายการ</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>ชื่อ</TableHead>
                <TableHead>หน่วย</TableHead>
                <TableHead>จุดสั่งซื้อ</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead className="text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.sku}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.unit}</TableCell>
                  <TableCell>{formatNumber(product.reorderLevel)}</TableCell>
                  <TableCell>
                    <Badge variant={product.isActive ? 'default' : 'secondary'}>{product.isActive ? 'ใช้งาน' : 'ปิด'}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/products/${product.id}`}>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    {product.isActive && (
                      <Button variant="ghost" size="icon" className="text-rose-600" onClick={() => void deactivate(product.id)}>
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
