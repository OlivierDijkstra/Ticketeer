<?php

namespace Database\Seeders;

use App\Jobs\AggregateDataJob;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Show;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SimulatedDataSeeder extends Seeder
{
    public function run()
    {
        // Run the DatabaseSeeder if it hasn't been run yet
        if ($this->checkIfDataExists()) {
            $this->command->info('Initial data already exists. Skipping DatabaseSeeder.');
        } else {
            $this->call(DatabaseSeeder::class);
            $this->command->info('DatabaseSeeder completed.');
        }

        // Increase product stock for all shows
        $this->increaseProductStock();

        // Set the simulation period
        $endDate = Carbon::now(config('app.timezone'));
        $startDate = $endDate->copy()->subYear();

        $this->command->info("Simulating data from {$startDate->toDateString()} to {$endDate->toDateString()}");

        // Calculate total days for progress bar
        $totalDays = $startDate->diffInDays($endDate) + 1;

        // Create progress bar
        $bar = $this->command->getOutput()->createProgressBar($totalDays);
        $bar->start();

        // Simulate data for each day
        $currentDate = $startDate->copy();
        while ($currentDate <= $endDate) {
            $this->simulateDataForDay($currentDate);
            $this->aggregateDataForDay($currentDate);
            $currentDate->addDay();

            // Advance the progress bar
            $bar->advance();
        }

        // Finish the progress bar
        $bar->finish();
        $this->command->newLine();

        $this->command->info('Simulation completed.');
    }

    private function checkIfDataExists()
    {
        return DB::table('users')->where('email', 'test@example.com')->exists();
    }

    private function increaseProductStock()
    {
        Show::with('products')->get()->each(function ($show) {
            $show->products()->updateExistingPivot($show->products->pluck('id'), ['amount' => 100000]);
        });
        $this->command->info('Product stock increased for all shows.');
    }

    private function simulateDataForDay($date)
    {
        $orderCount = rand(5, 20); // Random number of orders per day
        $orders = [];
        $orderProducts = [];
        $payments = [];
        $stockUpdates = [];

        for ($i = 0; $i < $orderCount; $i++) {
            $orderData = $this->prepareSimulatedOrder($date);
            $orders[] = $orderData['order'];
            $orderProducts = array_merge($orderProducts, $orderData['orderProducts']);
            $payments[] = $orderData['payment'];

            // Collect stock updates
            foreach ($orderData['orderProducts'] as $product) {
                $key = $product['product_id'].'-'.$orderData['order']['show_id'];
                if (! isset($stockUpdates[$key])) {
                    $stockUpdates[$key] = ['amount' => 0];
                }
                $stockUpdates[$key]['amount'] += $product['amount'];
            }
        }

        // Batch insert orders
        Order::insert($orders);

        // Batch insert order products
        DB::table('order_product')->insert($orderProducts);

        // Batch insert payments
        Payment::insert($payments);

        $this->batchUpdateProductStock($stockUpdates);
    }

    private function prepareSimulatedOrder($date)
    {
        $show = Show::inRandomOrder()->first();
        $orderCreatedAt = $date->copy()->startOfDay()->addSeconds(rand(0, 86399));
        $customer = $this->createOrGetCustomer($orderCreatedAt);

        $orderNumber = Order::generateOrderNumber();
        $order = [
            'id' => \Illuminate\Support\Str::uuid()->toString(), // Assuming Order uses UUID
            'show_id' => $show->id,
            'customer_id' => $customer->id,
            'order_number' => $orderNumber,
            'status' => 'pending',
            'description' => 'Simulated order',
            'service_fee' => $show->event->service_fee,
            'created_at' => $orderCreatedAt,
            'updated_at' => $orderCreatedAt,
        ];

        $orderProducts = $this->prepareProductsForOrder($order['id'], $show);
        $total = collect($orderProducts)->sum(function ($product) {
            return $product['amount'] * $product['price'];
        }) + $order['service_fee'];

        $order['total'] = $total;

        $payment = $this->preparePayment($order['id'], $total, $orderCreatedAt);

        return [
            'order' => $order,
            'orderProducts' => $orderProducts,
            'payment' => $payment,
        ];
    }

    private function prepareProductsForOrder($orderId, $show)
    {
        $products = $show->products()->inRandomOrder()->take(rand(1, 3))->get();
        $orderProducts = [];

        foreach ($products as $product) {
            $amount = rand(1, 5);
            $orderProducts[] = [
                'order_id' => $orderId,
                'product_id' => $product->id,
                'amount' => $amount,
                'price' => $product->price,
            ];
        }

        return $orderProducts;
    }

    private function preparePayment($orderId, $total, $createdAt)
    {
        return [
            'id' => \Illuminate\Support\Str::uuid()->toString(), // Assuming Payment uses UUID
            'order_id' => $orderId,
            'transaction_id' => 'tr_'.\Illuminate\Support\Str::random(16),
            'status' => 'paid',
            'amount' => $total,
            'payment_method' => ['credit_card', 'paypal', 'bank_transfer'][rand(0, 2)],
            'paid_at' => $createdAt->addMinutes(rand(5, 60)),
            'created_at' => $createdAt,
            'updated_at' => $createdAt,
        ];
    }

    private function batchUpdateProductStock($stockUpdates)
    {
        foreach ($stockUpdates as $key => $update) {
            [$productId, $showId] = explode('-', $key);
            DB::table('product_show')
                ->where('product_id', $productId)
                ->where('show_id', $showId)
                ->decrement('stock', $update['amount']);
        }
    }

    private function createOrGetCustomer($createdAt)
    {
        // 50% chance of creating a new customer or getting an existing one
        if (rand(0, 1) === 0) {
            // Get an existing customer
            $customer = Customer::inRandomOrder()->first();
            if ($customer) {
                return $customer;
            }
        }

        // Create a new customer if we didn't find an existing one or if we chose to create a new one
        $newCustomer = Customer::factory()->create(['created_at' => $createdAt]);

        return $newCustomer;
    }

    private function simulatePayment($order)
    {
        $payment = Payment::create([
            'order_id' => $order->id,
            'transaction_id' => 'tr_'.\Illuminate\Support\Str::random(16),
            'status' => 'paid',
            'amount' => $order->total,
            'payment_method' => ['credit_card', 'paypal', 'bank_transfer'][rand(0, 2)],
            'paid_at' => $order->created_at->addMinutes(rand(5, 60)),
        ]);

        $order->update(['status' => 'paid']);
    }

    private function aggregateDataForDay($date)
    {
        // Aggregate hourly data for each hour of the day
        $startOfDay = $date->copy()->startOfDay();
        for ($hour = 0; $hour < 24; $hour++) {
            $hourDate = $startOfDay->copy()->addHours($hour);
            $this->runAggregation('hour', $hourDate);
        }

        // Daily aggregation
        $this->runAggregation('day', $date);

        // Weekly aggregation on the first day of the week (Monday)
        if ($date->dayOfWeek === Carbon::MONDAY) {
            $this->runAggregation('week', $date);
        }

        // Monthly aggregation on the first day of the month
        if ($date->day === 1) {
            $this->runAggregation('month', $date);
        }

        // Yearly aggregation on the last day of the year
        if ($date->month === 12 && $date->day === 31) {
            $this->runAggregation('year', $date);
        }

        // $this->command->info("🔍 Aggregated data for {$date->toDateString()} (all appropriate granularities)");
    }

    private function runAggregation($granularity, $date)
    {
        $job = new AggregateDataJob($granularity, $date);
        $job->handle();
    }
}
