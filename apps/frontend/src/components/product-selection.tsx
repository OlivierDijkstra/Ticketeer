import type { Product } from '@repo/lib';
import { cn } from '@repo/lib';
import formatMoney from '@repo/lib';
import { Minus, Package, Plus, Ticket } from 'lucide-react';
import { useMemo } from 'react';

import { Button } from '@/components/ui/button';

export default function ProductSelection({
  product,
  onAdd,
  onRemove,
}: {
  product: Product & { amount: number };
  onAdd: () => void;
  onRemove: () => void;
}) {
  const soldout = useMemo(
    () => product.pivot?.stock === 0,
    [product.pivot?.stock]
  );

  return (
    <div
      key={product.id}
      className={cn([
        'grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-lg border border-gray-200 p-4 dark:border-gray-800',
        soldout && 'pointer-events-none relative isolate',
      ])}
    >
      {soldout && (
        <p className='absolute inset-0 grid place-items-center rounded-lg bg-white/75 p-2 text-4xl font-bold text-primary'>
          SOLD OUT
        </p>
      )}

      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full ${
          !product.is_upsell
            ? 'bg-yellow-500 text-white'
            : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
        }`}
      >
        {!product.is_upsell ? <Ticket /> : <Package />}
      </div>
      <div className='grid gap-1'>
        <h3 className='font-semibold'>{product.name}</h3>
        <p className='text-sm text-gray-500 dark:text-gray-400'>
          {product.description}
        </p>
      </div>
      <div className='flex items-center gap-2'>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          disabled={product.amount === 0}
          onClick={onRemove}
          className='rounded-full'
        >
          <Minus />
        </Button>
        <div className='text-sm font-medium'>{product.amount}</div>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          onClick={onAdd}
          disabled={
            !!product.pivot?.stock && product.amount >= product.pivot?.stock
          }
          className='rounded-full'
        >
          <Plus />
        </Button>
      </div>
      <div className='text-right font-semibold'>
        {formatMoney(product.pivot?.adjusted_price || product.price)}
      </div>
      <p className='text-sm text-muted-foreground'>
        {`${product.pivot?.stock} in stock`}
      </p>
    </div>
  );
}
