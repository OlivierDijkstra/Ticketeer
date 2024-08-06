<?php

namespace Tests\Feature\Controllers;

use App\Models\Aggregation;
use Carbon\Carbon;
use Tests\TestCase;

class AggregationControllerTest extends TestCase
{
    public function setUp(): void
    {
        parent::setUp();
        Carbon::setTestNow('2023-01-15 12:00:00');
    }

    public function test_index_returns_correct_data()
    {
        Aggregation::factory()->create([
            'model_type' => 'Order',
            'aggregation_type' => 'count',
            'granularity' => 'day',
            'period' => '2023-01-15 00:00:00',
            'value' => 10
        ]);

        $response = $this->getJson('/api/aggregations?model_type=Order&aggregation_type=count&granularity=day&date_range=This day');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonStructure([
                'data' => [
                    '*' => ['x', 'value']
                ]
            ])
            ->assertJsonPath('data.0.value', '10.00');
    }

    public function test_index_filters_by_date_range()
    {
        Aggregation::factory()->create([
            'model_type' => 'Order',
            'aggregation_type' => 'count',
            'granularity' => 'day',
            'period' => '2023-01-14 00:00:00',
            'value' => 5
        ]);

        Aggregation::factory()->create([
            'model_type' => 'Order',
            'aggregation_type' => 'count',
            'granularity' => 'day',
            'period' => '2023-01-15 00:00:00',
            'value' => 10
        ]);

        $response = $this->getJson('/api/aggregations?model_type=Order&aggregation_type=count&granularity=day&date_range=This day');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.value', '10.00');
    }

    public function test_parse_date_range_with_predefined_ranges()
    {
        $controller = new \App\Http\Controllers\AggregationController();
        $method = new \ReflectionMethod($controller, 'parseDateRange');
        $method->setAccessible(true);

        $testCases = [
            'This year' => [Carbon::now()->startOfYear(), Carbon::now()->endOfYear()],
            'Last year' => [Carbon::now()->subYear()->startOfYear(), Carbon::now()->subYear()->endOfYear()],
            'This month' => [Carbon::now()->startOfMonth(), Carbon::now()->endOfMonth()],
            'Last month' => [Carbon::now()->subMonth()->startOfMonth(), Carbon::now()->subMonth()->endOfMonth()],
            'This week' => [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()],
            'Last week' => [Carbon::now()->subWeek()->startOfWeek(), Carbon::now()->subWeek()->endOfWeek()],
            'This day' => [Carbon::today(), Carbon::today()->endOfDay()],
            'Last day' => [Carbon::yesterday(), Carbon::yesterday()->endOfDay()],
        ];

        foreach ($testCases as $input => $expected) {
            $result = $method->invoke($controller, $input);
            $this->assertEquals($expected[0], $result['start']);
            $this->assertEquals($expected[1], $result['end']);
        }
    }

    public function test_parse_date_range_with_custom_range()
    {
        $controller = new \App\Http\Controllers\AggregationController();
        $method = new \ReflectionMethod($controller, 'parseDateRange');
        $method->setAccessible(true);

        $customRange = json_encode(['2023-01-01', '2023-01-31']);
        $result = $method->invoke($controller, $customRange);

        $this->assertEquals(Carbon::parse('2023-01-01'), $result['start']);
        $this->assertEquals(Carbon::parse('2023-01-31'), $result['end']);
    }
}
