<?php

namespace App\Http\Controllers;

use App\Http\Requests\MonthlyReportNotificationRequest;
use App\Http\Requests\TicketsNotificationRequest;
use App\Models\MonthlyReport;
use App\Models\Order;
use App\Notifications\MonthlyReportNotification;
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

    public function notifyTickets(TicketsNotificationRequest $request)
    {
        $order = Order::find($request->order_id);

        if (! $order->customer) {
            return response()->json(['message' => 'Customer not found'], 404);
        }

        $order->customer->notify(new TicketsNotification($order));

        return response()->json(['message' => 'Tickets notification sent'], 200);
    }

    public function notifyMonthlyReport(MonthlyReportNotificationRequest $request)
    {
        $user = request()->user();

        $report = MonthlyReport::find($request->report_id);

        $user->notify(new MonthlyReportNotification($report));

        return response()->json(['message' => 'Monthly report notification sent'], 200);
    }
}
