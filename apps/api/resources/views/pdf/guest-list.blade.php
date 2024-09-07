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
            <h1 class="text-2xl font-bold">Guest List</h1>
            <p class="text-xl text-muted-foreground">{{ $show->start->format('F j, Y') }}</p>
        </div>

        <div class="mb-6 border-b pb-4">
            <h2 class="text-xl font-semibold mb-2">{{ $event->name }}</h2>
            <p class="text-muted-foreground">
                <span class="font-semibold">Show Date:</span> {{ $show->start->format('F j, Y, g:i A') }}
            </p>
            @if($show->address)
                <p class="text-muted-foreground">
                    <span class="font-semibold">Venue:</span> {{ $show->address->street }}, {{ $show->address->city }}
                </p>
            @endif
        </div>

        <div class="mb-4">
            <h2 class="text-xl font-semibold mb-4">Guest List</h2>
            <div class="bg-card rounded-lg overflow-hidden">
                <table class="w-full">
                    <thead class="bg-muted">
                        <tr>
                            <th class="p-2 text-left">Guest Name</th>
                            <th class="p-2 text-left">Ticket Type</th>
                            <th class="p-2 text-left">Order Number</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($tickets as $ticket)
                            <tr class="border-t border-border">
                                <td class="p-2">{{ $ticket->order->customer->first_name }} {{ $ticket->order->customer->last_name }}</td>
                                <td class="p-2">{{ $ticket->product->name }}</td>
                                <td class="p-2">{{ $ticket->order->order_number }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>

        <div class="mt-auto text-sm text-muted-foreground">
            <p>Total Guests: {{ $tickets->count() }}</p>
            <p>Generated on: {{ now()->format('F j, Y, g:i A') }}</p>
        </div>
    </div>
@endsection