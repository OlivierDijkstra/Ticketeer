<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Order>
 */
class OrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'show_id' => \App\Models\Show::factory(),
            'customer_id' => \App\Models\Customer::factory()->create()->id,
            'order_number' => \App\Models\Order::GenerateOrderNumber(),
            'status' => 'pending',
            'description' => fake()->paragraph,
            'service_fee' => '0.00',
            'total' => '0.00',
            'discount' => '0.00',
        ];
    }
}
