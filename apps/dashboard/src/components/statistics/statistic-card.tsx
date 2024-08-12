import { useMemo } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Period = 'week' | 'month';

interface StatisticCardProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  value: number | string;
  percentage: number;
  period?: Period;
}

export default function StatisticCard({
  name = 'Statistic',
  value = 0,
  percentage = 0,
  period = 'week',
  ...props
}: StatisticCardProps) {
  const up = useMemo(() => percentage > 0, [percentage]);

  return (
    <Card className='h-full max-h-none max-w-sm' {...props}>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='whitespace-nowrap'>{name}</CardTitle>
      </CardHeader>
      {up != null && (
        <CardContent>
          <div className='font-mono text-2xl font-bold'>{value}</div>
          <p className='mt-1 text-xs text-muted-foreground'>{`${up ? '+' : ''}${percentage}% from last ${period}`}</p>
        </CardContent>
      )}
    </Card>
  );
}
