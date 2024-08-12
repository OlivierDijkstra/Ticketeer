<?php

namespace App\Http\Controllers;

use App\Http\Requests\TicketsNotificationRequest;
use App\Models\Order;
use App\Notifications\TicketsNotification;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class NotificationController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('auth:sanctum'),
        ];
    }

    /**
     * Display a listing of the resource.
     */
    public function notifyTickets(TicketsNotificationRequest $request)
    {
        $order = Order::find($request->order_id);

        if (! $order->customer) {
            return response()->json(['message' => 'Customer not found'], 404);
        }

        $order->customer->notify(new TicketsNotification($order));

        return response()->json(['message' => 'Tickets notification sent'], 200);
    }
}
