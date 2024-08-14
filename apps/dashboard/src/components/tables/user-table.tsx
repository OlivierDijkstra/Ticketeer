'use client';

import type { User } from '@repo/lib';
import { format } from 'date-fns';
import { MailIcon, MoreHorizontalIcon, TrashIcon } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DEFAULT_PRETTY_DATE_FORMAT } from '@/lib/constants';
import { sendPasswordResetLink } from '@/server/actions/users';

export default function UserTable({
  users,
}: {
  users: User[];
}) {
  const {data:session} = useSession();

  const currentUser = session?.user as User;

  function handleSendPasswordResetLink(email: string) {
    toast.promise(sendPasswordResetLink({ email }), {
      loading: 'Sending password reset link...',
      success: 'Password reset link sent!',
      error: 'Failed to send password reset link',
    });
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Created at</TableHead>
          <TableHead>
            <span className='sr-only'>Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>
              <div className='flex flex-col space-y-1'>
                <span className='font-medium'>{user.email}</span>
                <span className='text-muted-foreground'>{user.name}</span>
              </div>
            </TableCell>
            <TableCell>
              {format(new Date(user.created_at), DEFAULT_PRETTY_DATE_FORMAT)}
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button aria-haspopup='true' size='icon' variant='ghost'>
                    <MoreHorizontalIcon className='h-4 w-4' />
                    <span className='sr-only'>Toggle menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>

                  <DropdownMenuItem
                    onClick={() => handleSendPasswordResetLink(user.email)}
                  >
                    <div className='flex items-center gap-2'>
                      <MailIcon />
                      <span>Send Password Reset Link</span>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem disabled={user.id === currentUser.id}>
                    <div className='flex items-center gap-2 text-red-500'>
                      <TrashIcon />
                      <span>Delete</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
