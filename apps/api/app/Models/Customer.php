<?php

namespace App\Models;

use App\Stats\CustomerStats;
use App\Traits\Searchable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Stats\StatsWriter;

class Customer extends Model
{
    use HasFactory, HasUuids, Searchable, SoftDeletes;

    protected $with = ['address'];

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone',
    ];

    public function address()
    {
        return $this->morphOne(Address::class, 'addressable');
    }

    protected static function boot()
    {
        parent::boot();

        static::created(function ($customer) {
            $customer->address()->create();

            StatsWriter::for(CustomerStats::class)->increase();
        });

        static::deleting(function ($customer) {
            $customer->address()->delete();
        });
    }
}
