'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { Customer, Product, Show } from '@repo/lib';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useDebounceCallback } from 'usehooks-ts';
import { z } from 'zod';

import OrderProductField from '@/components/order/order-product-field';
import { Button } from '@/components/ui/button';
import Combobox from '@/components/ui/combobox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { DEFAULT_DATE_FORMAT } from '@/lib/constants';
import { getCustomersAction } from '@/server/actions/customers';
import { createOrdersAction } from '@/server/actions/orders';
import { getProductsAction } from '@/server/actions/products';
import { getShowsAction } from '@/server/actions/shows';

export default function CreateOrderForm({
  callback,
}: {
  callback?: () => void;
}) {
  const params = useParams<{ show: string }>();

  const schema = z.object({
    show_id: z.number(),
    customer: z
      .object({
        email: z.string().email(),
        first_name: z.string(),
        last_name: z.string(),
        street: z.string(),
        street2: z.string().optional(),
        city: z.string(),
        postal_code: z.string(),
        state: z.string(),
        phone: z.string().optional(),
      })
      .optional(),
    products: z
      .array(
        z.object({
          id: z.number(),
          value: z.string().min(1, {
            message: 'Product is required',
          }),
          amount: z.number().min(1, {
            message:
              'Amount must be at least 1, if there is no stock left, consider selecting a different product.',
          }),
          price: z.string().optional(),
        })
      )
      .min(1, {
        message: 'You are required to have at least one product.',
      }),
    note: z.string().optional(),
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      show_id: params.show ? parseInt(params.show) : undefined,
      products: [],
    },
  });

  const [customers, setCustomers] = useState<Customer[] | null>(null);
  const [customer, setCustomer] = useState<string | undefined>(undefined);
  const [customerSelectOpen, setCustomerSelectOpen] = useState<boolean>(false);
  const [customerSearch, setCustomerSearch] = useState<string>('');
  const [shows, setShows] = useState<Show[] | null>(null);
  const [show, setShow] = useState<number | undefined>(undefined);
  const [showSelectOpen, setShowSelectOpen] = useState<boolean>(false);
  const [showSearch, setShowSearch] = useState<string>('');
  const [products, setProducts] = useState<Product[] | null>(null);

  const debouncedCustomerSearch = useDebounceCallback(setCustomerSearch, 500, {
    trailing: true,
  });
  const debouncedShowSearch = useDebounceCallback(setShowSearch, 500, {
    trailing: true,
  });

  const fetchCustomers = useCallback(async () => {
    const res = await getCustomersAction({ search: customerSearch || '' });
    setCustomers(res as unknown as Customer[]);
  }, [customerSearch]);

  const fetchShows = useCallback(async () => {
    const res = await getShowsAction({ search: showSearch || '' });
    setShows(res as Show[]);
  }, [showSearch]);

  const fetchProducts = useCallback(async () => {
    const res = await getProductsAction({
      show_id: show || parseInt(params.show),
    });
    setProducts(res as Product[]);
  }, [params.show, show]);

  const mappedCustomers = useMemo(
    () =>
      customers?.map((customer) => ({
        value: customer.id,
        label: `${customer.first_name} ${customer.last_name}`,
        subtitle: customer.email,
      })),
    [customers]
  );

  const mappedShows = useMemo(
    () =>
      shows?.map((show) => ({
        value: show.id,
        label: show.event.name,
        subtitle: `${format(new Date(show.start), DEFAULT_DATE_FORMAT)} - ${format(new Date(show.end), DEFAULT_DATE_FORMAT)}`,
      })),
    [shows]
  );

  useEffect(() => {
    if (customerSearch || (customerSelectOpen && !customers)) {
      fetchCustomers();
    }
  }, [customerSearch, customerSelectOpen, customers, fetchCustomers]);

  useEffect(() => {
    if (showSearch || (showSelectOpen && !shows)) {
      fetchShows();
    }
  }, [showSearch, showSelectOpen, shows, fetchShows]);

  useEffect(() => {
    if (show) {
      const data = shows?.find((s) => s.id === show);
      if (data) {
        form.setValue('show_id', data.id);
        form.setValue('products', []);
        setProducts(null);
        fetchProducts();
      }
    }
  }, [show, shows, form, fetchProducts]);

  useEffect(() => {
    if (customer) {
      const data = customers?.find((c) => c.id === customer);
      if (data) {
        form.setValue('customer', {
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
          street: data.address.street,
          street2: data.address.street2 || undefined,
          city: data.address.city,
          postal_code: data.address.postal_code,
          state: data.address.state,
          phone: data.phone,
        });
      }
    }
  }, [customer, customers, form]);

  const {
    fields: productFields,
    append: appendProduct,
    remove: removeProduct,
  } = useFieldArray({
    control: form.control,
    name: 'products',
  });

  async function onSubmit(data: z.infer<typeof schema>) {
    await toast.promise(
      createOrdersAction({
        ...data,
        products: data.products.map((product) => ({
          id: parseInt(product.value),
          amount: product.amount,
          price: product.price,
        })),
      }),
      {
        loading: 'Creating order...',
        success: (data: { payment_url: string }) => {
          callback && callback();
          return (
            <p className='font-medium'>
              Order created.{' '}
              <a
                className='text-primary-500 underline'
                href={data.payment_url}
                target='_blank'
                rel='noreferrer'
              >
                Click here to complete payment
              </a>
            </p>
          );
        },
        error: (error) => {
          return `Failed to create order: ${error.message}`;
        },
      }
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className=''>
        <div className='grid grid-cols-2 gap-2'>
          {!params.show && (
            <FormField
              control={form.control}
              name='show_id'
              render={() => (
                <FormItem>
                  <FormLabel>Show</FormLabel>
                  <FormControl>
                    <Combobox
                      async
                      required
                      className='w-full'
                      placeholder='Select show...'
                      name='show_id'
                      items={mappedShows}
                      open={showSelectOpen}
                      onOpenChange={setShowSelectOpen}
                      loading={!mappedShows}
                      onValueChange={(value) => setShow(value as number)}
                      onSearch={debouncedShowSearch}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name='customer'
            render={() => (
              <FormItem>
                <FormLabel>Customer (optional)</FormLabel>
                <FormControl>
                  <Combobox
                    async
                    required
                    className='w-full'
                    placeholder='Select customer...'
                    name='customer'
                    items={mappedCustomers}
                    open={customerSelectOpen}
                    onOpenChange={setCustomerSelectOpen}
                    loading={!mappedCustomers}
                    onValueChange={(value) => setCustomer(value as string)}
                    onSearch={debouncedCustomerSearch}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <hr className='my-4' />
        </div>

        <div className='mt-4'>
          <FormLabel className='mb-2 block'>Products</FormLabel>
          <div className='space-y-2'>
            {productFields.length === 0 && !show && (
              <div className='p-2 text-center text-sm text-muted-foreground'>
                No products found for this show.
              </div>
            )}

            {productFields.length === 0 && show && (
              <div className='p-2 text-center text-sm text-muted-foreground'>
                Click the &quot;+ Add product&quot; button to add products to
                your order.
              </div>
            )}

            <FormField
              name='products'
              render={() => (
                <div>
                  {productFields.map((field, index) => (
                    <OrderProductField
                      className='pt-2 first:pt-0'
                      key={field.id}
                      index={index}
                      field={field}
                      form={form}
                      products={products}
                      onRemove={() => removeProduct(index)}
                    />
                  ))}

                  <div className='my-2 flex justify-end'>
                    <Button
                      size='sm'
                      type='button'
                      variant='secondary'
                      disabled={!show}
                      onClick={() =>
                        appendProduct({ id: 1, value: '', amount: 0 })
                      }
                    >
                      <Plus className='mr-1 !size-3' /> Add product
                    </Button>
                  </div>

                  {form.formState.errors.products &&
                    !Array.isArray(form.formState.errors.products) && (
                      <FormMessage />
                    )}
                </div>
              )}
            />
          </div>
        </div>

        <div>
          <hr className='my-4' />
        </div>

        <FormField
          control={form.control}
          name='note'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormDescription>
                Any additional information about the order.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <hr className='my-4' />
        </div>

        <div className='flex justify-end'>
          <Button disabled={form.formState.isSubmitting} type='submit'>
            Create
          </Button>
        </div>
      </form>
    </Form>
  );
}
