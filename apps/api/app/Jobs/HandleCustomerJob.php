<?php

namespace App\Jobs;

use App\Actions\CreateOrUpdateCustomerAction;
use App\Models\Customer;
use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class HandleCustomerJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $customerData;

    protected $order;

    private $customer;

    public function __construct(array $customerData, Order $order)
    {
        $this->customerData = $customerData;
        $this->order = $order;
    }

    public function handle(CreateOrUpdateCustomerAction $createOrUpdateCustomerAction)
    {
        $this->customer = $createOrUpdateCustomerAction->handle($this->customerData);

        $this->order->update(['customer_id' => $this->customer->id]);
    }

    public function getCustomer(): Customer
    {
        return $this->customer;
    }
}
