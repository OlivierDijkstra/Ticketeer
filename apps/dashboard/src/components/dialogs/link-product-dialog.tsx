'use client';

import { useState } from 'react';

import LinkProductForm from '@/components/forms/link-product-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { revalidate } from '@/server/helpers';

export default function LinkProductDialog({
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
          <DialogTitle>Link existing product</DialogTitle>
        </DialogHeader>

        <ScrollArea className='max-h-[80vh]'>
          <LinkProductForm
            callback={() => {
              setDialogOpen(false);
              revalidate('products');
            }}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
