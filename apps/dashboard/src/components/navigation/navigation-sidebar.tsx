'use client';

import { CalendarDays, Home, Shirt, ShoppingCart, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function NavigationSidebar() {
  const paths = usePathname();

  const defaultClasses =
    'flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8';
  const activeClasses =
    'flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground transition-colors hover:text-foreground md:h-8 md:w-8';

  function getClassesForPath(path: string | undefined) {
    const p = paths
      .split('/')
      .filter((path) => path)
      .slice(1);
    return p[0] === path ? activeClasses : defaultClasses;
  }

  return (
    <aside className='fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex'>
      <nav className='flex flex-col items-center gap-4 px-2 py-4'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href='/dashboard' className={getClassesForPath(undefined)}>
              <Home className='h-5 w-5' />
              <span className='sr-only'>Dashboard</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side='right'>Dashboard</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href='/dashboard/events'
              className={getClassesForPath('events')}
            >
              <CalendarDays className='h-5 w-5' />
              <span className='sr-only'>Events</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side='right'>Events</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href='/dashboard/products'
              className={getClassesForPath('products')}
            >
              <Shirt className='h-5 w-5' />
              <span className='sr-only'>Products</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side='right'>Products</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href='/dashboard/orders'
              className={getClassesForPath('orders')}
            >
              <ShoppingCart className='h-5 w-5' />
              <span className='sr-only'>Orders</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side='right'>Orders</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href='/dashboard/customers'
              className={getClassesForPath('customers')}
            >
              <Users className='h-5 w-5' />
              <span className='sr-only'>Customers</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side='right'>Customers</TooltipContent>
        </Tooltip>
      </nav>
    </aside>
  );
}
