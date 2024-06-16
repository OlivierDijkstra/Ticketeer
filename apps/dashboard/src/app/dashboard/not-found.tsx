import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default async function Page() {
  return (
    <div className='mx-auto flex max-w-md flex-col gap-2'>
      <h1 className='text-4xl font-semibold'>Page Not Found</h1>

      <p className='text-muted-foreground'>
        The page you are looking for does not exist. Please check the URL in the
        address bar and try again.
      </p>

      <Link href='/dashboard'>
        <Button>Go to Dashboard</Button>
      </Link>
    </div>
  );
}
