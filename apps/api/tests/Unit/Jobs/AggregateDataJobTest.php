<?php

namespace Tests\Unit\Jobs;

use App\Jobs\AggregateDataJob;
use App\Models\Aggregation;
use App\Models\Customer;
use App\Models\Order;
use Carbon\Carbon;
use Tests\TestCase;

class AggregateDataJobTest extends TestCase
{
    public function setUp(): void
    {
        parent::setUp();
        Carbon::setTestNow('2023-01-01 00:00:00');
    }

    public function testHourlyAggregation()
    {
        Order::factory()->create(['total' => 100, 'created_at' => '2023-01-01 00:30:00']);
        Order::factory()->create(['total' => 200, 'created_at' => '2023-01-01 00:45:00']);

        $job = new AggregateDataJob('hour', '2023-01-01 00:00:00');
        $job->handle();

        $this->assertDatabaseHas('aggregations', [
            'model_type' => 'Order',
            'aggregation_type' => 'count',
            'granularity' => 'hour',
            'period' => '2023-01-01 00:00:00',
            'value' => 2,
        ]);

        $this->assertDatabaseHas('aggregations', [
            'model_type' => 'Order',
            'aggregation_type' => 'sum',
            'granularity' => 'hour',
            'period' => '2023-01-01 00:00:00',
            'value' => 300,
        ]);
    }

    public function testDailyAggregation()
    {
        Aggregation::create([
            'model_type' => 'Order',
            'aggregation_type' => 'count',
            'granularity' => 'hour',
            'period' => '2023-01-01 00:00:00',
            'value' => 2,
        ]);
        Aggregation::create([
            'model_type' => 'Order',
            'aggregation_type' => 'count',
            'granularity' => 'hour',
            'period' => '2023-01-01 23:00:00',
            'value' => 3,
        ]);

        $job = new AggregateDataJob('day', '2023-01-01 00:00:00');
        $job->handle();

        $this->assertDatabaseHas('aggregations', [
            'model_type' => 'Order',
            'aggregation_type' => 'count',
            'granularity' => 'day',
            'period' => '2023-01-01 00:00:00',
            'value' => 5,
        ]);
    }

    public function testWeeklyAggregation()
    {
        $date = Carbon::parse('2023-01-01 00:00:00');
        $startOfWeek = $date->startOfWeek();
        $endOfWeek = $date->copy()->endOfWeek();

        $this->assertEquals('2022-12-26 00:00:00', $startOfWeek->format('Y-m-d H:i:s'));
        $this->assertEquals('2023-01-01 23:59:59', $endOfWeek->format('Y-m-d H:i:s'));

        $aggregation1 = Aggregation::create([
            'model_type' => 'Order',
            'aggregation_type' => 'sum',
            'granularity' => 'day',
            'period' => '2022-12-26 01:00:00',
            'value' => 100,
        ]);
        $aggregation2 = Aggregation::create([
            'model_type' => 'Order',
            'aggregation_type' => 'sum',
            'granularity' => 'day',
            'period' => '2023-01-01 22:00:00',
            'value' => 200,
        ]);

        $job = new AggregateDataJob('day', $aggregation1->period);
        $job->handle();

        $job = new AggregateDataJob('day', $aggregation2->period);
        $job->handle();

        $job = new AggregateDataJob('week', '2023-01-01 00:00:00');
        $job->handle();

        $this->assertDatabaseHas('aggregations', [
            'model_type' => 'Order',
            'aggregation_type' => 'sum',
            'granularity' => 'week',
            'period' => '2022-12-26 00:00:00',
            'value' => 300,
        ]);
    }

    public function testMonthlyAggregation()
    {
        Aggregation::create([
            'model_type' => 'Order',
            'aggregation_type' => 'avg',
            'granularity' => 'week',
            'period' => '2023-01-02 00:00:00',
            'value' => 100,
        ]);
        Aggregation::create([
            'model_type' => 'Order',
            'aggregation_type' => 'avg',
            'granularity' => 'week',
            'period' => '2023-01-15 00:00:00',
            'value' => 200,
        ]);

        $job = new AggregateDataJob('month', '2023-01-01 00:00:00');
        $job->handle();

        $this->assertDatabaseHas('aggregations', [
            'model_type' => 'Order',
            'aggregation_type' => 'avg',
            'granularity' => 'month',
            'period' => '2023-01-01 00:00:00',
            'value' => 150,
        ]);
    }

    public function testYearlyAggregation()
    {
        Aggregation::create([
            'model_type' => 'Order',
            'aggregation_type' => 'min',
            'granularity' => 'month',
            'period' => '2023-01-01 00:00:00',
            'value' => 50,
        ]);
        Aggregation::create([
            'model_type' => 'Order',
            'aggregation_type' => 'min',
            'granularity' => 'month',
            'period' => '2023-02-01 00:00:00',
            'value' => 30,
        ]);

        $job = new AggregateDataJob('year', '2023-01-01 00:00:00');
        $job->handle();

        $this->assertDatabaseHas('aggregations', [
            'model_type' => 'Order',
            'aggregation_type' => 'min',
            'granularity' => 'year',
            'period' => '2023-01-01 00:00:00',
            'value' => 30,
        ]);
    }

    public function testCustomerAggregation()
    {
        Customer::factory()->count(3)->create(['created_at' => '2023-01-01 00:00:00']);
        Customer::factory()->count(2)->create(['created_at' => '2023-01-01 01:00:00']);

        $job = new AggregateDataJob('hour', '2023-01-01 00:00:00');
        $job->handle();

        $job = new AggregateDataJob('hour', '2023-01-01 01:00:00');
        $job->handle();

        $job = new AggregateDataJob('day', '2023-01-01 00:00:00');
        $job->handle();
        
        $this->assertDatabaseHas('aggregations', [
            'model_type' => 'Customer',
            'aggregation_type' => 'count',
            'granularity' => 'hour',
            'period' => '2023-01-01 00:00:00',
            'value' => 3,
        ]);

        $this->assertDatabaseHas('aggregations', [
            'model_type' => 'Customer',
            'aggregation_type' => 'count',
            'granularity' => 'hour',
            'period' => '2023-01-01 01:00:00',
            'value' => 2,
        ]);

        $this->assertDatabaseHas('aggregations', [
            'model_type' => 'Customer',
            'aggregation_type' => 'count',
            'granularity' => 'day',
            'period' => '2023-01-01 00:00:00',
            'value' => 5,
        ]);

        $this->assertDatabaseMissing('aggregations', [
            'model_type' => 'Customer',
            'aggregation_type' => 'sum',
            'granularity' => 'day',
        ]);
    }

    public function testAggregationWithNoData()
    {
        $job = new AggregateDataJob('day', '2023-01-02 00:00:00');
        $job->handle();

        $this->assertDatabaseHas('aggregations', [
            'model_type' => 'Order',
            'aggregation_type' => 'count',
            'granularity' => 'day',
            'period' => '2023-01-02 00:00:00',
            'value' => 0,
        ]);
    }

    public function testAggregationWithDataAtPeriodBoundaries()
    {
        Order::factory()->create(['total' => 100, 'created_at' => '2023-01-01 00:00:00']);
        Order::factory()->create(['total' => 200, 'created_at' => '2023-01-01 23:59:59']);

        $job  = new AggregateDataJob('hour', '2023-01-01 00:00:00');
        $job->handle();

        $job = new AggregateDataJob('hour', '2023-01-01 23:00:00');
        $job->handle();

        $job = new AggregateDataJob('day', '2023-01-01 00:00:00');
        $job->handle();

        $this->assertDatabaseHas('aggregations', [
            'model_type' => 'Order',
            'aggregation_type' => 'sum',
            'granularity' => 'day',
            'period' => '2023-01-01 00:00:00',
            'value' => 300,
        ]);
    }

    public function testInvalidGranularity()
    {
        $this->expectException(\Exception::class);
        new AggregateDataJob('invalid');
    }

    public function testAggregationWithSpecificDate()
    {
        Order::factory()->create(['total' => 100, 'created_at' => '2023-01-15 00:00:00']);

        $job = new AggregateDataJob('hour', '2023-01-15 00:00:00');
        $job->handle();

        $job = new AggregateDataJob('day', '2023-01-15 00:00:00');
        $job->handle();

        $this->assertDatabaseHas('aggregations', [
            'model_type' => 'Order',
            'aggregation_type' => 'sum',
            'granularity' => 'day',
            'period' => '2023-01-15 00:00:00',
            'value' => 100,
        ]);
    }

    public function testAggregationUpdatesExistingRecord()
    {
        Aggregation::create([
            'model_type' => 'Order',
            'aggregation_type' => 'count',
            'granularity' => 'day',
            'period' => '2023-01-01 00:00:00',
            'value' => 5,
        ]);

        Order::factory()->create(['created_at' => '2023-01-01 12:00:00']);

        $job = new AggregateDataJob('hour', '2023-01-01 12:00:00');
        $job->handle();

        $job = new AggregateDataJob('day', '2023-01-01 00:00:00');
        $job->handle();

        $this->assertDatabaseHas('aggregations', [
            'model_type' => 'Order',
            'aggregation_type' => 'count',
            'granularity' => 'day',
            'period' => '2023-01-01 00:00:00',
            'value' => 1,
        ]);
    }

    public function testAllAggregationTypesForOrder()
    {
        Order::factory()->create(['total' => 100, 'created_at' => '2023-01-01 00:00:00']);
        Order::factory()->create(['total' => 200, 'created_at' => '2023-01-01 01:00:00']);

        $job = new AggregateDataJob('hour', '2023-01-01 00:00:00');
        $job->handle();

        $job = new AggregateDataJob('hour', '2023-01-01 01:00:00');
        $job->handle();

        $job = new AggregateDataJob('day', '2023-01-01 00:00:00');
        $job->handle();

        $this->assertDatabaseHas('aggregations', [
            'model_type' => 'Order',
            'aggregation_type' => 'count',
            'granularity' => 'day',
            'period' => '2023-01-01 00:00:00',
            'value' => 2,
        ]);

        $this->assertDatabaseHas('aggregations', [
            'model_type' => 'Order',
            'aggregation_type' => 'sum',
            'granularity' => 'day',
            'period' => '2023-01-01 00:00:00',
            'value' => 300,
        ]);

        $this->assertDatabaseHas('aggregations', [
            'model_type' => 'Order',
            'aggregation_type' => 'avg',
            'granularity' => 'day',
            'period' => '2023-01-01 00:00:00',
            'value' => 150,
        ]);

        $this->assertDatabaseHas('aggregations', [
            'model_type' => 'Order',
            'aggregation_type' => 'min',
            'granularity' => 'day',
            'period' => '2023-01-01 00:00:00',
            'value' => 100,
        ]);

        $this->assertDatabaseHas('aggregations', [
            'model_type' => 'Order',
            'aggregation_type' => 'max',
            'granularity' => 'day',
            'period' => '2023-01-01 00:00:00',
            'value' => 200,
        ]);
    }
}
