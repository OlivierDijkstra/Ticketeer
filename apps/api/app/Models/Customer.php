<?php

namespace App\Models;

use App\Traits\Searchable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Notifications\Notifiable;

class Customer extends Model
{
    use HasFactory, HasUuids, Notifiable, Searchable, SoftDeletes;

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
        });

        static::deleting(function ($customer) {
            $customer->address()->delete();
        });
    }
}
