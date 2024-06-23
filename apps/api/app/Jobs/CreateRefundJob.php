<?php

namespace App\Jobs;

use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Mollie\Laravel\Facades\Mollie;
use Mollie\Api\Resources\Refund;

class CreateRefundJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $payment;

    public function __construct(Payment $payment)
    {
        $this->payment = $payment;
    }

    public function handle(): void
    {
        $payment = Mollie::api()->payments->get($this->payment->transaction_id);

        $config = [
            'amount' => [
                'currency' => config('app.currency'),
                'value' => $this->payment->amount,
            ],
        ];

        $payment->refund($config);

        $this->payment->update(['status' => 'pending_refund']);
    }
}
