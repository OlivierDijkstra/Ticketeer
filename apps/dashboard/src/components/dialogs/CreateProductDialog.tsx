'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';

import CreateProductForm from '@/components/forms/CreateProductForm';
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

export default function CreateProductDialog() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className='mr-2 size-3' />
          <span>Add Product</span>
        </Button>
      </DialogTrigger>

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
