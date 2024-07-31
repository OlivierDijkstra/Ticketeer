'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components//ui/card';

export default function ChartCard({
  title,
  description,
  children,
}: {
  title: React.ReactNode | string;
  description?: React.ReactNode | string;
  children: React.ReactNode;
}) {
  return (
    <Card className='flex flex-col lg:max-w-md'>
      <CardHeader className='flex flex-row items-center gap-4 space-y-0 pb-2 [&>div]:flex-1'>
        <div>
          <CardTitle>{title}</CardTitle>

          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>

      <CardContent className='flex flex-1 items-center'>{children}</CardContent>
    </Card>
  );
}
