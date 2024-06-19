<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreatePaymentLinkRequest;
use App\Http\Requests\StoreOrderRequest;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
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
    public function store(StoreOrderRequest $request)
    {
        $show = Show::findOrFail($request->input('show_id'));

        $customer = $request->input('customer');

        if ($customer) {
            $customerData = $customer;
            $customer = Customer::firstOrCreate([
                'first_name' => $customerData['first_name'],
                'last_name' => $customerData['last_name'],
                'email' => $customerData['email'],
            ]);

            $customer->phone = $customerData['phone'] ?? null;
            $customer->save();

            $address = $customer->address;

            $addressData = [
                'street' => $customerData['street'],
                'street2' => $customerData['street2'] ?? null,
                'city' => $customerData['city'],
                'postal_code' => $customerData['postal_code'],
                'province' => $customerData['province'],
            ];

            if ($customer->address()->exists()) {
                $customer->address->update($addressData);
            } else {
                $customer->address()->create($addressData);
            }
        }

        $order = $show->orders()->create([
            'customer_id' => $customer->id ?? null,
            'show_id' => $show->id,
            'description' => $request->input('description'),
            'order_number' => Order::GenerateOrderNumber(),
            'service_fee' => $show->event->service_fee,
        ]);

        $products = $request->input('products');

        foreach ($products as $product) {
            $order->products()->attach(
                $product['id'],
                [
                    'amount' => $product['amount'],
                    'price' => $product['price'] ?? Product::find($product['id'])->price,
                ]
            );
        }

        try {
            $total = $order->totalFromProducts();

            $payment_url = $order->createPayment($total, $request->input('redirect_url'));

            $order->update([
                'total' => $total,
            ]);
        } catch (\Exception $e) {
            $order->delete();
            throw $e;
        }

        return response()->json([
            'order' => $order,
            'payment_url' => $payment_url,
        ]);
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
    public function update(Request $request, Order $order)
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
    public function createPaymentLink(CreatePaymentLinkRequest $request, Order $order)
    {
        $payment_url = $order->createPayment($order->totalFromProducts(), $request->redirect_url);

        return response()->json([
            'payment_url' => $payment_url,
        ]);
    }
}
