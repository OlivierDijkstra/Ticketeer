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

    public function setUp(): void
    {
        parent::setUp();

        $this->order = Order::factory()->create();
        $this->payment = Payment::factory()->create(['order_id' => $this->order->id, 'amount' => 10]);
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

        $requestData = ['amount' => 5];

        $response = $this->postJson(route('payments.refund', $this->payment), $requestData);

        $response->assertStatus(200);
        $response->assertJson(['message' => 'Payment refunded']);

        Queue::assertPushed(CreateRefundJob::class);
    }
}
