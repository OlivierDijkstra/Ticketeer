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

    @foreach ($order->tickets as $ticket)
        <div class="page flex flex-col">
            <div class="mb-4 flex justify-between">
                {!! $ticket->qrCodeSvg() !!}

                <div class="text-sm text-right">
                    <p class="font-semibold mb-2">Order #{{ $order->order_number }}</p>
                    <p class="text-muted-foreground">Ordered on: {{ $order->created_at->format('F j, Y') }}</p>
                </div>
            </div>

            <div class="rounded-lg bg-card">
                <div class="rounded-lg bg-muted p-4">
                    <div class="flex items-start justify-between gap-2">
                        <div class="w-1/2 space-y-2">
                            <p class="flex items-center gap-1 font-semibold">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round" class="lucide lucide-ticket">
                                    <path
                                        d="M3 7v2a3 3 0 1 1 0 6v2c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-2a3 3 0 1 1 0-6V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2Z" />
                                    <path d="M13 5v2" />
                                    <path d="M13 17v2" />
                                    <path d="M13 11v2" />
                                </svg>
                                <span>{{ $ticket->product->name }}</span>
                            </p>

                            <p class="line-clamp-5 text-sm text-muted-foreground">
                                {{ $ticket->product->description }}
                            </p>
                        </div>

                        <div class="h-20 w-px bg-border"></div>

                        <div>
                            <p class="text-right text-sm font-semibold uppercase tracking-wider">
                                {{ $order->show->event->name }}
                            </p>
                            <p class="text-right text-sm text-muted-foreground">
                                {{ $order->show->start->format('F j, Y - g:i A') }}
                            </p>

                            <div class="mt-2 flex items-center gap-2 rounded-md bg-background p-2">
                                <x-lucide-map-pin class="size-4" />
                                <div class="text-sm font-semibold">
                                    <p>
                                        {{ $order->show->address->city }}, {{ $order->show->address->country }}
                                    </p>
                                    <p class="font-normal text-muted-foreground">
                                        {{ $order->show->address->street }} {{ $order->show->address->street2 }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="mt-4 p-4 bg-muted rounded-lg">
                <h3 class="font-semibold mb-2 uppercase">{{ $order->event->name }}</h3>
                <p class="text-muted-foreground text-sm max-h-72 overflow-hidden trunacte">{{ $order->event->description }}</p>
            </div>

            <div class="mt-auto flex justify-between">
                <div class="text-sm">
                    <p class="font-semibold mb-2">Important Information</p>

                    <ul class="text-muted-foreground list-disc pl-5 space-y-1">
                        <li>This ticket is valid for one person only</li>
                        <li>Not valid after the event date</li>
                        <li>Please arrive at least 30 minutes before the event start time</li>
                        <li>Subject to the terms and conditions of the event organizer</li>
                        <li>The QR code at the top and bottom of the ticket are the same</li>
                    </ul>
                </div>

                {!! $ticket->qrCodeSvg() !!}
            </div>
        </div>
    @endforeach
@endsection
