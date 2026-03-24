<?php

namespace Tests\Unit\Jobs;

use App\Actions\AttachProductsToOrderAction;
use App\Jobs\HandlePaymentPartiallyRefundedJob;
use App\Jobs\HandlePaymentRefundedJob;
use App\Jobs\RestoreProductStockJob;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Show;
use Illuminate\Support\Facades\Bus;
use Mollie\Api\MollieApiClient;
use Mollie\Api\Resources\Payment as MolliePayment;
use Tests\TestCase;

class HandlePaymentRefundJobsTest extends TestCase
{
    public function test_partial_refund_restores_stock_on_first_refund(): void
    {
        Bus::fake();

        [$payment] = $this->createPaidPaymentWithReservedStock('tr_partial_refund_job');

        (new HandlePaymentPartiallyRefundedJob(
            $payment,
            $this->molliePayment($payment->transaction_id, '20.00', '10.00')
        ))->handle();

        $this->assertDatabaseHas('payments', [
            'id' => $payment->id,
            'status' => 'partially_refunded',
            'amount_refunded' => '10.00',
        ]);
        $this->assertDatabaseHas('orders', [
            'id' => $payment->order_id,
            'status' => 'partially_refunded',
        ]);

        Bus::assertDispatched(RestoreProductStockJob::class);
    }

    public function test_full_refund_does_not_restore_stock_twice_after_partial_refund(): void
    {
        [$payment] = $this->createPaidPaymentWithReservedStock('tr_full_refund_after_partial_job');

        Bus::fake();
        (new HandlePaymentPartiallyRefundedJob(
            $payment,
            $this->molliePayment($payment->transaction_id, '20.00', '10.00')
        ))->handle();
        Bus::assertDispatched(RestoreProductStockJob::class);

        Bus::fake();
        (new HandlePaymentRefundedJob(
            $payment->fresh(),
            $this->molliePayment($payment->transaction_id, '20.00', '20.00')
        ))->handle();

        $this->assertDatabaseHas('payments', [
            'id' => $payment->id,
            'status' => 'refunded',
            'amount_refunded' => '20.00',
        ]);
        $this->assertDatabaseHas('orders', [
            'id' => $payment->order_id,
            'status' => 'refunded',
        ]);

        Bus::assertNotDispatched(RestoreProductStockJob::class);
    }

    public function test_full_refund_restores_stock_on_first_refund(): void
    {
        Bus::fake();

        [$payment] = $this->createPaidPaymentWithReservedStock('tr_full_refund_job');

        (new HandlePaymentRefundedJob(
            $payment,
            $this->molliePayment($payment->transaction_id, '20.00', '20.00')
        ))->handle();

        $this->assertDatabaseHas('payments', [
            'id' => $payment->id,
            'status' => 'refunded',
            'amount_refunded' => '20.00',
        ]);
        $this->assertDatabaseHas('orders', [
            'id' => $payment->order_id,
            'status' => 'refunded',
        ]);

        Bus::assertDispatched(RestoreProductStockJob::class);
    }

    private function createPaidPaymentWithReservedStock(string $transactionId): array
    {
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
            'transaction_id' => $transactionId,
        ]);

        return [$payment, $show, $product];
    }

    private function molliePayment(string $transactionId, string $amount, string $amountRefunded): MolliePayment
    {
        $payment = new MolliePayment(new MollieApiClient);
        $payment->id = $transactionId;
        $payment->amount = new \stdClass;
        $payment->amount->value = $amount;
        $payment->amountRefunded = new \stdClass;
        $payment->amountRefunded->value = $amountRefunded;

        return $payment;
    }
}
