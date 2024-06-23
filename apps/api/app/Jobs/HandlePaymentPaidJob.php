<?php

namespace App\Jobs;

use App\Models\Payment;
use App\Stats\RevenueStats;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use \Mollie\Api\Resources\Payment as MolliePayment;
use Spatie\Stats\StatsWriter;

class HandlePaymentPaidJob implements ShouldQueue
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
        $this->payment->update([
            'status' => 'paid',
            'paid_at' => now(),
            'payment_method' => $this->mollie->method,
        ]);

        // Update the order status if the total of the paid payments is equal to the order total
        $order = $this->payment->order;

        if ($order->payments->sum('amount') >= $order->total) {
            $order->update([
                'status' => 'paid',
                'paid_at' => now(),
            ]);
        }

        $event_slug = $order->event()->select('slug')->first();

        $amount = (float) $this->payment->amount;
        StatsWriter::for(RevenueStats::class, ['event' => $event_slug])->increase($amount);
    }
}
