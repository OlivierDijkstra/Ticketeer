<?php

namespace App\Jobs;

use App\Actions\RestoreProductStockAction;
use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class RestoreProductStockJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $payment;
    protected $deleteOrder;
    /**
     * Create a new job instance.
     */
    public function __construct(Payment $payment, $deleteOrder = false)
    {
        $this->payment = $payment;
        $this->deleteOrder = $deleteOrder;
    }

    /**
     * Execute the job.
     */
    public function handle(RestoreProductStockAction $action): void
    {
        if (!$this->payment->exists) {
            Log::warning("Payment {$this->payment->id} no longer exists. Skipping stock restoration.");
            return;
        }

        // Load the order with its products and the show_id
        $order = $this->payment->order()->with(['products', 'show:id'])->first();

        if (! $order) {
            return;
        }

        $products = $order->products->map(function ($product) {
            return [
                'id' => $product->id,
                'amount' => $product->pivot->amount,
            ];
        })->toArray();

        $action->handle($products, $order->show_id);

        if ($this->deleteOrder) {
            $order->delete();
        }
    }
}
