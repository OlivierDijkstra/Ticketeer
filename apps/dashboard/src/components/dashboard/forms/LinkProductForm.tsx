'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { Product } from '@repo/lib';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useDebounceCallback } from 'usehooks-ts';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import Combobox from '@/components/ui/combobox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useCurrencyInput } from '@/lib/hooks';
import { getProductsAction } from '@/server/actions/products';
import { linkProductToShowAction } from '@/server/actions/shows';

export default function LinkProductForm({
  callback,
}: {
  callback?: () => void;
}) {
  const params = useParams<{
    show: string;
  }>();

  const schema = z
    .object({
      product_id: z.number({
        required_error: 'Please select a product',
      }),
      adjusted_price: z.number().min(0),
      is_upsell: z.boolean().optional(),
      amount: z.number().min(1).optional(),
      enabled: z.boolean().optional(),
    })
    .required();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      product_id: undefined,
      adjusted_price: 0,
      is_upsell: false,
      amount: 1,
      enabled: false,
    },
  });

  async function onSubmit(data: z.infer<typeof schema>) {
    if (data.adjusted_price === 0) {
      Object.assign(data, { adjusted_price: null });
    }

    await toast.promise(
      linkProductToShowAction({
        show_id: parseInt(params.show),
        product_id: data.product_id,
        data: {
          ...data,
          adjusted_price: `${data.adjusted_price}`,
        },
      }),
      {
        loading: 'Linking product...',
        success: () => {
          callback && callback();
          return 'Product linked';
        },
        error: 'Failed to link product',
      }
    );
  }

  const [price, setPrice, floatPrice] = useCurrencyInput('0');

  useEffect(() => {
    form.setValue(
      'adjusted_price',
      parseFloat(price.replace(/[^\d]/g, '')) / 100 || 0
    );
  }, [form, price]);

  const [products, setProducts] = useState<Product[] | null>(null);
  const [productsSelectOpen, setProductsSelectOpen] = useState(false);
  const [productsSearch, setProductsSearch] = useState('');

  const debouncedProductsSearch = useDebounceCallback(setProductsSearch, 500, {
    trailing: true,
  });

  const fetchProducts = useCallback(async () => {
    const res = await getProductsAction({ search: productsSearch || '' });
    setProducts(res as Product[]);
  }, [productsSearch]);

  useEffect(() => {
    if (productsSearch) fetchProducts();
  }, [productsSearch, fetchProducts]);
  useEffect(() => {
    if (productsSelectOpen && !products) fetchProducts();
  }, [productsSelectOpen, products, fetchProducts]);

  const productId = form.watch('product_id');

  const selectedProduct = useMemo(
    () => products?.find((product) => product.id === productId),
    [productId, products]
  );

  const adjustedPriceLabel = useMemo(() => {
    let label = 'Adjusted Price';

    if (floatPrice === '0.00') {
      label += ' (Free)';
    }

    if (selectedProduct) {
      const formatted = new Intl.NumberFormat('nl-NL', {
        style: 'currency',
        currency: 'EUR',
      // @ts-expect-error: selectedProduct is not defined
      }).format(selectedProduct.price);

      label += ` - Original: ${formatted}`;
    }

    return label;
  }, [selectedProduct, floatPrice]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-2'>
        <FormField
          control={form.control}
          name='product_id'
          render={({ field }) => (
            <FormItem className='flex flex-col'>
              <FormLabel>Product</FormLabel>
              <FormControl>
                <Combobox
                  required
                  async
                  placeholder='Select product...'
                  items={products?.map((product) => ({
                    value: product.id,
                    label: product.name,
                  }))}
                  open={productsSelectOpen}
                  onOpenChange={setProductsSelectOpen}
                  loading={!products}
                  value={field.value}
                  onValueChange={field.onChange}
                  onSearch={debouncedProductsSearch}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='flex items-start justify-between gap-2'>
          <FormField
            control={form.control}
            name='adjusted_price'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{adjustedPriceLabel}</FormLabel>
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
            )}
          />

          <FormField
            control={form.control}
            name='amount'
            render={({ field: { name, value, onChange } }) => (
              <FormItem>
                <FormLabel>Total Available</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    inputMode='numeric'
                    min='1'
                    name={name}
                    value={value.toString()}
                    onChange={(e) => onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='flex items-center space-x-2 pt-2'>
          <FormField
            control={form.control}
            name='enabled'
            render={({ field }) => (
              <FormItem>
                <div className='flex items-center gap-2'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>Enabled</FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='flex justify-end'>
          <Button disabled={form.formState.isSubmitting} type='submit'>
            Link
          </Button>
        </div>
      </form>
    </Form>
  );
}
