'use client';

import { useState } from 'react';

import LinkCustomerForm from '@/components/forms/link-customer-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { revalidate } from '@/server/helpers';

export default function LinkCustomerDialog({
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
          <DialogTitle>Link customer to order</DialogTitle>
        </DialogHeader>

        <ScrollArea className='max-h-[80vh]'>
          <LinkCustomerForm
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
