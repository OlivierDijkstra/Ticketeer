<?php

namespace Tests\Feature\Controllers;

use App\Models\Order;
use App\Models\Customer;
use App\Models\User;
use App\Models\MonthlyReport;
use App\Notifications\TicketsNotification;
use App\Notifications\MonthlyReportNotification;
use Illuminate\Support\Facades\Notification;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class NotificationControllerTest extends TestCase
{
    public $order;

    public $monthlyReport;

    public function setUp(): void
    {
        parent::setUp();

        $customer = Customer::factory()->create();
        $this->order = Order::factory()->create(['customer_id' => $customer->id]);
        $this->monthlyReport = MonthlyReport::factory()->create();
    }

    public function test_notify_tickets()
    {
        Sanctum::actingAs($this->user);
        Notification::fake();

        $response = $this->postJson(route('notifications.tickets'), [
            'order_id' => $this->order->id,
        ]);

        $response->assertStatus(200);
        $response->assertJson(['message' => 'Tickets notification sent']);

        Notification::assertSentTo(
            $this->order->customer,
            TicketsNotification::class,
            function ($notification, $channels) {
                return $notification->order->id === $this->order->id;
            }
        );
    }

    public function test_notify_tickets_customer_not_found()
    {
        Sanctum::actingAs($this->user);
        $orderWithoutCustomer = Order::factory()->create(['customer_id' => null]);

        $response = $this->postJson(route('notifications.tickets'), [
            'order_id' => $orderWithoutCustomer->id,
        ]);

        $response->assertStatus(404);
        $response->assertJson(['message' => 'Customer not found']);
    }

    public function test_notify_monthly_report()
    {
        Sanctum::actingAs($this->user);
        Notification::fake();

        $response = $this->postJson(route('notifications.monthly-report'), [
            'report_id' => $this->monthlyReport->id,
        ]);

        $response->assertStatus(200);
        $response->assertJson(['message' => 'Monthly report notification sent']);

        Notification::assertSentTo(
            $this->user,
            MonthlyReportNotification::class,
            function ($notification, $channels) {
                return $notification->report->id === $this->monthlyReport->id;
            }
        );
    }

    public function test_unauthenticated_access()
    {
        $this->assertGuest();

        $response = $this->postJson(route('notifications.tickets'), [
            'order_id' => $this->order->id,
        ]);

        $response->assertStatus(401);
    }
}
