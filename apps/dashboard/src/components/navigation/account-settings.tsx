'use client';

import { User } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';

import { ThemeSwitcher } from '@/components/theme-switcher';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function AccountSettings() {
  const { data: session } = useSession();

  async function handleLogout() {
    if (session) {
      await signOut({
        callbackUrl: '/',
        redirect: true,
      });
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          size='icon'
          aria-label='user'
          className='overflow-hidden rounded-full'
        >
          <User size={18} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align='end'>
        <DropdownMenuLabel className='flex items-center gap-12'>
          <span>{session?.user?.name}</span>

          <ThemeSwitcher />
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
