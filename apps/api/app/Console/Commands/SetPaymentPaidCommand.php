<?php

namespace App\Console\Commands;

use App\Jobs\GenerateTicketsJob;
use App\Jobs\HandlePaymentPaidJob;
use App\Models\Payment;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Bus;

class SetPaymentPaidCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:set-payment-paid {transaction_id}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Set a payment to paid status';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $transactionId = $this->argument('transaction_id');

        $payment = Payment::where('transaction_id', $transactionId)->first();

        if (! $payment) {
            $this->error("Payment with transaction ID {$transactionId} not found.");

            return 1;
        }

        if ($payment->status === 'paid') {
            $this->info('Payment is already marked as paid.');

            return 0;
        }

        Bus::chain([
            new HandlePaymentPaidJob($payment),
            new GenerateTicketsJob($payment),
        ])->dispatch();

        $this->info('Payment set to paid and related jobs dispatched.');

        return 0;
    }
}
