<?php

namespace App\Jobs;

use App\Models\Payment;
use App\Notifications\TicketsNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class GenerateTicketsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected Payment $payment;

    public function __construct(Payment $payment)
    {
        $this->payment = $payment;
    }

    public function handle(): void
    {
        $order = $this->payment->order;

        foreach ($order->products as $product) {
            // Skip upsell products
            if ($product->is_upsell) {
                continue;
            }

            for ($i = 0; $i < $product->pivot->amount; $i++) {
                $order->tickets()->create([
                    'product_id' => $product->id,
                    'unique_code' => $this->generateUniqueCode(),
                ]);
            }
        }

        // If the user has a customer send a notification
        if ($order->customer) {
            $order->customer->notify(new TicketsNotification($order));
        }
    }

    protected function generateUniqueCode(): string
    {
        return substr(md5(uniqid(mt_rand(), true)), 0, 10);
    }
}
