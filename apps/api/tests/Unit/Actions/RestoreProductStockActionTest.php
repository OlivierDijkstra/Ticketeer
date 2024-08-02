<?php

namespace Tests\Unit\Actions;

use App\Actions\RestoreProductStockAction;
use App\Models\Product;
use App\Models\Show;
use Tests\TestCase;

class RestoreProductStockActionTest extends TestCase
{
    public function test_restore_stock()
    {
        $show = Show::factory()->create();
        $products = Product::factory()->count(2)->create();

        $show->products()->attach($products->pluck('id'), ['amount' => 10]);

        $action = new RestoreProductStockAction;
        $action->handle($products->map(fn ($product) => ['id' => $product->id, 'amount' => 1])->toArray(), $show->id);

        foreach ($products as $product) {
            $this->assertDatabaseHas('product_show', ['product_id' => $product->id, 'stock' => 11]);
        }
    }
}
