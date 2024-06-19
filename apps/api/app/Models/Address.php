<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Address extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'street',
        'street2',
        'city',
        'state',
        'postal_code',
        'country',
    ];

    public function addressable()
    {
        return $this->morphTo();
    }
}
