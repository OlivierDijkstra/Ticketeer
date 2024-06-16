import { Home, Settings, TestTube } from 'lucide-react';
import Link from 'next/link';

export const navigationItems = {
  home: (
    <Link href='/dashboard'>
      <Home className='h-5 w-5' />
      <span className='sr-only'>Dashboard</span>
    </Link>
  ),
  test: (
    <Link href='/dashboard/test'>
      <TestTube className='h-5 w-5' />
      <span className='sr-only'>Test</span>
    </Link>
  ),
  settings: (
    <Link href='#'>
      <Settings className='h-5 w-5' />
      <span className='sr-only'>Settings</span>
    </Link>
  ),
};
