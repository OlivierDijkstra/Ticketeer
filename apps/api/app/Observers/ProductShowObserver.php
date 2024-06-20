<?php

namespace App\Observers;

use App\Models\ProductShow;

class ProductShowObserver
{
    /**
     * Handle the ProductShow "created" event.
     */
    public function created(ProductShow $productShow): void
    {
        //
    }

    /**
     * Handle the ProductShow "updated" event.
     */
    public function updated(ProductShow $productShow): void
    {
        if ($productShow->isDirty('amount')) {
            $newAmount = $productShow->amount;

            $soldAmount = $productShow->product->orders()
                ->join('order_product as op', 'orders.id', '=', 'op.order_id')
                ->where('op.product_id', $productShow->product_id)
                ->where('show_id', $productShow->show_id)
                ->sum('op.amount');

            $newStock = max(0, min($newAmount - $soldAmount, $newAmount));

            if ($productShow->stock !== $newStock) {
                $productShow->stock = $newStock;
                $productShow->saveQuietly();
            }
        }
    }

    /**
     * Handle the ProductShow "deleted" event.
     */
    public function deleted(ProductShow $productShow): void
    {
        //
    }

    /**
     * Handle the ProductShow "restored" event.
     */
    public function restored(ProductShow $productShow): void
    {
        //
    }

    /**
     * Handle the ProductShow "force deleted" event.
     */
    public function forceDeleted(ProductShow $productShow): void
    {
        //
    }
}

