<?php

namespace App\Actions;

use App\Models\Order;
use App\Models\ProductShow;
use Exception;

class AttachProductsToOrderAction
{
    public function handle(Order $order, array $products, int $showId): array
    {
        $decrementedProducts = [];

        foreach ($products as $productData) {
            $productShow = ProductShow::where('product_id', $productData['id'])
                ->where('show_id', $showId)
                ->lockForUpdate()
                ->first();

            if (! $productShow) {
                throw new Exception('Product not found');
            }

            if ($productShow->stock < $productData['amount']) {
                throw new Exception('Not enough stock');
            }

            $productShow->decrement('stock', $productData['amount']);
            $decrementedProducts[] = $productData;

            $order->products()->attach($productShow->product_id, [
                'amount' => $productData['amount'],
                'price' => $productData['price'] ?? $productShow->product->price,
            ]);
        }

        return $decrementedProducts;
    }
}
