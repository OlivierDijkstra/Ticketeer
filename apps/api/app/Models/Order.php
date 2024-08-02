<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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

    protected $with = ['products', 'show', 'customer', 'payments', 'tickets'];

    public function tickets()
    {
        return $this->hasMany(Ticket::class);
    }

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

    public static function GenerateOrderNumber()
    {
        return 'ORD-'.now()->format('YmdHis').'-'.rand(1000, 9999);
    }
}
