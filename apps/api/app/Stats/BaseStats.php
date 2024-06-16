<?php

namespace App\Stats;

use Illuminate\Database\Eloquent\Model;
use Spatie\Stats\Traits\HasStats;

class BaseStats extends Model
{
    use HasStats;

    protected $table = 'stats_events';

    protected $fillable = ['name', 'type', 'value', 'event'];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            $model->name = class_basename(static::class);
        });
    }
}
