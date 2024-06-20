'use client';

import { useState } from 'react';

import CreateProductForm from '@/components/forms/create-product-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { revalidate } from '@/server/helpers';

export default function CreateProductDialog({
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
          <DialogTitle>Add new product</DialogTitle>
        </DialogHeader>

        <ScrollArea className=' max-h-[80vh]'>
          <CreateProductForm
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
