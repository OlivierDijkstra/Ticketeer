<?php

namespace App\Jobs;

use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Mollie\Laravel\Facades\Mollie;

class CreateRefundJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $payment;

    protected $amount;

    public function __construct(Payment $payment, $amount)
    {
        $this->payment = $payment;
        $this->amount = $amount;
    }

    public function handle(): void
    {
        $payment = Mollie::api()->payments->get($this->payment->transaction_id);

        $config = [
            'amount' => [
                'currency' => config('app.currency'),
                'value' => number_format($this->amount, 2, '.', ''),
            ],
        ];

        $payment->refund($config);

        $this->payment->update(['status' => 'pending_refund']);
    }
}
