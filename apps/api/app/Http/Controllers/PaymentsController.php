<?php

namespace App\Http\Controllers;

use App\Models\Order;

class PaymentsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Order $order)
    {
        return $order->payments()
            ->orderBy('created_at', 'desc')
            ->paginate(6);
    }
}
