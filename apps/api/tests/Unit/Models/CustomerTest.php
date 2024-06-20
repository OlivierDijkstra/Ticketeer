<?php

namespace Tests\Unit\Models;

use App\Models\Address;
use App\Models\Customer;
use Tests\TestCase;

class CustomerTest extends TestCase
{
    public function test_customer_has_address()
    {
        $customer = Customer::factory()->create();
        $this->assertInstanceOf(Address::class, $customer->address);
    }

    public function test_address_created_on_customer_created()
    {
        $customer = Customer::factory()->create();
        $this->assertDatabaseHas('addresses', ['addressable_id' => $customer->id, 'addressable_type' => Customer::class]);
    }

    public function test_address_deleted_on_customer_deleted()
    {
        $customer = Customer::factory()->create();
        $customer->delete();
        $this->assertDatabaseMissing('addresses', ['addressable_id' => $customer->id, 'addressable_type' => Customer::class]);
    }
}
