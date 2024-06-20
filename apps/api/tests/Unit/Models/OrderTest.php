<?php

namespace Tests\Unit\Models;

use App\Models\Order;
use App\Models\Product;
use App\Models\Show;
use App\Models\Customer;
use App\Models\Event;
use Tests\TestCase;

class OrderTest extends TestCase
{
    public function test_order_has_payments()
    {
        $order = Order::factory()->create();
        $this->assertInstanceOf('Illuminate\Database\Eloquent\Collection', $order->payments);
    }

    public function test_order_has_products()
    {
        $order = Order::factory()->create();
        $this->assertInstanceOf('Illuminate\Database\Eloquent\Collection', $order->products);
    }

    public function test_order_belongs_to_show()
    {
        $order = Order::factory()->create();
        $this->assertInstanceOf(Show::class, $order->show);
    }

    public function test_order_has_one_through_event()
    {
        $order = Order::factory()->create();
        $this->assertInstanceOf(Event::class, $order->event);
    }

    public function test_order_belongs_to_customer()
    {
        $order = Order::factory()->create();
        $this->assertInstanceOf(Customer::class, $order->customer);
    }

    public function test_sub_total_from_products()
    {
        $order = Order::factory()->create();
        $product = Product::factory()->create(['price' => 100]);
        $order->products()->attach($product, ['amount' => 2, 'price' => 100]);

        $this->assertEquals(200, $order->subTotalFromProducts());
    }

    public function test_total_from_products()
    {
        $order = Order::factory()->create();
        $product = Product::factory()->create(['price' => 100]);
        $order->products()->attach($product, ['amount' => 2, 'price' => 100]);

        $this->assertEquals(200, $order->totalFromProducts());
    }

    public function test_generate_order_number()
    {
        $orderNumber = Order::GenerateOrderNumber();
        $this->assertStringStartsWith('ORD-', $orderNumber);
    }
}
