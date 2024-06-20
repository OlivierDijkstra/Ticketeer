<?php

namespace App\Actions;

use App\Models\Order;
use Illuminate\Support\Facades\URL;
use Mollie\Laravel\Facades\Mollie;

class CreatePaymentAction
{
    public function handle(Order $order, float $total, string $redirectUrl): string
    {
        $payment = Mollie::api()->payments->create([
            'amount' => [
                'currency' => config('app.currency'),
                'value' => number_format($total, 2, '.', ''),
            ],
            'description' => $order->description ?? $order->order_number,
            'redirectUrl' => URL::to($redirectUrl, [
                'order_id' => $order->order_number,
                'show_id' => $order->show_id,
            ]),
            'webhookUrl' => 'https://1d6b-143-178-232-105.ngrok-free.app/webhooks/mollie',
            'metadata' => [
                'order_id' => $order->id,
            ],
        ]);

        $payment_url = $payment->getCheckoutUrl();

        $order->payments()->create([
            'transaction_id' => $payment->id,
            'status' => $payment->status,
            'amount' => $total,
            'payment_url' => $payment_url,
        ]);

        return $payment_url;
    }
}
