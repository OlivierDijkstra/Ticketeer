@extends('layouts.app')

@section('content')
    <style>
        @page {
            size: A4;
            margin: 0;
        }

        .page {
            width: 210mm;
            height: 297mm;
            padding: 20mm;
            page-break-after: always;
        }
    </style>

    <div class="page flex flex-col break-inside-avoid">
        <div class="mb-8 flex justify-between items-center">
            <h1 class="text-2xl font-bold">Monthly Report</h1>
            <p class="text-xl text-muted-foreground">{{ $report->month->format('F Y') }}</p>
        </div>

        <div class="grid grid-cols-2 gap-2 mb-6 border-b pb-4">
            <div>
                <h2 class="mb-1">Total Revenue</h2>
                <p class="text-lg font-bold">€{{ number_format($report->total_revenue, 2) }}</p>
            </div>

            <div>
                <h2 class="mb-1">Total Orders</h2>
                <p class="text-lg font-bold">{{ $report->total_orders }}</p>
            </div>

            <div>
                <h2 class="mb-1">New Customers</h2>
                <p class="text-lg font-bold">{{ $report->new_customers }}</p>
            </div>

            <div>
                <h2 class="mb-1">Tickets Sold</h2>
                <p class="text-lg font-bold">{{ $report->tickets_sold }}</p>
            </div>

            <div>
                <h2 class="mb-1">Customer Acquisition Rate</h2>
                <p class="text-lg font-bold">{{ number_format($report->customer_acquisition_rate * 100, 2) }}%</p>
            </div>
            <div>
                <h2 class="mb-1">Average Order Value</h2>
                <p class="text-lg font-bold">€{{ number_format($report->average_order_value, 2) }}</p>
            </div>
        </div>

        <div class="mb-4 pb-4 border-b">
            <h2 class="text-xl font-semibold mb-4">Top Products</h2>
            <div class="bg-card rounded-lg overflow-hidden">
                <table class="w-full">
                    <thead class="bg-muted">
                        <tr>
                            <th class="p-2 text-left">Product</th>
                            <th class="p-2 text-right">Base Price</th>
                            <th class="p-2 text-right">Quantity</th>
                            <th class="p-2 text-right">Revenue</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($report->top_products as $product)
                            <tr>
                                <td class="p-2">{{ $product['name'] }}</td>
                                <td class="p-2 text-right">€{{ number_format($product['base_price'], 2) }}</td>
                                <td class="p-2 text-right">{{ $product['quantity'] }}</td>
                                <td class="p-2 text-right">€{{ number_format($product['revenue'], 2) }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>

        <div class="mb-4 pb-4 border-b">
            <h2 class="text-xl font-semibold mb-4">Revenue by Event</h2>
            <div class="bg-card rounded-lg overflow-hidden">
                <table class="w-full">
                    <thead class="bg-muted">
                        <tr>
                            <th class="p-2 text-left">Event</th>
                            <th class="p-2 text-right">Revenue</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($report->revenue_by_event as $event)
                            <tr>
                                <td class="p-2">{{ $event['name'] }}</td>
                                <td class="p-2 text-right">€{{ number_format($event['revenue'], 2) }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <div class="page break-inside-auto">
        <h2 class="text-2xl font-semibold mb-6">Show Product Sales</h2>
        @foreach ($report->show_product_sales as $show)
            <div class="mb-4 pb-4 border-b">
                <h3 class="mb-2 text-xl font-semibold">{{ $show['show_name'] }}</h3>
                <table class="w-full">
                    <thead class="bg-muted">
                        <tr>
                            <th class="p-2 text-left">Product</th>
                            <th class="p-2 text-right">Base Price</th>
                            <th class="p-2 text-right">Quantity</th>
                            <th class="p-2 text-right">Revenue</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($show['products'] as $product)
                            <tr>
                                <td class="p-2">{{ $product['name'] }}</td>
                                <td class="p-2 text-right">€{{ number_format($product['base_price'], 2) }}</td>
                                <td class="p-2 text-right">{{ $product['quantity'] }}</td>
                                <td class="p-2 text-right">€{{ number_format($product['revenue'], 2) }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        @endforeach
    </div>
@endsection