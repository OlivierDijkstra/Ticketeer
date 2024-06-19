'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';

import CreateEventForm from '@/components/forms/create-event-form';
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

export default function CreateEventDialog() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className='mr-2' />
          <span>Add Event</span>
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add new event</DialogTitle>
        </DialogHeader>

        <ScrollArea className='max-h-[80vh]'>
          <CreateEventForm
            callback={() => {
              setDialogOpen(false);
              revalidate('events');
            }}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}