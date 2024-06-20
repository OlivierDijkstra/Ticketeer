<?php

namespace Tests\Feature\Controllers;

use App\Models\Address;
use App\Models\Customer;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CustomerControllerTest extends TestCase
{
    public function setUp(): void
    {
        parent::setUp();

        Customer::factory()->count(10)->create();
    }

    public function test_index()
    {
        Sanctum::actingAs($this->user);

        $response = $this->getJson(route('customers.index'));

        $response->assertStatus(200);
    }

    public function test_store()
    {
        Sanctum::actingAs($this->user);

        $response = $this->postJson(route('customers.store'), [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'johndoe@example.com',
            'phone' => '1234567890',
            'address' => [
                'street' => '123 Main St',
                'city' => 'Springfield',
                'state' => 'IL',
                'country' => 'USA',
                'postal_code' => '62701',
            ],
        ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('customers', [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'johndoe@example.com',
        ]);

        $this->assertDatabaseHas('addresses', [
            'street' => '123 Main St',
            'city' => 'Springfield',
            'state' => 'IL',
            'country' => 'USA',
            'postal_code' => '62701',
        ]);
    }

    public function test_show()
    {
        Sanctum::actingAs($this->user);

        $customer = Customer::first();

        $response = $this->getJson(route('customers.show', $customer));

        $response->assertStatus(200);
        $response->assertJson(['id' => $customer->id]);
    }

    public function test_update()
    {
        Sanctum::actingAs($this->user);

        $needle = 'Jane';
        $needle2 = 'Anyway street';
        $address = Address::factory()->make([
            'street' => $needle2,
        ]);

        $customer = Customer::first();

        $response = $this->putJson(route('customers.update', $customer), [
            ...$customer->toArray(),
            'first_name' => $needle,
            'address' => $address->toArray(),
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('customers', [
            'first_name' => $needle,
            'last_name' => $customer->last_name,
            'email' => $customer->email,
        ]);

        $this->assertDatabaseMissing('customers', [
            'first_name' => $customer->first_name,
            'last_name' => $customer->last_name,
            'email' => $customer->email,
        ]);

        $this->assertDatabaseHas('addresses', [
            'street' => $needle2,
            'city' => $address->city,
            'state' => $address->state,
            'country' => $address->country,
            'postal_code' => $address->postal_code,
        ]);
    }

    public function test_destroy()
    {
        Sanctum::actingAs($this->user);

        $customer = Customer::first();

        $response = $this->deleteJson(route('customers.destroy', $customer));

        $response->assertStatus(200);

        $this->assertDatabaseMissing('customers', [
            'first_name' => $customer->first_name,
            'last_name' => $customer->last_name,
            'email' => $customer->email,
            'deleted_at' => null,
        ]);
    }

    public function test_search()
    {
        Sanctum::actingAs($this->user);

        $search = Customer::first()->first_name;

        $response = $this->getJson(route('customers.index', ['search' => $search]));

        $response->assertStatus(200);

        $response->assertJsonFragment(['first_name' => $search]);
    }

    public function test_pagination()
    {
        Sanctum::actingAs($this->user);

        $response = $this->getJson(route('customers.index', ['page' => 1, 'per_page' => 5]));

        $response->assertStatus(200);
        $response->assertJsonCount(5, 'data');
    }
}
