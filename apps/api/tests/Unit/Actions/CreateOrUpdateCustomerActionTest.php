<?php

namespace Tests\Unit\Actions;

use App\Actions\CreateOrUpdateCustomerAction;
use App\Models\Customer;
use Tests\TestCase;

class CreateOrUpdateCustomerActionTest extends TestCase
{
    public function test_create_or_update_customer()
    {
        $customerData = [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'phone' => '1234567890',
            'street' => '123 Main St',
            'city' => 'Springfield',
            'postal_code' => '62701',
            'state' => 'IL',
        ];

        $action = new CreateOrUpdateCustomerAction();
        $customer = $action->handle($customerData);

        $this->assertInstanceOf(Customer::class, $customer);
        $this->assertDatabaseHas('customers', ['email' => 'john@example.com']);
    }
}
