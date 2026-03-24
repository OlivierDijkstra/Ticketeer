<?php

namespace App\Jobs;

use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
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
        [$payment, $shouldRestoreStock] = DB::transaction(function () {
            $payment = Payment::query()
                ->lockForUpdate()
                ->findOrFail($this->payment->id);

            $hasProcessedRefund = bccomp((string) ($payment->amount_refunded ?? '0.00'), '0.00', 2) === 1
                || in_array($payment->status, ['partially_refunded', 'refunded'], true);

            $payment->update([
                'status' => 'refunded',
                'amount_refunded' => $this->mollie->amountRefunded->value,
                'refunded_at' => now(),
            ]);

            $payment->order()->update([
                'status' => 'refunded',
            ]);

            return [$payment->fresh(), ! $hasProcessedRefund];
        });

        if ($shouldRestoreStock) {
            RestoreProductStockJob::dispatch($payment);
        }
    }
}
