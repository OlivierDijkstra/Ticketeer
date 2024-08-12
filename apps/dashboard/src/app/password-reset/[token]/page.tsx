import { TriangleAlertIcon } from 'lucide-react';
import { notFound } from 'next/navigation';

import PasswordResetForm from '@/components/forms/password-reset-form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default async function Page({
  params,
  searchParams,
}: {
  params: { token: string };
  searchParams: {
    email: string;
    error: string;
  };
}) {
  const { token } = params;
  const { email, error } = searchParams;

  if (!email) {
    notFound();
  }

  return (
    <div className='grid min-h-screen place-items-center'>
      <div className='w-full max-w-sm space-y-2'>
        {error && (
          <Alert variant='destructive'>
            <TriangleAlertIcon />
            <AlertTitle>Password reset</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Password reset</CardTitle>
            <CardDescription>
              Enter your new password below to reset your password.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <PasswordResetForm token={token} email={email} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
