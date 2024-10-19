<?php

namespace App\Console\Commands;

use App\Actions\RestoreProductStockAction;
use App\Models\Order;
use Carbon\Carbon;
use Illuminate\Console\Command;

class CleanPendingOrders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:clean-pending-orders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean any orders that have existed for longer than 2 hours and are still pending';

    /**
     * Execute the console command.
     */
    public function handle(RestoreProductStockAction $restoreProductStockAction)
    {
        $orders = Order::where('status', 'pending')
            ->where('created_at', '<', Carbon::now()->subHour())
            ->get();

        foreach ($orders as $order) {
            $products = $order->products->map(function ($product) {
                return [
                    'id' => $product->id,
                    'amount' => $product->pivot->amount,
                ];
            });

            $restoreProductStockAction->handle($products->toArray(), $order->show_id);
            $order->delete();
        }

        $this->info('Cleaned pending orders older than 1 hour.');
    }
}
