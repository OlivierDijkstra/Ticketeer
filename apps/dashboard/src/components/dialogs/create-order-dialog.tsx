'use client';

import { useState } from 'react';

import CreateOrderForm from '@/components/forms/create-order-form';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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

export default function CreateOrderDialog({
  children,
}: {
  children: React.ReactNode;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);

  function handleDialogOpenChange(open: boolean) {
    if (!open) {
      setConfirmationOpen(true);
      return;
    }

    setDialogOpen(open);
  }

  function handleCloseDialog() {
    setConfirmationOpen(false);
  }

  function confirmChange() {
    setDialogOpen(false);
    setConfirmationOpen(false);
  }

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogTrigger asChild>{children}</DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add new order</DialogTitle>
          </DialogHeader>

          <ScrollArea className='max-h-[80vh]'>
            <CreateOrderForm
              callback={() => {
                setDialogOpen(false);
                revalidate('orders');
              }}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmationOpen} onOpenChange={setConfirmationOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Closing the dialog will discard all changes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button onClick={handleCloseDialog} variant='outline'>
              Cancel
            </Button>
            <AlertDialogAction onClick={confirmChange}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
