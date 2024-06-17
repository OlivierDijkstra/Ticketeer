import type { Product } from '@repo/lib';
import { cn } from '@repo/lib';
import { Trash } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { FieldArrayWithId, UseFormReturn } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import Combobox from '@/components/ui/combobox';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useCurrencyInput } from '@/lib/hooks';

type OrderProductFieldProps = {
  index: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: FieldArrayWithId<any>;
  onRemove: (index: number) => void;
  products: Product[] | null;
  onOpenChange: (open: boolean) => void;
  className?: string;
  onSearch: (search: string) => void;
};

const ProductCombobox = ({
  index,
  products,
  selectOpen,
  setSelectOpen,
  onOpenChange,
  onSearch,
  field,
  form,
}: {
  index: number;
  products: Product[] | null;
  selectOpen: boolean;
  setSelectOpen: (open: boolean) => void;
  onOpenChange: (open: boolean) => void;
  onSearch: (search: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
}) => {
  const items = useMemo(
    () =>
      products?.map((product) => ({
        value: product.id,
        label: product.name,
      })),
    [products]
  );

  function onChange(value: undefined | number | string | boolean) {
    field.onChange(value);
    form.setValue(`products.${index}.price`, products?.find((product) => product.id === value)?.price);
  }

  return (
    <FormItem className='mb-1 flex flex-col'>
      <FormControl>
        <Combobox
          name={`products.${index}.id`}
          className='w-full'
          required
          async
          placeholder='Select product...'
          items={items}
          open={selectOpen}
          onOpenChange={(open) => {
            setSelectOpen(open);
            onOpenChange(open);
          }}
          loading={!products}
          value={field.value || ''}
          onValueChange={onChange}
          onSearch={onSearch}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};

const AmountInput = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: number) => void;
}) => (
  <FormItem>
    <FormLabel className='text-xs text-muted-foreground'>Amount</FormLabel>
    <FormControl>
      <Input
        type='number'
        placeholder='Amount'
        className='w-16'
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
      />
    </FormControl>
    <FormMessage />
  </FormItem>
);

const PriceInput = ({
  price,
  setPrice,
  field,
}: {
  price: string;
  setPrice: (value: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: any;
}) => (
  <FormItem>
    <FormLabel className='text-xs text-muted-foreground'>Price</FormLabel>
    <FormControl>
      <Input
        {...field}
        inputMode='numeric'
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
    </FormControl>
    <FormMessage />
  </FormItem>
);

export default function OrderProductField({
  index,
  form,
  field,
  onRemove,
  products,
  onOpenChange,
  className,
  onSearch,
}: OrderProductFieldProps) {
  const [selectOpen, setSelectOpen] = useState(false);
  const [price, setPrice] = useCurrencyInput('0');
  const previousProductId = useRef(null);

  const watcher = form.watch(`products.${index}.id`);
  const memoizedProduct = useMemo(() => products?.find((product) => product.id === watcher), [products, watcher]);

  useEffect(() => {
    if (watcher && memoizedProduct && previousProductId.current !== watcher) {
      setPrice(memoizedProduct.price.toString());
      previousProductId.current = watcher;
    }
  }, [watcher, memoizedProduct, setPrice]);

  const formattedPrice = useMemo(() => {
    return parseFloat(price.replace(/[^\d]/g, '')) / 100;
  }, [price]);

  useEffect(() => {
    if (formattedPrice) {
      form.setValue(`products.${index}.price`, `${formattedPrice}`, {
        shouldDirty: true,
      });
    }
  }, [form, formattedPrice, index]);

  return (
    <div className={cn('flex justify-between gap-2', className)} key={field.id}>
      <div className='w-full'>
        <FormField
          control={form.control}
          name={`products.${index}.id`}
          render={({ field }) => (
            <ProductCombobox
              index={index}
              products={products}
              selectOpen={selectOpen}
              setSelectOpen={setSelectOpen}
              onOpenChange={onOpenChange}
              onSearch={onSearch}
              field={field}
              form={form}
            />
          )}
        />

        <div className='flex gap-2'>
          <FormField
            control={form.control}
            name={`products.${index}.amount`}
            render={({ field: { onChange, value } }) => (
              <AmountInput
                value={value?.toString() || '1'}
                onChange={onChange}
              />
            )}
          />

          <FormField
            control={form.control}
            name={`products.${index}.price`}
            render={({ field }) => (
              <PriceInput price={price} setPrice={setPrice} field={field} />
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

