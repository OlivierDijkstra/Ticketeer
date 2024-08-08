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

    public function testHandleMethodAggregatesData()
    {
        Order::factory()->create([
            'total' => 100,
            'created_at' => '2022-12-31 00:00:00',
        ]);

        Order::factory()->create([
            'total' => 150,
            'created_at' => '2023-01-01 00:00:00',
        ]);

        Order::factory()->create([
            'total' => 100,
            'created_at' => '2023-01-02 00:00:00',
        ]);

        Order::factory()->create([
            'total' => 200,
            'created_at' => '2023-01-02 00:30:00',
        ]);

        Carbon::setTestNow('2022-12-31 01:00:00');
        $job = new AggregateDataJob('hour');
        $job->handle();

        $this->assertDatabaseHas('aggregations', [
            'model_type' => 'Order',
            'aggregation_type' => 'count',
            'granularity' => 'hour',
            'value' => 1,
        ]);

        $this->assertDatabaseHas('aggregations', [
            'model_type' => 'Order',
            'aggregation_type' => 'sum',
            'granularity' => 'hour',
            'value' => 100,
        ]);

        Carbon::setTestNow('2023-01-01 01:00:00');
        $job = new AggregateDataJob('hour');
        $job->handle();

        $this->assertDatabaseHas('aggregations', [
            'model_type' => 'Order',
            'aggregation_type' => 'sum',
            'granularity' => 'hour',
            'value' => 150,
        ]);

        Carbon::setTestNow('2023-01-03 00:00:00');
        $job = new AggregateDataJob('day');
        $job->handle();

        $this->assertDatabaseHas('aggregations', [
            'model_type' => 'Order',
            'aggregation_type' => 'sum',
            'granularity' => 'day',
            'value' => 300,
        ]);

        $this->assertDatabaseHas('aggregations', [
            'model_type' => 'Order',
            'aggregation_type' => 'count',
            'granularity' => 'day',
            'value' => 2,
        ]);
    }

    public function testCustomerAggregation()
    {
        Customer::factory()->count(3)->create(['created_at' => '2023-01-01 00:00:00']);
        Customer::factory()->count(2)->create(['created_at' => '2023-01-02 00:00:00']);

        Carbon::setTestNow('2023-01-03 00:00:00');
        $job = new AggregateDataJob('day');
        $job->handle();

        $this->assertDatabaseHas('aggregations', [
            'model_type' => 'Customer',
            'aggregation_type' => 'count',
            'granularity' => 'day',
            'value' => 2,
        ]);

        $this->assertDatabaseMissing('aggregations', [
            'model_type' => 'Customer',
            'aggregation_type' => 'sum',
            'granularity' => 'day',
        ]);
    }

    public function testDifferentGranularities()
    {
        Order::factory()->create(['total' => 100, 'created_at' => '2023-01-01 00:00:00']);
        Order::factory()->create(['total' => 200, 'created_at' => '2023-01-01 00:30:00']);

        $jobs = [
            'hour' => new AggregateDataJob('hour', '2023-01-01 00:00:00'),
            'day' => new AggregateDataJob('day', '2023-01-01 00:00:00'),
            'week' => new AggregateDataJob('week', '2023-01-01 00:00:00'),
            'month' => new AggregateDataJob('month', '2023-01-01 00:00:00'),
            'year' => new AggregateDataJob('year', '2023-01-01 00:00:00'),
        ];

        foreach ($jobs as $granularity => $job) {
            $job->handle();

            $this->assertDatabaseHas('aggregations', [
                'model_type' => 'Order',
                'aggregation_type' => 'sum',
                'granularity' => $granularity,
                'value' => 300,
            ]);
        }
    }

    public function testGetPeriodExpressionForDifferentDrivers()
    {
        $job = new AggregateDataJob('hour');
        $method = new \ReflectionMethod($job, 'getPeriodExpression');
        $method->setAccessible(true);

        // Test for SQLite
        config(['database.default' => 'sqlite']);
        $this->assertStringContainsString("strftime('%Y-%m-%d %H:00:00', created_at) as period", $method->invoke($job));

        // Test for MySQL
        config(['database.default' => 'mysql']);
        $this->assertStringContainsString("DATE_FORMAT(created_at, '%Y-%m-%d %H:00:00') as period", $method->invoke($job));

        // Test for PostgreSQL
        config(['database.default' => 'pgsql']);
        $this->assertStringContainsString("DATE_TRUNC('hour', created_at) as period", $method->invoke($job));

        // Test for unsupported driver
        config(['database.default' => 'unsupported']);
        $this->expectException(\Exception::class);
        $method->invoke($job);
    }

    public function testUpdateExistingAggregations()
    {
        // Create an initial aggregation
        Aggregation::create([
            'model_type' => 'Order',
            'aggregation_type' => 'sum',
            'granularity' => 'day',
            'period' => '2023-01-01 00:00:00',
            'value' => 100,
        ]);

        // Create a new order that should update the existing aggregation
        Order::factory()->create([
            'total' => 200,
            'created_at' => '2023-01-01 12:00:00',
        ]);

        $job = new AggregateDataJob('day', '2023-01-01 00:00:00');
        $job->handle();

        $this->assertDatabaseHas('aggregations', [
            'model_type' => 'Order',
            'aggregation_type' => 'sum',
            'granularity' => 'day',
            'period' => '2023-01-01 00:00:00',
            'value' => 200,
        ]);
    }

    public function testGetPreviousPeriodEnd()
    {
        $method = new \ReflectionMethod(AggregateDataJob::class, 'getPreviousPeriodEnd');
        $method->setAccessible(true);

        $testCases = [
            'hour' => Carbon::now()->subHour()->endOfHour(),
            'day' => Carbon::now()->subDay()->endOfDay(),
            'week' => Carbon::now()->subWeek()->endOfWeek(),
            'month' => Carbon::now()->subMonth()->endOfMonth(),
            'year' => Carbon::now()->subYear()->endOfYear(),
        ];

        foreach ($testCases as $granularity => $expectedDate) {
            $job = new AggregateDataJob($granularity);
            $this->assertEquals($expectedDate, $method->invoke($job));
        }
    }

    public function testInvalidGranularityThrowsException()
    {
        $this->expectException(\Exception::class);
        new AggregateDataJob('invalid');
    }

    public function testAggregationWithNoData()
    {
        Carbon::setTestNow('2023-01-01 00:00:00');
        $job = new AggregateDataJob('day', '2023-01-01 00:00:00');
        $job->handle();

        $this->assertDatabaseHas('aggregations', [
            'model_type' => 'Order',
            'aggregation_type' => 'count',
            'granularity' => 'day',
            'period' => '2023-01-01 00:00:00',
            'value' => 0,
        ]);

        $this->assertDatabaseHas('aggregations', [
            'model_type' => 'Order',
            'aggregation_type' => 'sum',
            'granularity' => 'day',
            'period' => '2023-01-01 00:00:00',
            'value' => 0,
        ]);
    }

    public function testAggregationWithDataAtPeriodBoundaries()
    {
        Order::factory()->create([
            'total' => 100,
            'created_at' => '2023-01-01 00:00:00', // Start of day
        ]);

        Order::factory()->create([
            'total' => 200,
            'created_at' => '2023-01-01 23:59:59', // End of day
        ]);

        Carbon::setTestNow('2023-01-02 00:00:00');
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
    }

    public function testAverageAggregation()
    {
        Order::factory()->create(['total' => 100, 'created_at' => '2023-01-01 00:00:00']);
        Order::factory()->create(['total' => 200, 'created_at' => '2023-01-01 01:00:00']);
        Order::factory()->create(['total' => 300, 'created_at' => '2023-01-01 02:00:00']);

        Carbon::setTestNow('2023-01-02 00:00:00');
        $job = new AggregateDataJob('day');
        $job->handle();

        $this->assertDatabaseHas('aggregations', [
            'model_type' => 'Order',
            'aggregation_type' => 'avg',
            'granularity' => 'day',
            'period' => '2023-01-01 00:00:00',
            'value' => 200, // (100 + 200 + 300) / 3 = 200
        ]);
    }

    public function testMinimumAggregation()
    {
        Order::factory()->create(['total' => 150, 'created_at' => '2023-01-01 00:00:00']);
        Order::factory()->create(['total' => 100, 'created_at' => '2023-01-01 01:00:00']);
        Order::factory()->create(['total' => 200, 'created_at' => '2023-01-01 02:00:00']);

        Carbon::setTestNow('2023-01-02 00:00:00');
        $job = new AggregateDataJob('day', '2023-01-01 00:00:00');
        $job->handle();

        $this->assertDatabaseHas('aggregations', [
            'model_type' => 'Order',
            'aggregation_type' => 'min',
            'granularity' => 'day',
            'period' => '2023-01-01 00:00:00',
            'value' => 100,
        ]);
    }

    public function testMaximumAggregation()
    {
        Order::factory()->create(['total' => 150, 'created_at' => '2023-01-01 00:00:00']);
        Order::factory()->create(['total' => 100, 'created_at' => '2023-01-01 01:00:00']);
        Order::factory()->create(['total' => 200, 'created_at' => '2023-01-01 02:00:00']);

        Carbon::setTestNow('2023-01-02 00:00:00');
        $job = new AggregateDataJob('day', '2023-01-01 00:00:00');
        $job->handle();

        $this->assertDatabaseHas('aggregations', [
            'model_type' => 'Order',
            'aggregation_type' => 'max',
            'granularity' => 'day',
            'period' => '2023-01-01 00:00:00',
            'value' => 200,
        ]);
    }

    public function testAllAggregationTypesForSingleDay()
    {
        Order::factory()->create(['total' => 100, 'created_at' => '2023-01-01 00:00:00']);
        Order::factory()->create(['total' => 200, 'created_at' => '2023-01-01 12:00:00']);
        Order::factory()->create(['total' => 300, 'created_at' => '2023-01-01 23:59:59']);

        Carbon::setTestNow('2023-01-02 00:00:00');
        $job = new AggregateDataJob('day', '2023-01-01 00:00:00');
        $job->handle();

        $this->assertDatabaseHas('aggregations', [
            'model_type' => 'Order',
            'aggregation_type' => 'count',
            'granularity' => 'day',
            'period' => '2023-01-01 00:00:00',
            'value' => 3,
        ]);

        $this->assertDatabaseHas('aggregations', [
            'model_type' => 'Order',
            'aggregation_type' => 'sum',
            'granularity' => 'day',
            'period' => '2023-01-01 00:00:00',
            'value' => 600,
        ]);

        $this->assertDatabaseHas('aggregations', [
            'model_type' => 'Order',
            'aggregation_type' => 'avg',
            'granularity' => 'day',
            'period' => '2023-01-01 00:00:00',
            'value' => 200,
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
            'value' => 300,
        ]);
    }

    public function testSkipAggregationsFunctionality()
    {
        // Create some customer data
        Customer::factory()->count(3)->create(['created_at' => '2023-01-01 00:00:00']);
        Customer::factory()->count(2)->create(['created_at' => '2023-01-02 00:00:00']);

        // Create some order data (to ensure other aggregations are still working)
        Order::factory()->create(['total' => 100, 'created_at' => '2023-01-01 00:00:00']);
        Order::factory()->create(['total' => 200, 'created_at' => '2023-01-02 00:00:00']);

        Carbon::setTestNow('2023-01-03 00:00:00');
        $job = new AggregateDataJob('day', '2023-01-02 00:00:00');
        $job->handle();

        // Assert that Customer count aggregation exists
        $this->assertDatabaseHas('aggregations', [
            'model_type' => 'Customer',
            'aggregation_type' => 'count',
            'granularity' => 'day',
            'period' => '2023-01-02 00:00:00',
            'value' => 2,
        ]);

        // Assert that skipped Customer aggregations do not exist
        $this->assertDatabaseMissing('aggregations', [
            'model_type' => 'Customer',
            'aggregation_type' => 'sum',
            'granularity' => 'day',
            'period' => '2023-01-02 00:00:00',
        ]);

        $this->assertDatabaseMissing('aggregations', [
            'model_type' => 'Customer',
            'aggregation_type' => 'avg',
            'granularity' => 'day',
            'period' => '2023-01-02 00:00:00',
        ]);

        $this->assertDatabaseMissing('aggregations', [
            'model_type' => 'Customer',
            'aggregation_type' => 'min',
            'granularity' => 'day',
            'period' => '2023-01-02 00:00:00',
        ]);

        $this->assertDatabaseMissing('aggregations', [
            'model_type' => 'Customer',
            'aggregation_type' => 'max',
            'granularity' => 'day',
            'period' => '2023-01-02 00:00:00',
        ]);

        // Assert that Order aggregations still exist (to ensure other aggregations are not affected)
        $this->assertDatabaseHas('aggregations', [
            'model_type' => 'Order',
            'aggregation_type' => 'sum',
            'granularity' => 'day',
            'period' => '2023-01-02 00:00:00',
            'value' => 200,
        ]);

        $this->assertDatabaseHas('aggregations', [
            'model_type' => 'Order',
            'aggregation_type' => 'count',
            'granularity' => 'day',
            'period' => '2023-01-02 00:00:00',
            'value' => 1,
        ]);
    }
}
