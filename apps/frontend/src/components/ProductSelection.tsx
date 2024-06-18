import type { Product } from "@repo/lib";
import formatMoney from "@repo/lib";
import { Minus, Package, Plus, Ticket } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ProductSelection({
    product,
    onAdd,
    onRemove,
}: {
    product: Product & { amount: number }
    onAdd: () => void
    onRemove: () => void
}) {
    return (
      <div
        key={product.id}
        className='grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-lg border border-gray-200 p-4 dark:border-gray-800'
      >
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full ${
            !product.is_upsell
              ? 'bg-yellow-500 text-white'
              : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
          }`}
        >
          {!product.is_upsell ? <Ticket /> : <Package />}
        </div>
        <div className='grid gap-1'>
          <h3 className='font-semibold'>{product.name}</h3>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            {product.description}
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            onClick={onRemove}
            className='rounded-full'
          >
            <Minus />
          </Button>
          <div className='text-sm font-medium'>{product.amount}</div>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            onClick={onAdd}
            className='rounded-full'
          >
            <Plus />
          </Button>
        </div>
        <div className='text-right font-semibold'>
          {formatMoney(product.price)}
        </div>
      </div>
    );
}