import type { ReactNode } from 'react';

import SettingsNavigation from '@/components/navigation/settings-navigation';

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
        <SettingsNavigation />

        <div className='grid gap-6'>{children}</div>
      </div>
    </main>
  );
}
