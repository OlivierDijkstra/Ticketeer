<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Aggregation extends Model
{
    use HasFactory;

    protected $fillable = [
        'model_type',
        'aggregation_type',
        'granularity',
        'period',
        'value',
    ];

    protected $casts = [
        'period' => 'datetime',
        'value' => 'decimal:2',
    ];

    public function scopeForModel($query, $modelType)
    {
        return $query->where('model_type', $modelType);
    }

    public function scopeForAggregation($query, $aggregationType)
    {
        return $query->where('aggregation_type', $aggregationType);
    }

    public function scopeForGranularity($query, $granularity)
    {
        return $query->where('granularity', $granularity);
    }

    public function scopeForPeriod($query, $startDate, $endDate)
    {
        return $query->whereBetween('period', [$startDate, $endDate]);
    }
}
