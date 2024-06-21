'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { Product } from '@repo/lib';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { CurrencyInput } from '@/components/currency-input';
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
import { updateProductAction } from '@/server/actions/products';

export default function ProductPriceForm({ product }: { product: Product }) {
  const schema = z.object({
    price: z.number().min(0),
    vat: z.number().min(0).max(100),
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      price: parseFloat(product.price),
      vat: product.vat,
    },
  });

  const resetForm = () => {
    form.reset({
      price: parseFloat(product.price),
      vat: product.vat,
    });
  };

  const onSubmit = async (data: z.infer<typeof schema>) => {
    await toast.promise(
      updateProductAction({
        product_id: `${product.id}`,
        data: {
          price: `${data.price}`,
          vat: data.vat,
        },
      }),
      {
        loading: 'Updating product...',
        success: 'Product updated successfully',
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
            name='price'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <CurrencyInput {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='vat'
            render={({ field }) => (
              <FormItem>
                <FormLabel>VAT (%)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    inputMode='numeric'
                    type='number'
                    value={field.value.toString()}
                    onChange={(e) =>
                      field.onChange(parseFloat(e.target.value) || 0)
                    }
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
