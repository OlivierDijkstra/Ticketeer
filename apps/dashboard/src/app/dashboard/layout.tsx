import type { ReactNode } from 'react';

import GlobalSearch from '@/components/global-search';
import AccountSettings from '@/components/navigation/account-settings';
import NavigationBreadcrumbs from '@/components/navigation/navigation-breadcrumbs';
import NavigationSheet from '@/components/navigation/navigation-sheet';
import NavigationSidebar from '@/components/navigation/navigation-sidebar';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
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

            <AccountSettings />
          </header>

          <main className='mx-auto max-w-[120rem] p-4 !pt-8 sm:px-6 sm:py-0'>
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
