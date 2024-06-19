<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Event>
 */
class EventFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->name();
        // Make a slug out of the name
        $slug = Str::slug($name);

        return [
            'name' => $name,
            'slug' => $slug,
            'service_fee' => 2.5,
            'description' => fake()->text(),
            'enabled' => true,
            'featured' => false,
        ];
    }

    public function featured(): self
    {
        return $this->state([
            'featured' => true,
        ]);
    }

    public function disabled(): self
    {
        return $this->state([
            'enabled' => false,
        ]);
    }
}
