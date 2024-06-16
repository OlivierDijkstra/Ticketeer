<?php

namespace App\Models;

use App\Traits\Searchable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Show extends Model
{
    use HasFactory, Searchable, SoftDeletes;

    // /**
    //  * Get the indexable data array for the model.
    //  *
    //  * @return array<string, mixed>
    //  */
    // public function toSearchableArray()
    // {
    //     return array_merge($this->toArray(), [
    //         'id' => (string) $this->id,
    //         'guests' => collect($this->guests)->implode(', '),
    //         'created_at' => $this->created_at->timestamp,
    //     ]);
    // }

    protected $with = ['address', 'products', 'event'];

    protected $fillable = [
        'start',
        'end',
        'enabled',
        'guests',
        'description',
    ];

    protected $casts = [
        'enabled' => 'boolean',
        'guests' => 'json',
    ];

    protected $dates = [
        'start',
        'end',
    ];

    public function address()
    {
        return $this->morphOne(Address::class, 'addressable');
    }

    public function event()
    {
        return $this->belongsTo(Event::class)
            ->withTrashed();
    }

    public function products()
    {
        return $this->belongsToMany(Product::class)
            ->withPivot(['amount', 'adjusted_price', 'enabled']);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    protected static function boot()
    {
        parent::boot();

        static::created(function ($show) {
            $show->address()->create();
        });

        static::deleting(function ($show) {
            $show->address()->delete();
        });
    }
}
