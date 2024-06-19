import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default async function Page() {
  return (
    <div className='mx-auto mt-12 flex max-w-md flex-col items-center justify-center gap-2 text-center'>
      <h1 className='text-8xl font-bold'>404</h1>

      <p className='text-muted-foreground'>
        Oops, the page you are looking for does not exist.
      </p>

      <div className='flex justify-center mt-4'>
        <Link href='/dashboard'>
          <Button>Go to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
