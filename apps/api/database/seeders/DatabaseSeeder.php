<?php

namespace Database\Seeders;

use App\Models\Address;
use App\Models\Customer;
use App\Models\Event;
use App\Models\Product;
use App\Models\User;
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
    }
}
