<?php

namespace App\Http\Controllers;

use App\Jobs\GenerateTicketsJob;
use App\Jobs\HandlePaymentPaidJob;
use App\Jobs\HandlePaymentPartiallyRefundedJob;
use App\Jobs\HandlePaymentRefundedJob;
use App\Jobs\RestoreProductStockJob;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Bus;
use Mollie\Laravel\Facades\Mollie;

class MollieWebhookController extends Controller
{
    public function __invoke(Request $request)
    {
        if (! $request->has('id')) {
            return;
        }

        $id = $request->get('id');

        $mollie = Mollie::api()->payments->get($id);
        $payment = Payment::where('transaction_id', $id)->firstOrFail();

        switch ($mollie->status) {
            case 'paid':
                if ($payment) {
                    $amountRefunded = $mollie->amountRefunded->value;

                    //  if the amount is higher than 0 but not equal to the amount of the payment, it's partially refunded
                    if ($amountRefunded > 0 && $amountRefunded !== $mollie->amount->value) {
                        HandlePaymentPartiallyRefundedJob::dispatch($payment, $mollie);
                        break;
                    }

                    // if the amountRefunded is equal to the amount of the payment, it's fully refunded
                    if ($amountRefunded === $mollie->amount->value) {
                        Bus::chain([
                            new HandlePaymentRefundedJob($payment, $mollie),
                            new RestoreProductStockJob($payment),
                        ])->dispatch();

                        break;
                    }

                    if ($payment->status === 'paid') {
                        break;
                    }

                    Bus::chain([
                        new HandlePaymentPaidJob($payment, $mollie),
                        new GenerateTicketsJob($payment),
                    ])->dispatch();
                }
                break;
            case 'failed':
                if ($payment) {
                    RestoreProductStockJob::dispatch($payment, true);
                }
                break;
            case 'cancelled':
                if ($payment) {
                    RestoreProductStockJob::dispatch($payment, true);
                }
                break;
            case 'expired':
                if ($payment) {
                    RestoreProductStockJob::dispatch($payment, true);
                }
                break;
            default:
                //
                break;
        }

        return response()->json([
            'message' => 'Payment updated.',
        ], 200);
    }
}
