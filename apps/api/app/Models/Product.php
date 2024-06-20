<?php

namespace App\Models;

use App\Traits\Searchable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, Searchable, SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'price',
        'vat',
        'is_upsell',
    ];

    protected $casts = [
        'is_upsell' => 'boolean',
    ];

    public function orders()
    {
        return $this->belongsToMany(Order::class)
            ->withPivot(['amount', 'price']);
    }

    public function shows()
    {
        return $this->belongsToMany(Show::class)
            ->using(ProductShow::class)
            ->withPivot(['amount', 'adjusted_price', 'enabled', 'stock']);
    }
}
