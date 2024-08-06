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

class AggregateDataJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;

    protected $granularity;

    protected $modelTypes = ['Order', 'Customer'];

    protected $aggregationTypes = ['count', 'sum', 'avg', 'min', 'max'];

    protected $skipAggregations = ['Customer' => ['max', 'min', 'avg', 'sum']];

    public function __construct($granularity)
    {
        $this->granularity = $granularity;
    }

    public function handle()
    {
        $endDate = Carbon::now();
        $startDate = $this->getStartDate($endDate);

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
    }

    private function aggregateData($modelType, $aggregationType, $startDate, $endDate)
    {
        $table = $this->getTableName($modelType);
        $column = $this->getColumnName($modelType, $aggregationType);

        $query = DB::table($table)
            ->select(
                DB::raw($this->getPeriodExpression()),
                DB::raw("$aggregationType($column) as value")
            )
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('period')
            ->orderBy('period');

        $results = $query->get();

        $this->saveAggregations($modelType, $aggregationType, $results);
    }

    private function saveAggregations($modelType, $aggregationType, $results)
    {
        foreach ($results as $result) {
            Aggregation::updateOrCreate(
                [
                    'model_type' => $modelType,
                    'aggregation_type' => $aggregationType,
                    'granularity' => $this->granularity,
                    'period' => $result->period,
                ],
                ['value' => $result->value]
            );
        }
    }

    private function getStartDate($endDate)
    {
        switch ($this->granularity) {
            case 'hour':
                return $endDate->copy()->subHour();
            case 'day':
                return $endDate->copy()->subDay();
            case 'week':
                return $endDate->copy()->subWeek();
            case 'month':
                return $endDate->copy()->subMonth();
            case 'year':
                return $endDate->copy()->subYear();
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
                throw new Exception("Unknown model type: $modelType");
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
