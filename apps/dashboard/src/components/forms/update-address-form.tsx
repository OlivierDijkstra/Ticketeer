'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { Address } from '@repo/lib';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import CountrySelect from '@/components/country-select';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { updateAddressAction } from '@/server/actions/address';

export default function UpdateAddressForm({
  address,
  callback,
}: {
  address: Address;
  callback?: () => void;
}) {
  const schema = z.object({
    street: z.string(),
    street2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    postal_code: z.string(),
    country: z.string(),
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      street: address.street,
      street2: address.street2 || '',
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
      country: address.country,
    },
  });

  async function onSubmit(data: z.infer<typeof schema>) {
    await toast.promise(
      updateAddressAction({
        address_id: address.id,
        data,
      }),
      {
        loading: 'Updating address...',
        success: () => {
          callback && callback();
          return 'The address has been successfully updated';
        },
        error: 'Failed to update address',
      }
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-2'>
        <div className='grid gap-4 sm:grid-cols-2'>
          <FormField
            control={form.control}
            name='street'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Street</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>The street of the address.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='street2'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Street 2</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>
                  The second line of the street address if applicable.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='city'
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='state'
            render={({ field }) => (
              <FormItem>
                <FormLabel>State / Province</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name='postal_code'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Postal Code</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='country'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <FormControl>
                <CountrySelect {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='flex justify-end'>
          <Button disabled={form.formState.isSubmitting} type='submit'>
            Update
          </Button>
        </div>
      </form>
    </Form>
  );
}
