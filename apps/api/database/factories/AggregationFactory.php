<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Aggregation>
 */
class AggregationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'model_type' => 'Order',
            'aggregation_type' => 'sum',
            'granularity' => 'day',
            'period' => '2023-01-01 00:00:00',
            'value' => 100,
        ];
    }
}
