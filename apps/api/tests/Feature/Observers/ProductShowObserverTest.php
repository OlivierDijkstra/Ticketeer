<?php

namespace Tests\Feature\Observers;

use App\Actions\AttachProductsToOrderAction;
use App\Models\Order;
use App\Models\ProductShow;
use App\Models\Product;
use App\Models\Show;
use Tests\TestCase;

class ProductShowObserverTest extends TestCase
{
    public function test_product_show_created_sets_stock()
    {
        $show = Show::factory()->create();
        $product = Product::factory()->create();

        $show->products()->attach($product->id, ['amount' => 10]);

        $this->assertEquals(10, $show->products->first()->pivot->stock);
    }

    public function test_product_show_updated_adjusts_stock()
    {
        $attachProductsToOrderAction = new AttachProductsToOrderAction();

        $product = Product::factory()->create();
        $show = Show::factory()->create();
        
        $show->products()->attach($product->id, ['amount' => 10]);

        $show->products()->updateExistingPivot($product->id, ['amount' => 15]);

        $this->assertEquals(15, $product->shows->first()->pivot->stock);

        $order = Order::factory()->create([
            'show_id' => $show->id,
        ]);

        $attachProductsToOrderAction->handle($order, [
            [
                'id' => $product->id,
                'amount' => 2,
            ]
        ], $show->id);


        $this->assertEquals(13, $product->shows()->first()->pivot->stock);
    }
}
