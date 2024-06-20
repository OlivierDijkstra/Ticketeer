<?php

namespace App\Models;

use App\Observers\ProductShowObserver;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Relations\Pivot;

#[ObservedBy([ProductShowObserver::class])]
class ProductShow extends Pivot
{
    public $timestamps = false;

    protected $fillable = ['amount', 'adjusted_price', 'enabled', 'stock'];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function show()
    {
        return $this->belongsTo(Show::class);
    }
}
