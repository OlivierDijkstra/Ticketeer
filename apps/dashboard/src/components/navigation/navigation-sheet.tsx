'use client';

import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import {
  CalendarDays,
  Home,
  PanelLeft,
  Settings,
  Shirt,
  ShoppingCart,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export default function NavigationSheet() {
  const [open, setOpen] = useState(false);
  const paths = usePathname();

  const defaultClasses =
    'flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground';
  const activeClasses = 'flex items-center gap-4 px-2.5 text-foreground';

  function getClassesForPath(path: string | undefined) {
    const p = paths
      .split('/')
      .filter((path) => path)
      .slice(1);
    return p[0] === path ? activeClasses : defaultClasses;
  }

  useEffect(() => {
    setOpen(false);
  }, [paths]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size='icon' variant='outline' className='sm:hidden'>
          <PanelLeft className='h-5 w-5' />
          <span className='sr-only'>Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side='left' className='sm:max-w-xs'>
        <VisuallyHidden>
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>
            Navigate to different sections of the dashboard.
          </SheetDescription>
        </VisuallyHidden>

        <nav className='grid gap-6 text-lg font-medium'>
          <Link href='/dashboard' className={getClassesForPath(undefined)}>
            <Home className='h-5 w-5' />
            Dashboard
          </Link>

          <Link
            href='/dashboard/events'
            className={getClassesForPath('events')}
          >
            <CalendarDays className='h-5 w-5' />
            Events
          </Link>

          <Link
            href='/dashboard/products'
            className={getClassesForPath('products')}
          >
            <Shirt className='h-5 w-5' />
            Products
          </Link>

          <Link
            href='/dashboard/orders'
            className={getClassesForPath('orders')}
          >
            <ShoppingCart className='h-5 w-5' />
            Orders
          </Link>

          <Link
            href='/dashboard/customers'
            className={getClassesForPath('customers')}
          >
            <Users className='h-5 w-5' />
            Customers
          </Link>

          <Link
            href='/dashboard/settings'
            className={getClassesForPath('settings')}
          >
            <Settings className='h-5 w-5' />
            Settings
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
