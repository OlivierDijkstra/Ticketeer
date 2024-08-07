import { useMemo } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Period = 'week' | 'month';

export default function StatisticCard({
  name = 'Statistic',
  value = 0,
  percentage = 0,
  period = 'week',
}: {
  name: string;
  value: number | string;
  percentage: number;
  period?: Period;
}) {
  const up = useMemo(() => percentage > 0, [percentage]);

  return (
    <Card className='h-full max-h-none'>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle>{name}</CardTitle>
      </CardHeader>
      {up != null && (
        <CardContent>
          <div className='text-2xl font-bold font-mono'>{value}</div>
          <p className='text-xs text-muted-foreground mt-1'>{`${up ? '+' : ''}${percentage}% from last ${period}`}</p>
        </CardContent>
      )}
    </Card>
  );
}
