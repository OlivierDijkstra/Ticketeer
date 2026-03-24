<?php

namespace Tests\Unit\Jobs;

use App\Actions\AttachProductsToOrderAction;
use App\Jobs\CreateRefundJob;
use App\Jobs\RestoreProductStockJob;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Show;
use Illuminate\Support\Facades\Bus;
use Mockery;
use Tests\TestCase;

class CreateRefundJobTest extends TestCase
{
    public function test_create_refund_marks_payment_pending_without_restoring_stock(): void
    {
        Bus::fake();

        $show = Show::factory()->create();
        $product = Product::factory()->create();
        $show->products()->attach($product->id, ['amount' => 10]);

        $order = Order::factory()->create([
            'show_id' => $show->id,
            'status' => 'paid',
        ]);

        (new AttachProductsToOrderAction)->handle($order, [[
            'id' => $product->id,
            'amount' => 2,
        ]], $show->id);

        $payment = Payment::factory()->create([
            'order_id' => $order->id,
            'status' => 'paid',
            'amount' => '20.00',
            'amount_refunded' => '0.00',
            'transaction_id' => 'tr_create_refund_job',
        ]);

        $molliePayment = Mockery::mock();
        $molliePayment->shouldReceive('refund')->once();

        $mollieMock = Mockery::mock('overload:Mollie\Laravel\Facades\Mollie');
        $apiMock = Mockery::mock();
        $paymentsMock = Mockery::mock();
        $mollieMock->shouldReceive('api')->andReturn($apiMock);
        $apiMock->payments = $paymentsMock;
        $paymentsMock->shouldReceive('get')->andReturn($molliePayment);

        (new CreateRefundJob($payment, 10))->handle();

        $this->assertDatabaseHas('payments', [
            'id' => $payment->id,
            'status' => 'pending_refund',
        ]);
        $this->assertDatabaseHas('product_show', [
            'product_id' => $product->id,
            'show_id' => $show->id,
            'stock' => 8,
        ]);

        Bus::assertNotDispatched(RestoreProductStockJob::class);
    }
}
