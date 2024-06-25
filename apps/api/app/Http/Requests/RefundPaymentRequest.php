<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RefundPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'amount' => ['required', 'numeric', 'min:0', 'max:'.$this->payment->amount - $this->payment->amount_refunded],
        ];
    }
}
