'use client';

import { useState } from 'react';

import CreateUserForm from '@/components/forms/create-user-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { revalidate } from '@/server/helpers';

export default function CreateUserDialog({
  children,
}: {
  children: React.ReactNode;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add new user</DialogTitle>
        </DialogHeader>

        <ScrollArea className='max-h-[80vh]'>
          <CreateUserForm
            callback={() => {
              setDialogOpen(false);
              revalidate('users');
            }}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
