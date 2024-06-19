import type { ReactNode } from 'react';

import GlobalSearch from '@/components/GlobalSearch';
import AccountSettings from '@/components/navigation/AccountSettings';
import NavigationBreadcrumbs from '@/components/navigation/NavigationBreadcrumbs';
import NavigationSheet from '@/components/navigation/NavigationSheet';
import NavigationSidebar from '@/components/navigation/NavigationSidebar';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { auth } from '@/lib/auth';

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const session = await auth();

  return (
    <TooltipProvider>
      <Toaster />

      <div className='relative top-0 flex min-h-screen w-full flex-col bg-muted/40'>
        <NavigationSidebar />

        <div className='sm:gap-4 sm:py-4 sm:pl-14'>
          <header className='sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6'>
            <NavigationSheet />

            <NavigationBreadcrumbs />

            <div className='relative ml-auto flex-1 md:grow-0'>
              <GlobalSearch />
            </div>

            <AccountSettings session={session} />
          </header>

          <main className='mx-auto max-w-[120rem] p-4 !pt-8 sm:px-6 sm:py-0'>
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
