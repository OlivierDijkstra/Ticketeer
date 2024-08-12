<?php

namespace Tests\Unit\Actions;

use App\Actions\CreatePaymentAction;
use App\Models\Order;
use Mockery;
use Tests\TestCase;

class CreatePaymentActionTest extends TestCase
{
    public function test_create_payment()
    {
        $paymentMock = Mockery::mock();
        $paymentMock->shouldReceive('getCheckoutUrl')->andReturn('https://www.mollie.com/payscreen/select-method/123456');
        $paymentMock->id = 'tr_123456';
        $paymentMock->status = 'open';

        $mollieMock = Mockery::mock('overload:Mollie\Laravel\Facades\Mollie');
        $apiMock = Mockery::mock();
        $paymentsMock = Mockery::mock();
        $mollieMock->shouldReceive('api')->andReturn($apiMock);
        $apiMock->payments = $paymentsMock;
        $paymentsMock->shouldReceive('create')->andReturn($paymentMock);

        $order = Order::factory()->create(['total' => 100.00]);
        $action = new CreatePaymentAction;

        $paymentUrl = $action->handle($order, $order->total, 'http://example.com');

        $this->assertNotEmpty($paymentUrl);
        $this->assertDatabaseHas('payments', ['order_id' => $order->id]);
    }
}
