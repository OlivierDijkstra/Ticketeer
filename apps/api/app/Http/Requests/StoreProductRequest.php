<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric',
            'vat' => 'required|numeric',
            'is_upsell' => 'required|boolean',
            'show_id' => 'nullable|exists:shows,id',
            'enabled' => 'nullable|boolean|required_with:show_id',
            'amount' => 'nullable|numeric|required_with:show_id',
        ];
    }
}
