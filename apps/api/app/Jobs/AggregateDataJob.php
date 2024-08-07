<?php

namespace App\Jobs;

use App\Models\Aggregation;
use Carbon\Carbon;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AggregateDataJob implements ShouldQueue, ShouldBeUnique
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;

    protected $granularity;
    protected $date;

    protected $modelTypes = ['Customer', 'Order'];

    protected $aggregationTypes = ['count', 'sum', 'avg', 'min', 'max'];

    protected $skipAggregations = [
        'Customer' => ['sum', 'max', 'min', 'avg'],
    ];

    public function __construct($granularity, $date = null)
    {
        $this->granularity = $granularity;
        $this->date = $date ? Carbon::parse($date) : Carbon::now();
    }

    public function handle()
    {
        [$startDate, $endDate] = $this->getDateRange();

        DB::transaction(function () use ($startDate, $endDate) {
            foreach ($this->modelTypes as $modelType) {
                $aggregationTypesToRun = $this->aggregationTypes;
                if (isset($this->skipAggregations[$modelType])) {
                    $aggregationTypesToRun = array_diff($aggregationTypesToRun, $this->skipAggregations[$modelType]);
                }

                foreach ($aggregationTypesToRun as $aggregationType) {
                    try {
                        $this->aggregateData($modelType, $aggregationType, $startDate, $endDate);
                    } catch (Exception $e) {
                        Log::error("Error aggregating data for $modelType, $aggregationType, {$this->granularity}: " . $e->getMessage());
                    }
                }
            }
        });
    }

    private function aggregateData($modelType, $aggregationType, $startDate, $endDate)
    {
        $table = $this->getTableName($modelType);
        $column = $this->getColumnName($modelType, $aggregationType);

        $query = DB::table($table)
            ->select(
                DB::raw($this->getPeriodExpression()),
                DB::raw($this->getAggregationExpression($aggregationType, $column))
            )
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('period')
            ->orderBy('period');

        $results = $query->get();

        $this->saveAggregations($modelType, $aggregationType, $results);
    }

    private function saveAggregations($modelType, $aggregationType, $results)
    {
        if (!$results->count()) {
            Aggregation::create([
                'model_type' => $modelType,
                'aggregation_type' => $aggregationType,
                'granularity' => $this->granularity,
                'period' => $this->date,
                'value' => 0,
            ]);

            return;
        }

        Aggregation::create(
            [
                'model_type' => $modelType,
                'aggregation_type' => $aggregationType,
                'granularity' => $this->granularity,
                'period' => $results->first()->period,
                'value' => collect($results)->sum('value'),
            ]
        );
    }

    private function getDateRange()
    {
        $date = $this->date;

        switch ($this->granularity) {
            case 'hour':
                return [
                    $date->copy()->startOfHour(),
                    $date->copy()->endOfHour()
                ];
            case 'day':
                return [
                    $date->copy()->startOfDay(),
                    $date->copy()->endOfDay()
                ];
            case 'week':
                return [
                    $date->copy()->startOfWeek(),
                    $date->copy()->endOfWeek()
                ];
            case 'month':
                return [
                    $date->copy()->startOfMonth(),
                    $date->copy()->endOfMonth()
                ];
            case 'year':
                return [
                    $date->copy()->startOfYear(),
                    $date->copy()->endOfYear()
                ];
            default:
                throw new Exception("Invalid granularity: {$this->granularity}");
        }
    }

    private function getTableName($modelType)
    {
        return strtolower($modelType) . 's';
    }

    private function getColumnName($modelType, $aggregationType)
    {
        if ($aggregationType === 'count') {
            return 'id';
        }

        switch ($modelType) {
            case 'Order':
                return 'total';
            case 'Customer':
                return 'id';
            default:
                return 'id';
        }
    }

    private function getAggregationExpression($aggregationType, $column)
    {
        if ($aggregationType === 'count') {
            return "COUNT(*) as value";
        } elseif (in_array($aggregationType, ['sum', 'avg', 'min', 'max'])) {
            return "COALESCE($aggregationType($column), 0) as value";
        } else {
            throw new Exception("Unknown aggregation type: $aggregationType");
        }
    }

    private function getPeriodExpression()
    {
        $driver = DB::getDriverName();

        if ($driver === 'sqlite') {
            return "strftime('%Y-%m-%d %H:00:00', created_at) as period";
        } elseif ($driver === 'mysql') {
            return "DATE_FORMAT(created_at, '%Y-%m-%d %H:00:00') as period";
        } elseif ($driver === 'pgsql') {
            return "DATE_TRUNC('{$this->granularity}', created_at) as period";
        } else {
            throw new Exception("Unsupported database driver: $driver");
        }
    }
}