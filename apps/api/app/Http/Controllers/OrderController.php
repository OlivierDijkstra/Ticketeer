<?php

namespace App\Http\Controllers;

use App\Actions\AttachProductsToOrderAction;
use App\Actions\CreatePaymentAction;
use App\Actions\RestoreProductStockAction;
use App\Http\Requests\CreatePaymentLinkRequest;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Requests\UpdateOrderRequest;
use App\Jobs\HandleCustomerJob;
use App\Models\Order;
use App\Models\Show;
use App\Traits\HandlesPaginationAndFiltering;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\Middleware;

class OrderController extends Controller
{
    use HandlesPaginationAndFiltering;

    public static function middleware(): array
    {
        return [
            new Middleware('auth:sanctum', except: ['store']),
        ];
    }

    /**
     * Display a listing of the resource.
     *
     * Params
     * - show_id: int
     * - page: int
     * - per_page: int
     * - search: string
     */
    public function index(Request $request)
    {
        $query = Order::query()
            ->orderBy('created_at', 'desc')
            ->with(['event', 'show', 'customer']);

        return $this->searchOrPaginate($request, $query);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreOrderRequest $request, AttachProductsToOrderAction $attachProductsToOrderAction, RestoreProductStockAction $restoreProductStockAction, CreatePaymentAction $createPaymentAction)
    {
        $show = Show::findOrFail($request->input('show_id'));

        $order = $show->orders()->create([
            'show_id' => $show->id,
            'description' => $request->input('description'),
            'order_number' => Order::GenerateOrderNumber(),
            'service_fee' => $show->event->service_fee,
        ]);

        $products = $request->input('products');

        try {
            $decrementedProducts = $attachProductsToOrderAction->handle($order, $products, $show->id);
            $order->update(['total' => $order->totalFromProducts() + $order->service_fee]);
            $paymentUrl = $createPaymentAction->handle($order, $order->total, $request->input('redirect_url'));

            $customerData = $request->input('customer');

            if ($customerData) {
                HandleCustomerJob::dispatch($customerData, $order);
            }
        } catch (\Exception $e) {
            if (! empty($decrementedProducts)) {
                $restoreProductStockAction->handle($decrementedProducts, $show->id);
            }
            $order->delete();
            throw $e;
        }

        return response()->json([
            'order' => $order,
            'payment_url' => $paymentUrl,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Show $show, Order $order)
    {
        return $order;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateOrderRequest $request, Order $order)
    {
        $order->update($request->all());
        return $order;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Order $order)
    {
        $order->delete();

        return $order;
    }

    /**
     * Create a payment link for the order.
     */
    public function createPaymentLink(CreatePaymentLinkRequest $request, Order $order, CreatePaymentAction $createPaymentAction)
    {
        $paymentUrl = $createPaymentAction->handle($order, $order->total, $request->redirect_url);

        return response()->json([
            'payment_url' => $paymentUrl,
        ]);
    }

    public function isPaid(Order $order)
    {
        return response()->json([
            'is_paid' => $order->status === 'paid',
        ]);
    }
}
