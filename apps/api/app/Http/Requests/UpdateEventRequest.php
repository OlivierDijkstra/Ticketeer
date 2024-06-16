<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEventRequest extends FormRequest
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
            'name' => 'nullable|string|max:255',
            'slug' => 'nullable|string|max:255',
            'service_price' => 'nullable|numeric',
            'description' => 'nullable|string',
            'enabled' => 'nullable|boolean',
            'featured' => 'nullable|boolean',
        ];
    }
}
