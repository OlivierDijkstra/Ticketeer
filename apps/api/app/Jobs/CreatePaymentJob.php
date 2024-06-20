<?php

namespace App\Jobs;

use App\Models\Order;
use Mollie\Laravel\Facades\Mollie;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\URL;

class CreatePaymentJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $order;
    protected $total;
    protected $redirectUrl;
    private $response;

    public function __construct(Order $order, float $total, string $redirectUrl)
    {
        $this->order = $order;
        $this->total = $total;
        $this->redirectUrl = $redirectUrl;
    }

    public function handle(): void
    {
        $payment = Mollie::api()->payments->create([
            'amount' => [
                'currency' => config('app.currency'),
                'value' => number_format($this->total, 2, '.', ''),
            ],
            'description' => $this->order->description ?? $this->order->order_number,
            'redirectUrl' => URL::to($this->redirectUrl, [
                'order_id' => $this->order->order_number,
                'show_id' => $this->order->show_id,
            ]),
            'webhookUrl' => 'https://1d6b-143-178-232-105.ngrok-free.app/webhooks/mollie',
            'metadata' => [
                'order_id' => $this->order->id,
            ],
        ]);

        $payment_url = $payment->getCheckoutUrl();

        $this->order->payments()->create([
            'transaction_id' => $payment->id,
            'status' => $payment->status,
            'amount' => $this->total,
            'payment_url' => $payment_url,
        ]);

        $this->response = $payment_url;
    }

    public function getResponse()
    {
        return $this->response;
    }
}
