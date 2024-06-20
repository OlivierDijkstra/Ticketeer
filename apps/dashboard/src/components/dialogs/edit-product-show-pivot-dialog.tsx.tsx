'use client';

import type { Product } from '@repo/lib';
import { useState } from 'react';

import ProductShowPivotForm from '@/components/forms/product-show-pivot-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { revalidate } from '@/server/helpers';

export default function EditProductShowPivotDialog({
  product,
  children,
}: {
  product: Product;
  children: React.ReactNode;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>

        <ProductShowPivotForm
          product={product}
          callback={() => {
            setDialogOpen(false);
            revalidate('products');
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
