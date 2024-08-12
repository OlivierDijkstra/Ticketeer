import { CheckIcon, TriangleAlertIcon } from 'lucide-react';

import LoginForm from '@/components/forms/login-form';
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
    error?: string;
    message?: string;
  };
}) {
  const { error, message } = searchParams;

  return (
    <div className='grid min-h-screen place-items-center'>
      <div className='w-full max-w-sm space-y-2'>
        {error && (
          <Alert variant='destructive'>
            <TriangleAlertIcon />
            <AlertTitle>Login failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {message && (
          <Alert>
            <CheckIcon />
            <AlertTitle>{message}</AlertTitle>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Enter your email below to login to your account.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
