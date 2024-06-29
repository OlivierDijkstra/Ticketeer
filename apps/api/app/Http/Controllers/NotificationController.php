<?php

namespace App\Http\Controllers;

use App\Http\Requests\TicketsNotificationRequest;
use App\Models\Order;
use App\Notifications\TicketsNotification;

class NotificationController extends Controller
{
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
