<?php

namespace Tests\Unit\Actions;

use App\Actions\CreatePaymentAction;
use App\Models\Order;
use Tests\TestCase;

class CreatePaymentActionTest extends TestCase
{
    public function test_create_payment()
    {
        $order = Order::factory()->create(['total' => 100.00]);
        $action = new CreatePaymentAction;

        $paymentUrl = $action->handle($order, $order->total, 'http://example.com');

        $this->assertNotEmpty($paymentUrl);
        $this->assertDatabaseHas('payments', ['order_id' => $order->id]);
    }
}
