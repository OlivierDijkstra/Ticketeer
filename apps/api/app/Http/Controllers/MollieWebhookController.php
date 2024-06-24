<?php

namespace App\Http\Controllers;

use App\Jobs\HandlePaymentPaidJob;
use App\Jobs\HandlePaymentPartiallyRefundedJob;
use App\Jobs\HandlePaymentRefundedJob;
use App\Models\Payment;
use Illuminate\Http\Request;
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
                    // Determine the payments amountRefunded
                    $amountRefunded = $mollie->amountRefunded->value;

                    // if the amount is higher than 0 but not equal to the amount of the payment, it's partially refunded
                    if ($amountRefunded > 0 && $amountRefunded !== $mollie->amount->value) {
                        HandlePaymentPartiallyRefundedJob::dispatch($payment, $mollie);
                        break;
                    }

                    // if the amountRefunded is equal to the amount of the payment, it's fully refunded
                    if ($amountRefunded === $mollie->amount->value) {
                        HandlePaymentRefundedJob::dispatch($payment, $mollie);
                        break;
                    }

                    if ($payment->status === 'paid') {
                        break;
                    }

                    HandlePaymentPaidJob::dispatch($payment, $mollie);
                }
                break;
            case 'failed':
                if ($payment) {
                    $payment->update([
                        'status' => 'failed',
                    ]);
                }
                break;
            case 'canceled':
                if ($payment) {
                    $payment->delete();
                }
                break;
            case 'expired':
                // Delete the order
                if ($payment) {
                    $payment->delete();
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
