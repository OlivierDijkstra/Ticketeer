<?php

namespace Tests\Unit\Jobs;

use App\Jobs\GenerateMonthlyReportJob;
use App\Models\Customer;
use App\Models\Event;
use App\Models\MonthlyReport;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Show;
use Carbon\Carbon;
use Tests\TestCase;

class GenerateMonthlyReportJobTest extends TestCase
{
    public function setUp(): void
    {
        parent::setUp();
        Carbon::setTestNow('2023-06-15 12:00:00');
    }

    public function testHandleMethodGeneratesReport()
    {
        // Create test data
        $this->createTestData();

        // Run the job
        $job = new GenerateMonthlyReportJob(Carbon::parse('2023-05-01'));
        $job->handle();

        // Assert that a monthly report was created
        $this->assertDatabaseHas('monthly_reports', [
            'month' => '2023-05-01 00:00:00',
        ]);

        $report = MonthlyReport::where('month', '2023-05-01 00:00:00')->first();

        // Assert report values
        $this->assertEquals(300.00, $report->total_revenue);
        $this->assertEquals(2, $report->total_orders);
        $this->assertEquals(2, $report->new_customers);
        $this->assertEquals(4, $report->tickets_sold);
        $this->assertCount(2, $report->top_products);
        $this->assertCount(1, $report->revenue_by_event);
        $this->assertEquals(1.0, $report->customer_acquisition_rate);
        $this->assertEquals(150.00, $report->average_order_value);
        $this->assertCount(1, $report->show_product_sales);

        // Assert PDF generation
        $this->assertFileExists(storage_path('app/reports/2023-05-monthly-report.pdf'));
    }

    private function createTestData()
    {
        $event = Event::factory()->create(['name' => 'Test Event']);
        $show = Show::factory()->create(['event_id' => $event->id]);
        $product1 = Product::factory()->create(['name' => 'Product 1', 'price' => 100]);
        $product2 = Product::factory()->create(['name' => 'Product 2', 'price' => 50]);

        $customer1 = Customer::factory()->create(['created_at' => '2023-05-10']);
        $customer2 = Customer::factory()->create(['created_at' => '2023-05-20']);

        $order1 = Order::factory()->create([
            'show_id' => $show->id,
            'customer_id' => $customer1->id,
            'total' => 200,
            'created_at' => '2023-05-15',
        ]);
        $order1->products()->attach($product1, ['amount' => 2, 'price' => 100]);

        $order2 = Order::factory()->create([
            'show_id' => $show->id,
            'customer_id' => $customer2->id,
            'total' => 100,
            'created_at' => '2023-05-25',
        ]);
        $order2->products()->attach($product2, ['amount' => 1, 'price' => 50]);
        $order2->products()->attach($product1, ['amount' => 1, 'price' => 50]);

        Payment::factory()->create([
            'order_id' => $order1->id,
            'amount' => 200,
            'paid_at' => '2023-05-15',
        ]);

        Payment::factory()->create([
            'order_id' => $order2->id,
            'amount' => 100,
            'paid_at' => '2023-05-25',
        ]);
    }
}
