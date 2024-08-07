<?php

namespace App\Jobs;

use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Mollie\Api\Resources\Payment as MolliePayment;

class HandlePaymentPaidJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected Payment $payment;

    protected ?MolliePayment $mollie;

    public function __construct(Payment $payment, ?MolliePayment $mollie = null)
    {
        $this->payment = $payment;
        $this->mollie = $mollie;
    }

    public function handle(): void
    {
        $this->payment->update([
            'status' => 'paid',
            'paid_at' => now(),
            'payment_method' => $this->mollie?->method ?? null,
        ]);

        $order = $this->payment->order;

        if ($order->payments->sum('amount') >= $order->total) {
            $order->update([
                'status' => 'paid',
                'paid_at' => now(),
            ]);
        }
    }
}
