<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Show>
 */
class ShowFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'start' => fake()->dateTimeBetween('now', '+1 year'),
            'end' => fake()->dateTimeBetween('+1 year', '+2 years'),
            'enabled' => true,
            'guests' => fake()->words(3),
            'description' => fake()->sentence(),
        ];
    }

    public function disabled(): self
    {
        return $this->state(function (array $attributes) {
            return [
                'enabled' => false,
            ];
        });
    }
}
