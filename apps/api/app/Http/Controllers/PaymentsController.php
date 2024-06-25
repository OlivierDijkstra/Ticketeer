<?php

namespace App\Http\Controllers;

use App\Http\Requests\RefundPaymentRequest;
use App\Jobs\CreateRefundJob;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Routing\Controllers\Middleware;

class PaymentsController extends Controller
{
    public static function middleware(): array
    {
        return [
            new Middleware('auth:sanctum'),
        ];
    }

    public function index(Order $order)
    {
        return $order->payments()
            ->orderBy('created_at', 'desc')
            ->paginate(6);
    }

    public function refund(RefundPaymentRequest $request, Payment $payment)
    {
        CreateRefundJob::dispatch($payment, $request->amount);

        return response()->json(['message' => 'Payment refunded']);
    }
}
