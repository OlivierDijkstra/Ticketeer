import { CheckIcon, TriangleAlertIcon } from 'lucide-react';

import ResetPasswordForm from '@/components/forms/reset-password-form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default async function Page({
  searchParams,
}: {
  searchParams: {
    message: string;
    error: string;
  };
}) {
  const { message, error } = searchParams;

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

        {message && (
          <Alert>
            <CheckIcon />
            <AlertTitle>Password reset</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
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
            <ResetPasswordForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
