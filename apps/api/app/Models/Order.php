<?php

namespace App\Models;

use App\Stats\OrderStats;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Mollie\Laravel\Facades\Mollie;
use Spatie\Stats\StatsWriter;

class Order extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'show_id',
        'customer_id',
        'order_number',
        'status',
        'description',
        'service_fee',
        'total',
        'discount',
        'refunded_amount',
    ];

    protected $with = ['products', 'show', 'customer', 'payments'];

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function products()
    {
        return $this->belongsToMany(Product::class)
            ->withPivot('amount', 'price');
    }

    public function show()
    {
        return $this->belongsTo(Show::class);
    }

    public function event()
    {
        return $this->hasOneThrough(Event::class, Show::class, 'id', 'id', 'show_id', 'event_id');
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function subTotalFromProducts()
    {
        return $this->products->map(function ($product) {
            $price = $product->pivot->price;

            return $product->pivot->amount * $price;
        })->sum();
    }

    public function totalFromProducts()
    {
        // TODO: Implement discounts
        return $this->subTotalFromProducts();
    }

    public function total()
    {
        return $this->total + $this->show->event->service_price;
    }

    public function createPayment(float $total, string $redirectUrl)
    {
        if ($this->payments) {
            $paymentTotal = $this->payments()
                ->where('status', 'paid')
                ->sum('amount');

            if ($paymentTotal >= $total) {
                throw new \Exception('Order is already paid');
            }
        }

        if (! env('MOLLIE_KEY')) {
            return config('app.url');
        }

        $payment = Mollie::api()
            ->payments
            ->create([
                'amount' => [
                    'currency' => 'EUR',
                    'value' => number_format($total, 2, '.', ''), // You must send the correct number of decimals, thus we format it to 2 decimals
                ],
                'description' => $this->description ?? 'Order '.$this->order_number,
                'redirectUrl' => $redirectUrl,
                'webhookUrl' => 'https://e93c-143-178-232-105.ngrok-free.app/webhooks/mollie',
                'metadata' => [
                    'order_id' => $this->id,
                ],
            ]);

        $this->payments()->create([
            'transaction_id' => $payment->id,
            'status' => $payment->status,
            'amount' => $total,
        ]);

        return $payment->getCheckoutUrl();
    }

    public static function GenerateOrderNumber()
    {
        return 'ORD-'.now()->format('YmdHis').'-'.rand(1000, 9999);
    }

    // on created
    public static function boot()
    {
        parent::boot();

        static::created(function ($order) {
            StatsWriter::for(OrderStats::class, ['event' => $order->event->slug])->increase();
        });
    }
}
