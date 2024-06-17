'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { formHasErrors } from '@repo/lib';
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
      password: z.string().min(8),
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
    <div className='w-full max-w-sm'>
      {searchParams.get('error') && (
        <div
          className='relative mb-2 rounded border border-red-400 bg-red-100 px-4 py-3 text-sm text-red-700'
          role='alert'
        >
          {searchParams.get('error')}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className='text-2xl'>Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account.
          </CardDescription>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className='space-y-2'>
              <FormField
                name='email'
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <Input {...field} inputMode='email' type='email' />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name='password'
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <Input {...field} type='password' />
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
            </CardContent>

            <CardFooter>
              <Button
                loading={form.formState.isSubmitting}
                disabled={formHasErrors(form.formState.errors)}
                type='submit'
                className='w-full'
              >
                Sign in
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
