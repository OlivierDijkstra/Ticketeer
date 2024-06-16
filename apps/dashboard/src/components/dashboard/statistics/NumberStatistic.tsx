import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function NumberStatistic({
  name = 'Statistic',
  value = 0,
  percentage = 0,
  up,
}: {
  name: string;
  value: number | string;
  percentage: number;
  up: boolean | null;
}) {
  return (
    <Card className='h-full max-h-none sm:max-w-sm'>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle>{name}</CardTitle>
      </CardHeader>
      {up != null && (
        <CardContent>
          <div className='text-2xl font-bold'>{value}</div>
          <p className='text-xs text-muted-foreground'>{`${up ? '+' : ''}${percentage}% from last week`}</p>
        </CardContent>
      )}
    </Card>
  );
}
