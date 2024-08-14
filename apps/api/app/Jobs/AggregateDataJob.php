<?php

namespace App\Jobs;

use App\Models\Aggregation;
use Carbon\Carbon;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

// TODO: This doesn't seem to aggregate an hour when there are no results.
class AggregateDataJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    protected Carbon $date;
    protected array $modelTypes = ['Customer', 'Order'];
    protected array $aggregationTypes = ['count', 'sum', 'avg', 'min', 'max'];
    protected array $skipAggregations = ['Customer' => ['sum', 'max', 'min', 'avg']];

    public function __construct(protected string $granularity, ?string $date = null)
    {
        $this->date = $date ? Carbon::parse($date) : $this->getPreviousPeriodEnd();
        $this->date = $this->date->startOf($this->granularity);
    }

    // Main method to handle the aggregation process
    public function handle(): void
    {
        [$startDate, $endDate] = $this->getDateRange();

        DB::transaction(function () use ($startDate, $endDate) {
            foreach ($this->modelTypes as $modelType) {
                $aggregationTypesToRun = array_diff($this->aggregationTypes, $this->skipAggregations[$modelType] ?? []);

                foreach ($aggregationTypesToRun as $aggregationType) {
                    try {
                        // Use hourly aggregation for 'hour' granularity, otherwise aggregate from smaller granularity
                        $this->granularity === 'hour'
                            ? $this->aggregateHourlyData($modelType, $aggregationType, $startDate, $endDate)
                            : $this->aggregateFromSmallerGranularity($modelType, $aggregationType, $startDate, $endDate);
                    } catch (Exception $e) {
                        Log::error("Error aggregating data for $modelType, $aggregationType, {$this->granularity}: " . $e->getMessage());
                    }
                }
            }
        });
    }

    // Aggregate data for hourly granularity directly from the database
    private function aggregateHourlyData(string $modelType, string $aggregationType, Carbon $startDate, Carbon $endDate): void
    {
        // Determine the table name based on the model type
        $table = strtolower($modelType) . 's';

        // Choose the column to aggregate based on the aggregation type and model type
        $column = $aggregationType === 'count' ? 'id' : ($modelType === 'Order' ? 'total' : 'id');

        // Get the SQL expression for the period (e.g., hour, day, week)
        $periodExpression = $this->getPeriodExpression();

        // Construct the aggregation expression
        $aggregationExpression = $aggregationType === 'count'
            ? 'COUNT(*) as value'
            : "COALESCE($aggregationType($column), 0) as value";

        $results = DB::table($table)
            ->select(DB::raw($periodExpression), DB::raw($aggregationExpression))
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('period')
            ->orderBy('period')
            ->get();

        $this->saveAggregations($modelType, $aggregationType, $results);
    }

    // Aggregate data from the next smaller granularity level
    private function aggregateFromSmallerGranularity(string $modelType, string $aggregationType, Carbon $startDate, Carbon $endDate): void
    {
        $smallerGranularity = $this->getSmallerGranularity();
        $aggregations = Aggregation::query()
            ->where('model_type', $modelType)
            ->where('aggregation_type', $aggregationType)
            ->where('granularity', $smallerGranularity)
            ->whereBetween('period', [$startDate, $endDate])
            ->get();

        $value = $aggregationType === 'count'
            ? $aggregations->sum('value')
            : $this->calculateAggregationValue($aggregationType, $aggregations->pluck('value'));

        $this->saveAggregation($modelType, $aggregationType, $value ?? 0);
    }

    // Get the next smaller granularity level
    private function getSmallerGranularity(): string
    {
        $granularities = ['hour', 'day', 'week', 'month', 'year'];
        return $granularities[array_search($this->granularity, $granularities) - 1];
    }

    // Save a single aggregation record
    private function saveAggregation(string $modelType, string $aggregationType, float $value): void
    {
        Aggregation::updateOrCreate(
            [
                'model_type' => $modelType,
                'aggregation_type' => $aggregationType,
                'granularity' => $this->granularity,
                'period' => $this->date,
            ],
            ['value' => $value ?? 0]
        );
    }

    // Calculate aggregation value based on aggregation type
    private function calculateAggregationValue(string $aggregationType, $values)
    {
        return match ($aggregationType) {
            'sum' => $values->sum(),
            'avg' => $values->avg(),
            'min' => $values->min(),
            'max' => $values->max(),
            default => throw new Exception("Unknown aggregation type: $aggregationType"),
        };
    }

    // Get the date range for the current aggregation period
    private function getDateRange(): array
    {
        return [
            $this->date->copy()->startOf($this->granularity),
            $this->date->copy()->endOf($this->granularity)
        ];
    }

    // Get the end of the previous period based on the current granularity
    private function getPreviousPeriodEnd(): Carbon
    {
        $now = now();
        return match ($this->granularity) {
            'hour' => $now->subHour()->endOfHour(),
            'day' => $now->subDay()->endOfDay(),
            'week' => $now->subWeek()->endOfWeek(),
            'month' => $now->subMonth()->endOfMonth(),
            'year' => $now->subYear()->endOfYear(),
            default => throw new Exception("Invalid granularity: {$this->granularity}"),
        };
    }

    // Save multiple aggregation records
    private function saveAggregations(string $modelType, string $aggregationType, $results): void
    {
        foreach ($results as $result) {
            Aggregation::updateOrCreate(
                [
                    'model_type' => $modelType,
                    'aggregation_type' => $aggregationType,
                    'granularity' => $this->granularity,
                    'period' => $result->period,
                ],
                ['value' => $result->value ?? 0]
            );
        }
    }

    // Get the appropriate SQL expression for period grouping based on the database driver
    // This method is necessary to ensure compatibility across different database systems,
    // as each database may have a different syntax for date/time formatting and truncation.
    // By using this method, we can write database-agnostic queries that work consistently
    // across SQLite, MySQL, and PostgreSQL without changing the rest of our application logic.
    private function getPeriodExpression(): string
    {
        return match (DB::getDriverName()) {
            'sqlite' => "strftime('%Y-%m-%d %H:00:00', created_at) as period",
            'mysql' => "DATE_FORMAT(created_at, '%Y-%m-%d %H:00:00') as period",
            'pgsql' => "DATE_TRUNC('hour', created_at) as period",
            default => throw new Exception("Unsupported database driver: " . DB::getDriverName()),
        };
    }
}