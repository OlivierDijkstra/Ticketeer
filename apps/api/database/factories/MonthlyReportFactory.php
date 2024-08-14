<?php

namespace Database\Factories;

use App\Models\MonthlyReport;
use Illuminate\Database\Eloquent\Factories\Factory;

class MonthlyReportFactory extends Factory
{
    protected $model = MonthlyReport::class;

    public function definition(): array
    {
        $month = fake()->dateTimeBetween('-1 year', 'now')->format('Y-m-d');

        return [
            'month' => $month,
            'total_revenue' => fake()->randomFloat(2, 10000, 1000000),
            'total_orders' => fake()->numberBetween(100, 10000),
            'new_customers' => fake()->numberBetween(10, 1000),
            'tickets_sold' => fake()->numberBetween(500, 50000),
            'top_products' => $this->generateTopProducts(),
            'revenue_by_event' => $this->generateRevenueByEvent(),
            'customer_acquisition_rate' => fake()->randomFloat(4, 0.01, 0.5),
            'average_order_value' => fake()->randomFloat(2, 50, 500),
            'show_product_sales' => $this->generateShowProductSales(),
            'created_at' => now()->toDateTimeString(),
            'updated_at' => now()->toDateTimeString(),
        ];
    }

    private function generateTopProducts(): array
    {
        $products = [];
        for ($i = 0; $i < 5; $i++) {
            $products[] = [
                'name' => fake()->word(),
                'revenue' => fake()->randomFloat(2, 1000, 100000),
                'quantity' => (string) fake()->numberBetween(50, 1000),
                'base_price' => fake()->randomFloat(2, 10, 1000),
                'product_id' => fake()->unique()->numberBetween(1, 100),
            ];
        }

        return $products;
    }

    private function generateRevenueByEvent(): array
    {
        $events = [];
        for ($i = 0; $i < 3; $i++) {
            $events[] = [
                'name' => fake()->sentence(3),
                'revenue' => fake()->randomFloat(2, 5000, 500000),
                'event_id' => fake()->unique()->numberBetween(1, 50),
            ];
        }

        return $events;
    }

    private function generateShowProductSales(): array
    {
        $shows = [];
        for ($i = 0; $i < 3; $i++) {
            $shows[] = [
                'show_id' => fake()->unique()->numberBetween(1, 100),
                'products' => $this->generateProductsForShow(),
                'show_name' => fake()->sentence(2),
            ];
        }

        return $shows;
    }

    private function generateProductsForShow(): array
    {
        $products = [];
        for ($i = 0; $i < 3; $i++) {
            $products[] = [
                'name' => fake()->word(),
                'revenue' => fake()->randomFloat(2, 100, 50000),
                'quantity' => (string) fake()->numberBetween(10, 500),
                'base_price' => fake()->randomFloat(2, 10, 1000),
                'product_id' => fake()->numberBetween(1, 100),
            ];
        }

        return $products;
    }
}
