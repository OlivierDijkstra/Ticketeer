'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { Product } from '@repo/lib';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import Spinner from '@/components/spinner';
import { Button } from '@/components/ui/button';
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
import { updateProductShowPivotAction } from '@/server/actions/shows';

export default function ProductShowPivotForm({
  product,
  callback,
}: {
  product: Product;
  callback?: () => void;
}) {
  const schema = z.object({
    adjusted_price: z.number().min(0).nullable(),
    amount: z.number().min(0),
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      adjusted_price: parseFloat(product.pivot?.adjusted_price || '0'),
      amount: product.pivot?.amount || 0,
    },
  });

  const [adjustedPrice, setAdjustedPrice, normalizedAdjustedPrice] =
    useCurrencyInput(`${product.pivot?.adjusted_price}`);

  useEffect(() => {
    const formValue = form.getValues('adjusted_price');
    const formValueAsNumber =
      typeof formValue === 'number' ? formValue : parseFloat(`${formValue}`);

    if (
      !isNaN(formValueAsNumber) &&
      normalizedAdjustedPrice !== formValueAsNumber.toFixed(2).toString()
    ) {
      if (formValueAsNumber === 0) {
        form.setValue('adjusted_price', null, {
          shouldDirty: true,
        });
      } else {
        form.setValue(
          'adjusted_price',
          parseFloat(adjustedPrice.replace(/[^\d]/g, '')) / 100 || 0,
          {
            shouldDirty: true,
          }
        );
      }
    }
  }, [form, adjustedPrice, normalizedAdjustedPrice]);

  const resetForm = () => {
    form.reset({
      adjusted_price: parseFloat(product.pivot?.adjusted_price || '0'),
      amount: product.pivot?.amount || 0,
    });
    setAdjustedPrice(`${product.pivot?.adjusted_price}`);
  };

  const onSubmit = async (data: z.infer<typeof schema>) => {
    await toast.promise(
      updateProductShowPivotAction({
        show_id: product.pivot?.show_id as number,
        product_id: product.id,
        data: {
          adjusted_price: data.adjusted_price ? `${data.adjusted_price}` : null,
          amount: data.amount,
        },
      }),
      {
        loading: 'Updating product...',
        success: () => {
          callback?.();
          form.reset({
            adjusted_price: data.adjusted_price,
            amount: data.amount,
          });
          return 'Product updated successfully';
        },
        error: 'Failed to update product',
      }
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className='grid grid-cols-2 gap-2'>
          <FormField
            control={form.control}
            name='adjusted_price'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adjusted Price</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    inputMode='numeric'
                    value={adjustedPrice}
                    onChange={(e) => setAdjustedPrice(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='amount'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    {...field}
                    inputMode='numeric'
                    value={field.value}
                    onChange={(e) => {
                      field.onChange(Number(e.target.value));
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='mt-4 flex items-center justify-end gap-2'>
          <Button
            size='sm'
            type='button'
            variant='outline'
            onClick={resetForm}
            disabled={!form.formState.isDirty || form.formState.isSubmitting}
          >
            Reset
          </Button>

          <Button
            size='sm'
            type='submit'
            disabled={!form.formState.isDirty || form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <Spinner variant='primary' size='sm' />
            ) : (
              'Save'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
