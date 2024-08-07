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
            $show->products()->updateExistingPivot($show->products->pluck('id'), ['amount' => 1000]);
        });
        $this->command->info('Product stock increased for all shows.');
    }

    private function simulateDataForDay($date)
    {
        $orderCount = rand(5, 20); // Random number of orders per day

        for ($i = 0; $i < $orderCount; $i++) {
            $this->createSimulatedOrder($date);
        }
    }

    private function createSimulatedOrder($date)
    {
        $show = Show::inRandomOrder()->first();
        $orderCreatedAt = $date->copy()->startOfDay()->addSeconds(rand(0, 86399)); // Random time within the day (up to 23:59:59)
        $customer = $this->createOrGetCustomer($orderCreatedAt);

        $order = Order::create([
            'show_id' => $show->id,
            'customer_id' => $customer->id,
            'order_number' => Order::GenerateOrderNumber(),
            'status' => 'pending',
            'description' => 'Simulated order',
            'service_fee' => $show->event->service_fee,
            'created_at' => $orderCreatedAt,
        ]);

        $this->attachProductsToOrder($order, $show);

        $order->update(['total' => $order->totalFromProducts() + $order->service_fee]);

        $this->simulatePayment($order);
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

    private function attachProductsToOrder($order, $show)
    {
        $products = $show->products()->inRandomOrder()->take(rand(1, 3))->get();

        foreach ($products as $product) {
            $amount = rand(1, 5);
            $order->products()->attach($product->id, [
                'amount' => $amount,
                'price' => $product->price,
            ]);

            // Decrease stock
            $productShow = $show->products()->where('product_id', $product->id)->first()->pivot;
            $newAmount = $productShow->amount - $amount;
            $show->products()->updateExistingPivot($product->id, [
                'amount' => $newAmount
            ]);
        }
    }

    private function simulatePayment($order)
    {
        $payment = Payment::create([
            'order_id' => $order->id,
            'transaction_id' => 'tr_' . \Illuminate\Support\Str::random(16),
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