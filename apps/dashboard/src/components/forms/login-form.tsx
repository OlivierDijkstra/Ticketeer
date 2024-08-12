'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

export default function LoginForm() {
  const searchParams = useSearchParams();

  const schema = z
    .object({
      email: z.string().email(),
      password: z.string().min(8, {
        message: 'Password must be at least 8 characters',
      }),
      remember: z.boolean().optional(),
    })
    .required();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: 'test@example.com',
      password: 'password',
      remember: false,
    },
  });

  async function onSubmit(data: z.infer<typeof schema>) {
    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

    const credentials = {
      email: data.email,
      password: data.password,
      remember: data.remember,
    };

    return signIn('credentials', { ...credentials, callbackUrl });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <FormField
          name='email'
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <Input
                {...field}
                aria-label='email'
                inputMode='email'
                type='email'
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name='password'
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <div className='flex items-center'>
                <FormLabel>Password</FormLabel>
                <Link
                  href='/password-reset'
                  className='ml-auto inline-block text-sm underline'
                >
                  Forgot your password?
                </Link>
              </div>

              <Input {...field} aria-label='password' type='password' />
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='items-top flex space-x-2'>
          <FormField
            name='remember'
            control={form.control}
            render={({ field }) => (
              <Checkbox
                aria-label='remember me'
                name={field.name}
                checked={field.value || false}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <div className='grid gap-1.5 leading-none'>
            <label
              htmlFor='remember'
              className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
            >
              Remember me
            </label>
          </div>
        </div>

        <div>
          <Button
            loading={form.formState.isSubmitting}
            disabled={form.formState.isSubmitting}
            type='submit'
            className='mt-4 w-full'
          >
            Sign in
          </Button>
        </div>
      </form>
    </Form>
  );
}
