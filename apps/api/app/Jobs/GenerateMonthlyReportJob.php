<?php

namespace App\Jobs;

use App\Models\MonthlyReport;
use App\Models\Customer;
use App\Models\Payment;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;

class GenerateMonthlyReportJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected Carbon $startDate;
    protected Carbon $endDate;

    public function __construct(?Carbon $date = null)
    {
        $this->startDate = $date ? $date->startOfMonth()->startOfDay() : Carbon::now()->subMonth()->startOfMonth()->startOfDay();
        $this->endDate = $this->startDate->copy()->endOfMonth()->endOfDay();
    }

    public function handle(): void
    {
        $report = MonthlyReport::updateOrCreate(
            ['month' => $this->startDate->format('Y-m-d')],
            [
                'total_revenue' => $this->calculateTotalRevenue(),
                'total_orders' => $this->calculateTotalOrders(),
                'new_customers' => $this->calculateNewCustomers(),
                'tickets_sold' => $this->calculateTicketsSold(),
                'top_products' => $this->calculateTopProducts(),
                'revenue_by_event' => $this->calculateRevenueByEvent(),
                'customer_acquisition_rate' => $this->calculateCustomerAcquisitionRate(),
                'average_order_value' => $this->calculateAverageOrderValue(),
                'show_product_sales' => $this->calculateShowProductSales(),
            ]
        );

        $report->generatePDF();
    }

    protected function calculateTotalRevenue(): string
    {
        $totalPaid = Payment::whereBetween('paid_at', [$this->startDate, $this->endDate])
            ->sum('amount');

        $totalRefunded = Payment::whereBetween('refunded_at', [$this->startDate, $this->endDate])
            ->sum('amount_refunded');

        return bcsub((string)$totalPaid, (string)$totalRefunded, 2);
    }

    protected function calculateTotalOrders(): int
    {
        return Payment::whereBetween('paid_at', [$this->startDate, $this->endDate])
            ->distinct('order_id')
            ->count();
    }

    protected function calculateNewCustomers(): int
    {
        return Customer::whereBetween('created_at', [$this->startDate, $this->endDate])
            ->count();
    }

    protected function calculateTicketsSold(): int
    {
        return DB::table('order_product')
            ->join('orders', 'orders.id', '=', 'order_product.order_id')
            ->join('products', 'products.id', '=', 'order_product.product_id')
            ->join('payments', 'payments.order_id', '=', 'orders.id')
            ->whereBetween('payments.paid_at', [$this->startDate, $this->endDate])
            ->where('products.is_upsell', false)
            ->sum('order_product.amount');
    }

    protected function calculateTopProducts(): array
    {
        return DB::table('order_product')
        ->join('orders', 'orders.id', '=', 'order_product.order_id')
        ->join('products', 'products.id', '=', 'order_product.product_id')
        ->join('payments', 'payments.order_id', '=', 'orders.id')
        ->whereBetween('payments.paid_at', [$this->startDate, $this->endDate])
            ->select(
                'products.id as product_id',
                'products.name',
                'products.price as base_price',
                DB::raw('SUM(order_product.amount) as quantity'),
                DB::raw('SUM(order_product.amount * order_product.price) - COALESCE(SUM(CASE WHEN payments.refunded_at BETWEEN ? AND ? THEN (order_product.amount * order_product.price / orders.total) * payments.amount_refunded ELSE 0 END), 0) as revenue')
            )
            ->groupBy('products.id', 'products.name', 'products.price')
            ->orderByDesc('revenue')
            ->limit(5)
            ->setBindings(array_merge(
                [$this->startDate, $this->endDate],
                [$this->startDate, $this->endDate]
            ))
            ->get()
            ->toArray();
    }

    protected function calculateRevenueByEvent(): array
    {
        return DB::table('orders')
        ->join('shows', 'shows.id', '=', 'orders.show_id')
        ->join('events', 'events.id', '=', 'shows.event_id')
        ->join('payments', 'payments.order_id', '=', 'orders.id')
        ->whereBetween('payments.paid_at', [$this->startDate, $this->endDate])
            ->select(
                'events.id as event_id',
                'events.name',
                DB::raw('SUM(payments.amount) - COALESCE(SUM(CASE WHEN payments.refunded_at BETWEEN ? AND ? THEN payments.amount_refunded ELSE 0 END), 0) as revenue')
            )
            ->groupBy('events.id', 'events.name')
            ->orderByDesc('revenue')
            ->setBindings(array_merge(
                [$this->startDate, $this->endDate],
                [$this->startDate, $this->endDate]
            ))
            ->get()
            ->toArray();
    }

    protected function calculateCustomerAcquisitionRate(): float
    {
        $newCustomers = $this->calculateNewCustomers();
        $totalCustomers = Customer::where('created_at', '<', $this->endDate)->count();

        return $totalCustomers > 0 ? $newCustomers / $totalCustomers : 0;
    }

    protected function calculateAverageOrderValue(): float
    {
        $totalRevenue = $this->calculateTotalRevenue();
        $totalOrders = $this->calculateTotalOrders();

        return $totalOrders > 0 ? $totalRevenue / $totalOrders : 0;
    }

    protected function calculateShowProductSales(): array
    {
        $startDate = $this->startDate;
        $endDate = $this->endDate;

        $shows = DB::table('shows')
        ->join('events', 'events.id', '=', 'shows.event_id')
        ->join('orders', 'orders.show_id', '=', 'shows.id')
        ->join('payments', 'payments.order_id', '=', 'orders.id')
        ->whereBetween('payments.paid_at', [$startDate, $endDate])
            ->select('shows.id as show_id', 'events.name as show_name')
            ->groupBy('shows.id', 'events.name')
            ->orderByRaw('COUNT(DISTINCT orders.id) DESC')
            ->limit(3)
            ->get();

        $result = [];
        foreach ($shows as $show) {
            $products = DB::table('order_product')
            ->join('orders', 'orders.id', '=', 'order_product.order_id')
            ->join('products', 'products.id', '=', 'order_product.product_id')
            ->join('payments', 'payments.order_id', '=', 'orders.id')
            ->where('orders.show_id', $show->show_id)
                ->whereBetween('payments.paid_at', [$startDate, $endDate])
                ->select(
                    'products.id as product_id',
                    'products.name',
                    'products.price as base_price',
                    DB::raw('SUM(order_product.amount) as quantity'),
                    DB::raw('SUM(order_product.amount * order_product.price) as total_revenue')
                )
                ->groupBy('products.id', 'products.name', 'products.price')
                ->orderByDesc('total_revenue')
                ->limit(3)
                ->get()
                ->toArray();

            $showProducts = [];
            foreach ($products as $product) {
                $showProducts[] = [
                    'product_id' => $product->product_id,
                    'name' => $product->name,
                    'base_price' => $product->base_price,
                    'quantity' => $product->quantity,
                    'revenue' => $product->total_revenue,
                ];
            }

            $result[] = [
                'show_id' => $show->show_id,
                'show_name' => $show->show_name,
                'products' => $showProducts,
            ];
        }

        return $result;
    }
}