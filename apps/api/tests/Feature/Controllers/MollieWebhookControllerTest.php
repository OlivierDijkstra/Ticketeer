<?php

namespace Tests\Feature\Controllers;

use App\Jobs\GenerateTicketsJob;
use App\Jobs\HandlePaymentPaidJob;
use App\Jobs\HandlePaymentPartiallyRefundedJob;
use App\Jobs\HandlePaymentRefundedJob;
use App\Jobs\RestoreProductStockJob;
use App\Models\Payment;
use Illuminate\Support\Facades\Bus;
use Mockery;
use Mollie\Api\MollieApiClient;
use PHPUnit\Framework\Attributes\PreserveGlobalState;
use PHPUnit\Framework\Attributes\RunInSeparateProcess;
use Tests\TestCase;

class MollieWebhookControllerTest extends TestCase
{
    #[RunInSeparateProcess]
    #[PreserveGlobalState(false)]
    public function test_webhook_handles_paid_status()
    {
        Bus::fake();

        $transaction_id = 'tr_1234567890';
        $amount = '10.00';

        $payment = Payment::factory()->create([
            'status' => 'open',
            'transaction_id' => $transaction_id,
            'amount' => $amount,
        ]);

        $this->mockMolliePayment($transaction_id, 'paid', $amount);

        $response = $this->postJson('/webhooks/mollie', ['id' => $transaction_id]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('payments', [
            'id' => $payment->id,
            'status' => 'open',
        ]);

        Bus::assertChained([
            HandlePaymentPaidJob::class,
            GenerateTicketsJob::class,
        ]);
    }

    #[RunInSeparateProcess]
    #[PreserveGlobalState(false)]
    public function test_webhook_handles_failed_status()
    {
        Bus::fake();

        $transaction_id = 'tr_failed123';
        $amount = '15.00';

        $payment = Payment::factory()->create([
            'status' => 'open',
            'transaction_id' => $transaction_id,
            'amount' => $amount,
        ]);

        $this->mockMolliePayment($transaction_id, 'failed', $amount);

        $response = $this->postJson('/webhooks/mollie', ['id' => $transaction_id]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('payments', [
            'id' => $payment->id,
            'status' => 'failed',
        ]);

        Bus::assertDispatched(RestoreProductStockJob::class);
    }

    #[RunInSeparateProcess]
    #[PreserveGlobalState(false)]
    public function test_webhook_handles_cancelled_status()
    {
        Bus::fake();

        $transaction_id = 'tr_cancelled456';
        $amount = '20.00';

        $payment = Payment::factory()->create([
            'status' => 'open',
            'transaction_id' => $transaction_id,
            'amount' => $amount,
        ]);

        $this->mockMolliePayment($transaction_id, 'cancelled', $amount);

        $response = $this->postJson('/webhooks/mollie', ['id' => $transaction_id]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('payments', [
            'id' => $payment->id,
            'status' => 'cancelled',
        ]);

        Bus::assertDispatched(RestoreProductStockJob::class);
    }

    #[RunInSeparateProcess]
    #[PreserveGlobalState(false)]
    public function test_webhook_handles_expired_status()
    {
        Bus::fake();

        $transaction_id = 'tr_expired789';
        $amount = '25.00';

        $payment = Payment::factory()->create([
            'status' => 'open',
            'transaction_id' => $transaction_id,
            'amount' => $amount,
        ]);

        $this->mockMolliePayment($transaction_id, 'expired', $amount);

        $response = $this->postJson('/webhooks/mollie', ['id' => $transaction_id]);

        $response->assertStatus(200);
        $this->assertDatabaseMissing('payments', ['id' => $payment->id]);

        Bus::assertDispatched(RestoreProductStockJob::class);
    }

    #[RunInSeparateProcess]
    #[PreserveGlobalState(false)]
    public function test_webhook_handles_partial_refund()
    {
        Bus::fake();

        $transaction_id = 'tr_partial_refund123';
        $amount = '50.00';
        $refunded_amount = '20.00';

        Payment::factory()->create([
            'status' => 'paid',
            'transaction_id' => $transaction_id,
            'amount' => $amount,
        ]);

        $this->mockMolliePayment($transaction_id, 'paid', $amount, $refunded_amount);

        $response = $this->postJson('/webhooks/mollie', ['id' => $transaction_id]);

        $response->assertStatus(200);

        Bus::assertDispatched(HandlePaymentPartiallyRefundedJob::class);
    }

    #[RunInSeparateProcess]
    #[PreserveGlobalState(false)]
    public function test_webhook_handles_full_refund()
    {
        Bus::fake();

        $transaction_id = 'tr_full_refund456';
        $amount = '75.00';

        Payment::factory()->create([
            'status' => 'paid',
            'transaction_id' => $transaction_id,
            'amount' => $amount,
        ]);

        $this->mockMolliePayment($transaction_id, 'paid', $amount, $amount);

        $response = $this->postJson('/webhooks/mollie', ['id' => $transaction_id]);

        $response->assertStatus(200);

        Bus::assertChained([
            HandlePaymentRefundedJob::class,
            RestoreProductStockJob::class,
        ]);
    }

    private function mockMolliePayment($transaction_id, $status, $amount, $refunded_amount = '0.00')
    {
        $mollieMock = Mockery::mock('overload:Mollie\Laravel\Facades\Mollie');
        $apiMock = Mockery::mock();
        $mollieMock->shouldReceive('api')->andReturn($apiMock);
        $paymentsMock = Mockery::mock();
        $apiMock->payments = $paymentsMock;

        $response = new \Mollie\Api\Resources\Payment(new MollieApiClient());
        $response->id = $transaction_id;
        $response->status = $status;
        $response->amount = new \stdClass();
        $response->amount->value = $amount;
        $response->amountRefunded = new \stdClass();
        $response->amountRefunded->value = $refunded_amount;
        $paymentsMock->shouldReceive('get')->andReturn($response);

        return $mollieMock;
    }
}
