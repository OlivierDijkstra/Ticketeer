'use client';

import { useState } from 'react';

import CreateShowForm from '@/components/forms/create-show-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { revalidate } from '@/server/helpers';

export default function CreateShowDialog({
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
          <DialogTitle>Add new show</DialogTitle>
        </DialogHeader>

        <ScrollArea className='max-h-[80vh]'>
          <CreateShowForm
            callback={() => {
              setDialogOpen(false);
              revalidate('shows');
            }}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
