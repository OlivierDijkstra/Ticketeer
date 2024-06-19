'use client';

import { Link } from 'lucide-react';
import { useState } from 'react';

import LinkProductForm from '@/components/forms/link-product-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { revalidate } from '@/server/helpers';

export default function LinkProductDialog() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant='secondary'>
          <Link className='mr-2 size-3' />
          <span>Link Product</span>
        </Button>
      </DialogTrigger>

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
