import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components//ui/card';
import type { DateRanges } from '@/components/charts/lib';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DATE_RANGES } from '@/lib/constants';

export default function ChartCard({
  title,
  description,
  onDateRangeChange,
  dateRange = DATE_RANGES[0] as DateRanges,
  children,
}: {
  title: React.ReactNode | string;
  description?: React.ReactNode | string;
  onDateRangeChange?: (dateRange: DateRanges) => void;
  dateRange?: DateRanges;
  children: React.ReactNode;
}) {
  return (
    <Card className='flex flex-col'>
      <CardHeader className='flex flex-row items-center gap-4 space-y-0 pb-2 [&>div]:flex-1'>
        <div>
          <CardTitle className='mb-1'>{title}</CardTitle>

          <CardDescription>{description}</CardDescription>
        </div>

        <div className='flex max-w-44 flex-row items-center gap-4'>
          <Select defaultValue={dateRange} onValueChange={onDateRangeChange}>
            <SelectTrigger>
              <SelectValue placeholder='Select date range' />
            </SelectTrigger>

            <SelectContent>
              {DATE_RANGES.map((range) => (
                <SelectItem key={range} value={range}>
                  {range}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className='relative isolate flex  flex-1 items-center'>
        {children}
      </CardContent>
    </Card>
  );
}
