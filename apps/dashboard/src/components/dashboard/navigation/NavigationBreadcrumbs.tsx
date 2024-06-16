'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export default function NavigationBreadcrumbs() {
  const paths = usePathname();
  const pathnames = paths
    .split('/')
    .filter((path) => path)
    .slice(1);

  return (
    <Breadcrumb className='hidden md:flex'>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href='/dashboard'>Dashboard</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {pathnames.map((pathname, index) => {
          const text = (
            pathname.length > 20 ? `${pathname.slice(0, 20)}...` : pathname
          ).replace(/-/g, ' ');

          return (
            <div
              key={index}
              className='flex items-center justify-between gap-2.5'
            >
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    className='capitalize'
                    href={`/dashboard/${pathnames.slice(0, index + 1).join('/')}`}
                  >
                    {text}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
