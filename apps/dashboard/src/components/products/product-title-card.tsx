'use client';

import type { Product } from '@repo/lib';
import { cn } from '@repo/lib';
import { Package, Ticket } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import EditableField from '@/components/editable-field';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { handleFieldUpdate } from '@/lib/utils';
import { updateProductAction } from '@/server/actions/products';

export default function ProductTitleCard({ product }: { product: Product }) {
  const [productData, setProductData] = useState<Product>(product);
  const [loading, setLoading] = useState(false);
  const [upsell, setUpsell] = useState(product.is_upsell);

  async function handleNameChange(value: string | number | null) {
    setLoading(true);

    if (!value) return;

    await toast.promise(
      updateProductAction({
        product_id: `${product.id}`,
        data: {
          name: `${value}`,
        },
      }),
      {
        loading: 'Updating product...',
        success: () => {
          // revalidate('product');
          return 'Product updated successfully';
        },
        error: 'Failed to update product',
      }
    );

    setLoading(false);
  }

  async function handleDescriptionChange(value: string | number | null) {
    setLoading(true);

    try {
      const data = await updateProductAction({
        product_id: `${product.id}`,
        data: {
          description: value ? `${value}` : null,
        },
      });

      setProductData(data);

      toast.success('Product updated successfully');
    } catch (error) {
      toast.error('Failed to update product', {
        description: 'Please try again later',
      });
    }

    setLoading(false);
  }

  async function handleUpsellChange() {
    await handleFieldUpdate<Product, typeof updateProductAction>({
      updateAction: updateProductAction,
      data: {
        product_id: product.id?.toString(),
        data: {
          is_upsell: !upsell,
        },
      },
      setLoading,
      setData: (data: Product) => {
        setUpsell(data.is_upsell);
      },
      successMessage: 'Product updated successfully',
      errorMessage: 'Failed to update product',
    });
  }

  return (
    <Card>
      <CardHeader
        className={cn(['transition-opacity', loading ? 'opacity-50' : ''])}
      >
        <div className='flex justify-between'>
          <div className='space-y-1.5'>
            <CardTitle>Product</CardTitle>
            <CardDescription>
              Edit the product name and description
            </CardDescription>
          </div>

          <div className='flex flex-col gap-1'>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Switch
                    size='lg'
                    disabled={loading}
                    onCheckedChange={handleUpsellChange}
                    checked={!upsell}
                  >
                    {upsell ? <Package /> : <Ticket />}
                  </Switch>
                </div>
              </TooltipTrigger>
              <TooltipContent className='max-w-xs' side='left'>
                Toggles between a product and an upsell. Upsells are additional
                items that can be purchased with a ticket.
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </CardHeader>

      <CardContent
        className={cn(['transition-opacity', loading ? 'opacity-50' : ''])}
      >
        <EditableField
          value={productData?.name}
          onChange={handleNameChange}
          className='text-xl font-semibold'
          tooltipText='Edit product name'
          placeholder='Product name'
          required
        />

        <EditableField
          type='textarea'
          value={productData?.description}
          onChange={handleDescriptionChange}
          className='text-sm text-muted-foreground'
          tooltipText='Edit product description'
          placeholder='No description'
          minLength={0}
        />
      </CardContent>
    </Card>
  );
}
