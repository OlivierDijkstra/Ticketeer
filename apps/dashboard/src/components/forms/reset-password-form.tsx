'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { sendPasswordResetLink } from '@/server/actions/users';

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const schema = z.object({
    email: z.string().email(),
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(data: z.infer<typeof schema>) {
    try {
      await sendPasswordResetLink({
        email: data.email,
      });
    } catch (error) {
      router.push('?error=Error sending password reset link');

      return;
    }

    router.push(
      '?message=Email with password reset link is sent if the email is registered'
    );
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
              <Input {...field} aria-label='email' type='email' />
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <Button
            loading={form.formState.isSubmitting}
            disabled={
              form.formState.isSubmitting || !!searchParams.get('message')
            }
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
