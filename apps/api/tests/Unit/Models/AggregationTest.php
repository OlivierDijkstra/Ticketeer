<?php

namespace Tests\Unit\Models;

use App\Models\Aggregation;
use Tests\TestCase;

class AggregationTest extends TestCase
{
    public function test_fillable_attributes()
    {
        $fillable = ['model_type', 'aggregation_type', 'granularity', 'period', 'value'];
        $aggregation = new Aggregation();

        $this->assertEquals($fillable, $aggregation->getFillable());
    }

    public function test_casts_attributes()
    {
        $casts = [
            'id' => 'int',
            'period' => 'datetime',
            'value' => 'decimal:2',
        ];
        $aggregation = new Aggregation();

        $this->assertEquals($casts, $aggregation->getCasts());
    }

    public function test_scope_for_model()
    {
        Aggregation::factory()->create(['model_type' => 'Order']);
        Aggregation::factory()->create(['model_type' => 'Customer']);

        $orders = Aggregation::forModel('Order')->get();

        $this->assertCount(1, $orders);
        $this->assertEquals('Order', $orders->first()->model_type);
    }

    public function test_scope_for_aggregation()
    {
        Aggregation::factory()->create(['aggregation_type' => 'count']);
        Aggregation::factory()->create(['aggregation_type' => 'sum']);

        $counts = Aggregation::forAggregation('count')->get();

        $this->assertCount(1, $counts);
        $this->assertEquals('count', $counts->first()->aggregation_type);
    }

    public function test_scope_for_granularity()
    {
        Aggregation::factory()->create(['granularity' => 'day']);
        Aggregation::factory()->create(['granularity' => 'month']);

        $days = Aggregation::forGranularity('day')->get();

        $this->assertCount(1, $days);
        $this->assertEquals('day', $days->first()->granularity);
    }

    public function test_scope_for_period()
    {
        Aggregation::factory()->create(['period' => '2023-01-01 00:00:00']);
        Aggregation::factory()->create(['period' => '2023-01-15 00:00:00']);
        Aggregation::factory()->create(['period' => '2023-01-31 00:00:00']);

        $startDate = '2023-01-10 00:00:00';
        $endDate = '2023-01-20 00:00:00';

        $filteredAggregations = Aggregation::forPeriod($startDate, $endDate)->get();

        $this->assertCount(1, $filteredAggregations);
        $this->assertEquals('2023-01-15 00:00:00', $filteredAggregations->first()->period->toDateTimeString());
    }
}
