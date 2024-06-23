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

class HandlePaymentPartiallyRefundedJob implements ShouldQueue
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

        ray('Current refunded amount', $current_refunded_amount);

        $this->payment->update([
            'status' => 'partially_refunded',
            'amount_refunded' => $this->mollie->amountRefunded->value,
            'refunded_at' => now(),
        ]);

        ray('Updated payment');

        $order = $this->payment->order;

        $order->update([
            'status' => 'partially_refunded',
        ]);

        ray('Updated order');

        $event_slug = $order->event()->select('slug')->first();
        ray('Event slug', $event_slug);

        $stats = (float) $this->mollie->amountRefunded->value - $current_refunded_amount;
        ray('Stats', $stats);
        StatsWriter::for(RevenueStats::class, ['event' => $event_slug])->decrease($stats);
    }
}
