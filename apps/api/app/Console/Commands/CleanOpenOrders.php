<?php

namespace App\Console\Commands;

use App\Models\Order;
use Illuminate\Console\Command;
use Carbon\Carbon;

class CleanOpenOrders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:clean-open-orders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean any orders that have existed for longer than 2 hours and are still open';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $twoHoursAgo = Carbon::now()->subHours(2);

        $orders = Order::where('status', 'open')
            ->where('created_at', '<', $twoHoursAgo)
            ->get();

        foreach ($orders as $order) {
            $order->delete();
        }

        $this->info('Cleaned open orders older than 2 hours.');
    }
}
