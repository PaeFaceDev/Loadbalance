'use client';

import { useEffect, useState } from 'react';
import { ListTodo } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { StockBalance, WarehouseTask } from '@/lib/types';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'wms_task_status';

export default function TasksPage() {
  const [tasks, setTasks] = useState<WarehouseTask[]>([]);

  useEffect(() => {
    const saved: Record<string, WarehouseTask['status']> = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    apiClient.getStockBalances().then((balances: StockBalance[]) => {
      const generated: WarehouseTask[] = balances.flatMap((item, index) => {
        const list: WarehouseTask[] = [];
        if (item.belowReorderLevel) {
          list.push({
            id: `replenish-${item.productId}-${item.locationId}`,
            type: 'replenish',
            title: `เติม ${item.productSku}`,
            detail: `โลเคชัน ${item.locationCode} ต่ำกว่าจุดสั่งซื้อ`,
            priority: 'high',
            status: saved[`replenish-${item.productId}-${item.locationId}`] ?? 'open',
            reference: item.locationCode,
          });
        }
        if (item.locationCode === 'STAGING' && Number(item.quantity) > 0) {
          list.push({
            id: `putaway-${item.productId}`,
            type: 'putaway',
            title: `Putaway ${item.productSku}`,
            detail: `ย้ายออกจาก STAGING จำนวน ${item.quantity}`,
            priority: 'medium',
            status: saved[`putaway-${item.productId}`] ?? 'open',
          });
        }
        if (index === 0) {
          list.push({
            id: `count-${item.locationId}`,
            type: 'count',
            title: `นับรอบโลเคชัน ${item.locationCode}`,
            detail: 'Cycle count ตามแผนรายวัน',
            priority: 'low',
            status: saved[`count-${item.locationId}`] ?? 'open',
          });
        }
        return list;
      });
      setTasks(generated.length ? generated : [
        {
          id: 'idle',
          type: 'pick',
          title: 'ไม่มีงานค้างจากสต็อกปัจจุบัน',
          detail: 'ระบบจะสร้างงานเติมของเมื่อมียอดต่ำกว่าจุดสั่งซื้อ',
          priority: 'low',
          status: 'done',
        },
      ]);
    });
  }, []);

  const updateStatus = (id: string, status: WarehouseTask['status']) => {
    const next = tasks.map((task) => (task.id === id ? { ...task, status } : task));
    setTasks(next);
    const map = Object.fromEntries(next.map((task) => [task.id, task.status]));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  };

  const tone = {
    high: 'destructive' as const,
    medium: 'default' as const,
    low: 'secondary' as const,
  };

  return (
    <div className="space-y-6">
      <PageHeader title="งานคลัง" description="คิวงาน putaway, เติมของ และนับสต็อกของกะนี้" icon={<ListTodo className="h-6 w-6" />} />
      <div className="grid gap-4">
        {tasks.map((task) => (
          <Card key={task.id}>
            <CardContent className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{task.title}</span>
                  <Badge variant={tone[task.priority]}>{task.priority}</Badge>
                  <Badge variant="outline">{task.type}</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-500">{task.detail}</p>
              </div>
              <div className="flex gap-2">
                {task.status !== 'in_progress' && task.status !== 'done' && (
                  <Button variant="secondary" className="rounded-xl" onClick={() => updateStatus(task.id, 'in_progress')}>
                    เริ่มงาน
                  </Button>
                )}
                {task.status !== 'done' && (
                  <Button className="rounded-xl" onClick={() => updateStatus(task.id, 'done')}>
                    ปิดงาน
                  </Button>
                )}
                {task.status === 'done' && <Badge>เสร็จแล้ว</Badge>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
