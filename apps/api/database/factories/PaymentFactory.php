<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Payment>
 */
class PaymentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'order_id' => \App\Models\Order::factory(),
            'transaction_id' => 'tr_'.fake()->regexify('[A-Za-z0-9]{16}'),
            'status' => 'open',
            'amount' => fake()->randomFloat(2, 10, 1000),
            'payment_method' => fake()->randomElement(['credit_card', 'paypal', 'bank_transfer']),
            'amount_refunded' => fake()->optional(0.1)->randomFloat(2, 0, 100),
            'payment_url' => fake()->url(),
            'paid_at' => fake()->optional()->dateTimeThisYear(),
            'refunded_at' => fake()->optional(0.05)->dateTimeThisYear(),
        ];
    }
}
