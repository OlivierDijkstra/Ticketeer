<?php

namespace Database\Seeders;

use App\Jobs\AggregateDataJob;
use App\Models\Address;
use App\Models\Aggregation;
use App\Models\Customer;
use App\Models\Event;
use App\Models\Product;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        if (User::where('email', 'test@example.com')->exists()) {
            return;
        }

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        $customers = Customer::factory(2)->create();

        // Create addresses for each customer
        $customers->each(function ($customer) {
            $address = Address::factory()->make();
            $customer->address()->update($address->toArray());
        });

        $event = Event::factory()->create([
            'name' => 'Test Event',
        ]);

        $shows = $event->shows()->createMany([
            [
                'start' => now()->addDays(1),
                'end' => now()->addDays(2),
                'enabled' => 1,
                'guests' => ['John Doe', 'Jane Doe'],
                'description' => Str::random(10),
            ],
            [
                'start' => now()->addDays(3),
                'end' => now()->addDays(4),
                'enabled' => 1,
                'guests' => ['John Doe', 'Jane Doe'],
                'description' => Str::random(10),
            ],
            [
                'start' => now()->addDays(5),
                'end' => now()->addDays(6),
                'enabled' => 1,
                'guests' => ['John Doe', 'Jane Doe'],
                'description' => Str::random(10),
            ],
        ]);

        // create addresses for each show
        $shows->each(function ($show) {
            $address = Address::factory()->make();
            $show->address()->update($address->toArray());
        });

        $product = Product::factory(1)->create([
            'name' => 'Test Product',
            'price' => 5,
        ]);

        $upsellProduct = Product::factory(1)->upSell()->create([
            'name' => 'Upsell Product',
            'price' => 10,
        ]);

        $shows->each(function ($show) use ($product, $upsellProduct) {
            $show->products()->attach($product, [
                'amount' => 100,
            ]);

            $show->products()->attach($upsellProduct, [
                'amount' => 100,
            ]);
        });

        $this->seedInitialAggregations();
    }

    protected function seedInitialAggregations(): void
    {
        $this->command->info('Seeding initial aggregations...');

        $endDate = Carbon::now(config('app.timezone'));
        $startDate = $endDate->copy()->subYear();

        $this->command->info("Simulating data from {$startDate->toDateString()} to {$endDate->toDateTimeString()}");

        // Calculate total days for progress bar
        $totalDays = $startDate->diffInDays($endDate) + 1;

        // Create progress bar
        $bar = $this->command->getOutput()->createProgressBar($totalDays);
        $bar->start();

        $batchSize = 1000;
        $aggregations = [];

        // Simulate data for each day
        $currentDate = $startDate->copy();
        while ($currentDate <= $endDate) {
            $aggregations = array_merge($aggregations, $this->aggregateDataForDay($currentDate, $endDate));
            $currentDate->addDay();

            // Insert batch if we've reached the batch size
            if (count($aggregations) >= $batchSize) {
                \App\Models\Aggregation::insert($aggregations);
                $aggregations = [];
            }

            // Advance the progress bar
            $bar->advance();
        }

        // Insert any remaining aggregations
        if (!empty($aggregations)) {
            \App\Models\Aggregation::insert($aggregations);
        }

        // Finish the progress bar
        $bar->finish();
        $this->command->newLine();
    }

    private function aggregateDataForDay($date, $endDate)
    {
        $modelTypes = ['Order', 'Customer'];
        $aggregationTypes = ['count', 'sum', 'avg', 'min', 'max'];
        $aggregations = [];

        // Hourly aggregation
        $startOfDay = $date->copy()->startOfDay();
        for ($hour = 0; $hour < 24; $hour++) {
            $hourDate = $startOfDay->copy()->addHours($hour);
            if ($hourDate > $endDate) {
                break;
            }
            $aggregations = array_merge($aggregations, $this->createSimpleAggregation('hour', $hourDate, $modelTypes, $aggregationTypes));
        }

        // Daily aggregation (only if we've completed the full day)
        if ($date->copy()->endOfDay() <= $endDate) {
            $aggregations = array_merge($aggregations, $this->createSimpleAggregation('day', $date, $modelTypes, $aggregationTypes));
        }

        // Weekly aggregation on the first day of the week (Monday)
        if ($date->dayOfWeek === Carbon::MONDAY && $date->copy()->endOfWeek() <= $endDate) {
            $aggregations = array_merge($aggregations, $this->createSimpleAggregation('week', $date, $modelTypes, $aggregationTypes));
        }

        // Monthly aggregation on the first day of the month
        if ($date->day === 1 && $date->copy()->endOfMonth() <= $endDate) {
            $aggregations = array_merge($aggregations, $this->createSimpleAggregation('month', $date, $modelTypes, $aggregationTypes));
        }

        // Yearly aggregation on the last day of the year
        if ($date->month === 12 && $date->day === 31 && $date->copy()->endOfYear() <= $endDate) {
            $aggregations = array_merge($aggregations, $this->createSimpleAggregation('year', $date, $modelTypes, $aggregationTypes));
        }

        return $aggregations;
    }

    private function createSimpleAggregation($granularity, $date, $modelTypes, $aggregationTypes)
    {
        $aggregations = [];
        foreach ($modelTypes as $modelType) {
            foreach ($aggregationTypes as $aggregationType) {
                // Skip 'sum', 'avg', 'min', 'max' for Customer model
                if ($modelType === 'Customer' && $aggregationType !== 'count') {
                    continue;
                }
                
                $aggregations[] = [
                    'model_type' => $modelType,
                    'aggregation_type' => $aggregationType,
                    'granularity' => $granularity,
                    'period' => $granularity === 'hour' ? $date : $date->startOfDay(),
                    'value' => 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }
        return $aggregations;
    }
}