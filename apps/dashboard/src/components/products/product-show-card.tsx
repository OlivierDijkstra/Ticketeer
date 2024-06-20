import type { Product, Show } from '@repo/lib';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';

import ProductShowPivotForm from '@/components/forms/product-show-pivot-form';
import ResourceAvailabilitySwitch from '@/components/forms/resource-availability-switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DEFAULT_PRETTY_DATE_FORMAT } from '@/lib/constants';

export default function ProductShowCard({
  show,
  product,
}: {
  show: Show;
  product: Product;
}) {
  return (
    <Card className='border-2 border-primary/50'>
      <CardHeader className='flex flex-row items-center justify-between'>
        <div>
          <CardTitle>
            <span className='captialize'>{`${product.name} `}</span>
          </CardTitle>

          <CardDescription className='mt-1'>{show.event.name}</CardDescription>
        </div>

        <div className='flex items-center gap-2'>
          <div className='flex items-center gap-1'>
            <Calendar className='h-4 w-4 text-muted-foreground' />
            <span className='text-sm text-muted-foreground'>
              {format(new Date(show.start), DEFAULT_PRETTY_DATE_FORMAT)}
            </span>
          </div>

          <ResourceAvailabilitySwitch
            type='product'
            data={product}
            tooltipText='This product will be available for purchase for this show.'
          />
        </div>
      </CardHeader>

      <CardContent>
        <ProductShowPivotForm product={product} />
      </CardContent>
    </Card>
  );
}
