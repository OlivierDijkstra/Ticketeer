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

        Carbon::setTestNow('2022-12-31 00:00:00');
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

        Carbon::setTestNow('2023-01-01 00:00:00');
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
    }

    public function testDifferentGranularities()
    {
        Order::factory()->create(['total' => 100, 'created_at' => '2023-01-01 00:00:00']);
        Order::factory()->create(['total' => 200, 'created_at' => '2023-01-01 00:30:00']);

        $jobs = [
            'hour' => new AggregateDataJob('hour'),
            'day' => new AggregateDataJob('day'),
            'week' => new AggregateDataJob('week'),
            'month' => new AggregateDataJob('month'),
            'year' => new AggregateDataJob('year'),
        ];

        foreach ($jobs as $granularity => $job) {
            switch ($granularity) {
                case 'hour':
                    Carbon::setTestNow('2023-01-01 01:00:00');
                    break;
                default:
                    Carbon::setTestNow('2023-01-02 00:00:00');
                    break;
            }

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

        Carbon::setTestNow('2023-01-02 00:00:00');
        $job = new AggregateDataJob('day');
        $job->handle();

        $this->assertDatabaseHas('aggregations', [
            'model_type' => 'Order',
            'aggregation_type' => 'sum',
            'granularity' => 'day',
            'period' => '2023-01-01 12:00:00',
            'value' => 200,
        ]);
    }

    public function testGetStartDate()
    {
        $job = new AggregateDataJob('day');
        $method = new \ReflectionMethod($job, 'getStartDate');
        $method->setAccessible(true);

        $endDate = Carbon::now();
        $startDate = $method->invoke($job, $endDate);

        $this->assertEquals($endDate->copy()->subDay(), $startDate);
    }

    public function testInvalidGranularityThrowsException()
    {
        $this->expectException(\Exception::class);

        $job = new AggregateDataJob('invalid');
        $method = new \ReflectionMethod($job, 'getStartDate');
        $method->setAccessible(true);
        $method->invoke($job, Carbon::now());
    }
}
