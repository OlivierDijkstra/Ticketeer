<?php

namespace Tests\Feature\Controllers;

use App\Jobs\CreateRefundJob;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Support\Facades\Queue;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PaymentsControllerTest extends TestCase
{
    protected $order;

    protected $payment;

    protected $paymentAmount = 100;

    public function setUp(): void
    {
        parent::setUp();

        $this->order = Order::factory()->create();
        $this->payment = Payment::factory()->create([
            'order_id' => $this->order->id,
            'amount' => $this->paymentAmount,
            'status' => 'paid', // Ensure the payment is in 'paid' status
        ]);
    }

    public function test_index()
    {
        Sanctum::actingAs($this->user);

        $response = $this->getJson(route('payments.index', $this->order));

        $response->assertStatus(200);
        $response->assertJsonCount(1, 'data');
    }

    public function test_refund()
    {
        Sanctum::actingAs($this->user);

        Queue::fake();

        // Small delay to ensure payment is processed
        usleep(100000); // 100ms delay

        $refundAmount = $this->paymentAmount / 2; // Refund half of the payment
        $requestData = ['amount' => $refundAmount];

        $response = $this->postJson(route('payments.refund', $this->payment), $requestData);

        $response->assertStatus(200);
        $response->assertJson(['message' => 'Payment refunded']);

        Queue::assertPushed(CreateRefundJob::class);
    }
}
