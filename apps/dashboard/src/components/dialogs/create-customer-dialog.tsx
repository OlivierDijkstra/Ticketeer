'use client';

import { useState } from 'react';

import CreateCustomerForm from '@/components/forms/create-customer-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { revalidate } from '@/server/helpers';

export default function CreateCustomerDialog({
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
          <DialogTitle>Add new customer</DialogTitle>
        </DialogHeader>

        <ScrollArea className='max-h-[80vh]'>
          <CreateCustomerForm
            callback={() => {
              setDialogOpen(false);
              revalidate('customers');
              revalidate('order');
            }}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
