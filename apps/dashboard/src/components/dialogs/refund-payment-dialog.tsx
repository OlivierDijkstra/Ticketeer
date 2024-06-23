'use client';

import { DialogDescription } from '@radix-ui/react-dialog';
import type { Payment } from '@repo/lib';
import { useState } from 'react';

import RefundPaymentForm from '@/components/forms/refund-payment-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { revalidate } from '@/server/helpers';

export default function RefundPaymentDialog({
  payment,
  children,
}: {
  payment: Payment;
  children: React.ReactNode;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Refund payment</DialogTitle>
          <DialogDescription>
            Refund a payment for a specific amount.
          </DialogDescription>
        </DialogHeader>

        <RefundPaymentForm
          payment={payment}
          callback={() => {
            setDialogOpen(false);
            revalidate('payments');
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
