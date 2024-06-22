<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'show_id' => 'required|exists:shows,id',

            'customer' => 'nullable|array',
            'customer.email' => 'required_with:customer|email',
            'customer.first_name' => 'required_with:customer|string',
            'customer.last_name' => 'required_with:customer|string',
            'customer.street' => 'required_with:customer|string',
            'customer.street2' => 'nullable|string',
            'customer.city' => 'required_with:customer|string',
            'customer.postal_code' => 'required_with:customer|string',
            'customer.state' => 'required_with:customer|string',
            'customer.country' => 'required_with:customer|string',
            'customer.phone' => 'nullable|string',

            'products' => 'required|array|min:1',
            'products.*.id' => 'required|exists:products,id',
            'products.*.amount' => 'required|integer|min:1',
            'products.*.price' => 'nullable|numeric|min:0',

            'redirect_url' => 'required|url',

            // 'coupons' => 'array',
            // 'coupons.*' => 'string|exists:coupons,code',

            // 'checks.newsletter' => 'required|boolean',

            'tos' => 'required|boolean|accepted',

            'description' => 'nullable|string',
        ];
    }
}
