<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Payment;
use App\Stats\RevenueStats;
use Illuminate\Http\Request;
use Mollie\Laravel\Facades\Mollie;
use Spatie\Stats\StatsWriter;

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

        // Todo handle refunds

        switch ($mollie->status) {
            case 'paid':
                if ($payment) {
                    $payment->update([
                        'status' => 'paid',
                        'paid_at' => now(),
                        'payment_method' => $mollie->method,
                    ]);

                    // Update the order status if the total of the paid payments is equal to the order total
                    $order = $payment->order;

                    if ($order->payments->sum('amount') >= $order->total) {
                        $order->update([
                            'status' => 'paid',
                            'paid_at' => now(),
                        ]);
                    }

                    $event = $order->event;

                    // parse amount to a number
                    $amount = (int) $mollie->amount->value;

                    StatsWriter::for(RevenueStats::class, ['event' => $event->slug])->increase($amount);
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
