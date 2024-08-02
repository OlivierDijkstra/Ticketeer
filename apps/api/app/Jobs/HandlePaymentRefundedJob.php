<?php

namespace App\Jobs;

use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Mollie\Api\Resources\Payment as MolliePayment;

class HandlePaymentRefundedJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected Payment $payment;

    protected MolliePayment $mollie;

    public function __construct(Payment $payment, MolliePayment $mollie)
    {
        $this->payment = $payment;
        $this->mollie = $mollie;
    }

    public function handle(): void
    {
        $current_refunded_amount = $this->payment->amount_refunded;

        $this->payment->update([
            'status' => 'refunded',
            'amount_refunded' => $this->mollie->amountRefunded->value,
            'refunded_at' => now(),
        ]);

        $order = $this->payment->order;

        $order->update([
            'status' => 'refunded',
        ]);
    }
}
