<?php

namespace App\Actions;

use App\Models\Customer;

class CreateOrUpdateCustomerAction
{
    public function handle(array $customerData): Customer
    {
        $customer = Customer::firstOrCreate([
            'first_name' => $customerData['first_name'],
            'last_name' => $customerData['last_name'],
            'email' => $customerData['email'],
        ]);

        $customer->phone = $customerData['phone'] ?? null;
        $customer->save();

        $addressData = [
            'street' => $customerData['street'],
            'street2' => $customerData['street2'] ?? null,
            'city' => $customerData['city'],
            'postal_code' => $customerData['postal_code'],
            'state' => $customerData['state'],
        ];

        if ($customer->address()->exists()) {
            $customer->address->update($addressData);
        } else {
            $customer->address()->create($addressData);
        }

        return $customer;
    }
}
