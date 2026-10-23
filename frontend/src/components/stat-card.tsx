import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = 'blue',
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: ReactNode;
  tone?: 'blue' | 'teal' | 'amber' | 'rose' | 'slate';
}) {
  const tones = {
    blue: 'from-blue-50 to-white text-blue-700 bg-blue-100',
    teal: 'from-cyan-50 to-white text-cyan-700 bg-cyan-100',
    amber: 'from-amber-50 to-white text-amber-700 bg-amber-100',
    rose: 'from-rose-50 to-white text-rose-700 bg-rose-100',
    slate: 'from-slate-50 to-white text-slate-700 bg-slate-100',
  };

  return (
    <Card className={cn('overflow-hidden border-slate-200/80 bg-gradient-to-br hover:shadow-md', tones[tone].split(' ').slice(0, 2).join(' '))}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
            {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
          </div>
          <div className={cn('rounded-xl p-2.5', tones[tone].split(' ').slice(2).join(' '))}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}
