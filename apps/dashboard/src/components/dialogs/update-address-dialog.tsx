'use client';

import type { Address } from '@repo/lib';
import { useState } from 'react';

import UpdateAddressForm from '@/components/forms/update-address-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { revalidate } from '@/server/helpers';

export default function UpdateAddressDialog({
  children,
  address,
}: {
  children: React.ReactNode;
  address: Address;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update address</DialogTitle>
        </DialogHeader>

        <ScrollArea className='max-h-[80vh]'>
          <UpdateAddressForm
            address={address}
            callback={() => {
              setDialogOpen(false);
              revalidate('customer');
              revalidate('show');
            }}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
