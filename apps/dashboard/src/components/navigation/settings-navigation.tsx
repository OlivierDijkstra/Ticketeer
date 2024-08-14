'use client';

import { cn } from '@repo/lib';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

export default function SettingsNavigation() {
  const pathname = usePathname();

  const activePath = useMemo(() => {
    const parts = pathname.split('/').slice(2);
    return parts.length > 1 ? parts.slice(1) : parts;
  }, [pathname]);

  return (
    <nav
      className='grid gap-4 text-sm text-muted-foreground'
      x-chunk='dashboard-04-chunk-0'
    >
      <Link
        href='/dashboard/settings'
        className={cn(
          'font-semibold',
          activePath[0] === 'settings' && 'text-primary'
        )}
      >
        User management
      </Link>
      <Link
        href='/dashboard/settings/monthly-reports'
        className={cn(
          'font-semibold',
          activePath[0] === 'monthly-reports' && 'text-primary'
        )}
      >
        Monthly reports
      </Link>
    </nav>
  );
}
