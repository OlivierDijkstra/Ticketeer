<?php

namespace App\Actions;

use App\Models\ProductShow;

class RestoreProductStockAction
{
    public function handle(array $products, int $showId)
    {
        foreach ($products as $productData) {
            $productShow = ProductShow::where('product_id', $productData['id'])
                ->where('show_id', $showId)
                ->first();
            if ($productShow) {
                $productShow->increment('stock', $productData['amount']);
            }
        }
    }
}
