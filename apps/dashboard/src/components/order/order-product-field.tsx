import type { Product } from '@repo/lib';
import { cn } from '@repo/lib';
import { Trash } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import type { FieldArrayWithId, UseFormReturn } from 'react-hook-form';

import { CurrencyInput } from '@/components/currency-input';
import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type OrderProductFieldProps = {
  index: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: FieldArrayWithId<any>;
  onRemove: (index: number) => void;
  products: Product[] | null;
  className?: string;
};

export default function OrderProductField({
  index,
  form,
  field,
  onRemove,
  products,
  className,
}: OrderProductFieldProps) {
  const previousProductId = useRef(null);

  const watcher = form.watch(`products.${index}`);
  const memoizedProduct = useMemo(
    () => products?.find((product) => product.id === parseInt(watcher.value)),
    [products, watcher.value]
  );

  useEffect(() => {
    if (watcher && memoizedProduct && previousProductId.current !== watcher) {
      form.setValue(`products.${index}.amount`, 0);
    }
  }, [form, index, memoizedProduct, watcher]);

  useEffect(() => {
    if (watcher && memoizedProduct && previousProductId.current !== watcher) {
      form.setValue(
        `products.${index}.price`,
        memoizedProduct.price.toString()
      );
      previousProductId.current = watcher;
    }
  }, [form, index, memoizedProduct, watcher]);

  return (
    <div className={cn('flex justify-between gap-2', className)} key={field.id}>
      <div className='w-full'>
        <FormField
          control={form.control}
          name={`products.${index}`}
          render={({ field }) => (
            <>
              <FormItem>
                <Select
                  defaultValue={field.value.value}
                  onValueChange={(value) =>
                    field.onChange({
                      ...field.value,
                      value: value,
                    })
                  }
                >
                  <FormControl>
                    <SelectTrigger aria-label='select product'>
                      <SelectValue placeholder='Select product' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {products?.map((product) => (
                      <SelectItem key={product.id} value={`${product.id}`}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>

              <FormField
                control={form.control}
                name={`products.${index}.value`}
                render={() => <FormMessage className='mt-2' />}
              />
            </>
          )}
        />

        {memoizedProduct && (
          <div className='my-2 rounded bg-primary-foreground p-2 text-sm text-muted-foreground'>
            <ul>
              <li className='flex items-center justify-between'>
                <span>Stock left:</span>
                <span>{memoizedProduct?.pivot?.stock}</span>
              </li>
            </ul>
          </div>
        )}
        <div className='flex gap-2'>
          <FormField
            control={form.control}
            name={`products.${index}.amount`}
            render={({ field: { onChange, value } }) => (
              <FormItem>
                <FormLabel className='text-xs text-muted-foreground'>
                  Amount
                </FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    placeholder='Amount'
                    min={1}
                    max={memoizedProduct?.pivot?.stock || undefined}
                    className='w-16'
                    disabled={!memoizedProduct}
                    value={value?.toString() || '1'}
                    onChange={(e) => {
                      // if value is greater than stock, set it to stock
                      if (
                        parseInt(e.target.value, 10) >
                        (memoizedProduct?.pivot?.stock || 0)
                      ) {
                        onChange(memoizedProduct?.pivot?.stock);
                      } else {
                        onChange(parseInt(e.target.value, 10));
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`products.${index}.price`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-xs text-muted-foreground'>
                  Price
                </FormLabel>
                <FormControl>
                  <CurrencyInput disabled={!memoizedProduct} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <Button
        type='button'
        size='icon'
        variant='outline'
        aria-label='remove'
        onClick={() => onRemove(index)}
      >
        <Trash />
      </Button>
    </div>
  );
}
