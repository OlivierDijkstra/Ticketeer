<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'transaction_id',
        'status',
        'amount',
        'payment_method',
        'refunded_amount',
        'paid_at',
        'refunded_at',
    ];

    // protected $with = ['order'];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
