import type { ReactNode } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ChartCard({
  name = 'Statistic',
  children,
}: {
  name: string;
  children: ReactNode;
}) {
  return (
    <Card className='h-full max-h-none'>
      <CardHeader className='pb-2'>
        <CardTitle>{name}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
