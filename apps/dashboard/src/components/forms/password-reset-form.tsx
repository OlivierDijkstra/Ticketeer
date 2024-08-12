'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { resetPassword } from '@/server/actions/users';

export default function PasswordResetForm({
  token,
  email,
}: {
  token: string;
  email: string;
}) {
  const router = useRouter();

  const schema = z
    .object({
      password: z.string().min(8, {
        message: 'Password must be at least 8 characters',
      }),
      confirmPassword: z.string().min(8, {
        message: 'Password must be at least 8 characters',
      }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      path: ['confirmPassword'],
      message: 'Passwords do not match',
    });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(data: z.infer<typeof schema>) {
    try {
      await resetPassword({
        token,
        email,
        password: data.password,
        password_confirmation: data.confirmPassword,
      });
    } catch (error) {
      router.push(
        `?error=Password reset failed&email=${encodeURIComponent(email)}`
      );

      return;
    }

    router.push('/?message=Password reset successful');
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-2'>
        <FormField
          name='password'
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <Input {...field} aria-label='password' type='password' />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name='confirmPassword'
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <Input {...field} aria-label='confirm password' type='password' />
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <Button
            loading={form.formState.isSubmitting}
            disabled={form.formState.isSubmitting}
            type='submit'
            className='mt-4 w-full'
          >
            Reset Password
          </Button>
        </div>
      </form>
    </Form>
  );
}
