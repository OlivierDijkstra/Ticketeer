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
            // 'customer.email' => 'required|email:rfc,dns',
            'customer.email' => 'required|email',
            'customer.first_name' => 'required|string',
            'customer.last_name' => 'required|string',
            'customer.street' => 'required|string',
            'customer.street2' => 'nullable|string',
            'customer.city' => 'required|string',
            'customer.postal_code' => 'required|string',
            'customer.province' => 'required|string',
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
