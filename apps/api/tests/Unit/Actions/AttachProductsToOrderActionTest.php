<?php

namespace Tests\Unit\Actions;

use App\Actions\AttachProductsToOrderAction;
use App\Models\Order;
use App\Models\Product;
use App\Models\Show;
use Tests\TestCase;

class AttachProductsToOrderActionTest extends TestCase
{
    public function testAttachProducts()
    {
        $show = Show::factory()->create();
        $order = Order::factory()->create(['show_id' => $show->id]);
        $products = Product::factory()->count(2)->create();

        $show->products()->attach($products->pluck('id'), ['amount' => 10]);

        $action = new AttachProductsToOrderAction();
        $action->handle($order, $products->map(fn ($product) => ['id' => $product->id, 'amount' => 1])->toArray(), $show->id);

        $this->assertDatabaseHas('order_product', ['order_id' => $order->id]);
    }
}
