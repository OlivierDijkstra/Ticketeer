'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';

import CreateShowForm from '@/components/forms/CreateShowForm';
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

export default function CreateShowDialog() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className='mr-2 size-3' />
          <span>Add Show</span>
        </Button>
      </DialogTrigger>

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
