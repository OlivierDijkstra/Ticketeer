import Link from 'next/link';
import type { ReactNode } from 'react';

export default async function Layout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <main className='flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 md:gap-8'>
      <div className='mx-auto grid w-full max-w-6xl gap-2'>
        <h1 className='text-3xl font-semibold'>Settings</h1>
      </div>
      <div className='mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]'>
        <nav
          className='grid gap-4 text-sm text-muted-foreground'
          x-chunk='dashboard-04-chunk-0'
        >
          <Link
            href='/dashboard/settings/users'
            className='font-semibold text-primary'
          >
            User management
          </Link>
        </nav>

        <div className='grid gap-6'>{children}</div>
      </div>
    </main>
  );
}
