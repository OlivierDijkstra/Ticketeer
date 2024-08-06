<?php

namespace Database\Seeders;

use App\Models\Aggregation;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;

class AggregationsSeeder extends Seeder
{
    protected $modelTypes = ['Order', 'Customer'];

    protected $aggregationTypes = ['count', 'avg', 'min', 'max'];

    protected $granularities = ['hour', 'day', 'week', 'month', 'year'];

    protected $batchSize = 100;

    public function run(): void
    {
        if ($this->checkIfDataExists()) {
            $this->command->info('Aggregations data already exists. Deleting old data...');
            Aggregation::query()->delete();
        }

        $this->command->info('Starting to seed aggregations data...');

        $endDate = Carbon::now();
        $startDate = $endDate->copy()->subYear();

        $hoursBetweenDates = Carbon::parse($startDate)->hoursUntil($endDate)->count();
        $daysBetweenDates = Carbon::parse($startDate)->daysUntil($endDate)->count();
        $weeksBetweenDates = Carbon::parse($startDate)->weeksUntil($endDate)->count();
        $monthsBetweenDates = Carbon::parse($startDate)->monthsUntil($endDate)->count();
        $yearsBetweenDates = Carbon::parse($startDate)->yearsUntil($endDate)->count();

        $totalRecords = collect([
            $hoursBetweenDates,
            $daysBetweenDates,
            $weeksBetweenDates,
            $monthsBetweenDates,
            $yearsBetweenDates,
        ])->sum() * count($this->modelTypes) * count($this->aggregationTypes);

        $this->command->getOutput()->progressStart($totalRecords);

        foreach ($this->granularities as $granularity) {
            if ($granularity === 'year') {
                collect(Carbon::parse($startDate)->yearsUntil($endDate))
                    ->map(fn ($date) => $date->startOfYear())
                    ->flatMap(fn ($date) => collect($this->modelTypes)->map(
                        fn ($modelType) => collect($this->aggregationTypes)->map(
                            fn ($aggregationType) => $this->createAggregation($modelType, $aggregationType, 'year', $date)
                        )
                    ))
                    ->flatten(1)
                    ->chunk($this->batchSize)
                    ->each(function ($chunk) {
                        Aggregation::insert($chunk->toArray());
                        $this->command->getOutput()->progressAdvance($chunk->count());
                    });
            }

            if ($granularity === 'month') {
                collect(Carbon::parse($startDate)->monthsUntil($endDate))
                    ->map(fn ($date) => $date->startOfMonth())
                    ->flatMap(fn ($date) => collect($this->modelTypes)->map(
                        fn ($modelType) => collect($this->aggregationTypes)->map(
                            fn ($aggregationType) => $this->createAggregation($modelType, $aggregationType, 'month', $date)
                        )
                    ))
                    ->flatten(1)
                    ->chunk($this->batchSize)
                    ->each(function ($chunk) {
                        Aggregation::insert($chunk->toArray());
                        $this->command->getOutput()->progressAdvance($chunk->count());
                    });
            }

            if ($granularity === 'week') {
                collect(Carbon::parse($startDate)->weeksUntil($endDate))
                    ->map(fn ($date) => $date->startOfWeek())
                    ->flatMap(fn ($date) => collect($this->modelTypes)->map(
                        fn ($modelType) => collect($this->aggregationTypes)->map(
                            fn ($aggregationType) => $this->createAggregation($modelType, $aggregationType, 'week', $date)
                        )
                    ))
                    ->flatten(1)
                    ->chunk($this->batchSize)
                    ->each(function ($chunk) {
                        Aggregation::insert($chunk->toArray());
                        $this->command->getOutput()->progressAdvance($chunk->count());
                    });
            }

            if ($granularity === 'day') {
                collect(Carbon::parse($startDate)->daysUntil($endDate))
                    ->map(fn ($date) => $date->startOfDay())
                    ->flatMap(fn ($date) => collect($this->modelTypes)->map(
                        fn ($modelType) => collect($this->aggregationTypes)->map(
                            fn ($aggregationType) => $this->createAggregation($modelType, $aggregationType, 'day', $date)
                        )
                    ))
                    ->flatten(1)
                    ->chunk($this->batchSize)
                    ->each(function ($chunk) {
                        Aggregation::insert($chunk->toArray());
                        $this->command->getOutput()->progressAdvance($chunk->count());
                    });
            }

            if ($granularity === 'hour') {
                collect(Carbon::parse($startDate)->hoursUntil($endDate))
                    ->map(fn ($date) => $date->startOfHour())
                    ->flatMap(fn ($date) => collect($this->modelTypes)->map(
                        fn ($modelType) => collect($this->aggregationTypes)->map(
                            fn ($aggregationType) => $this->createAggregation($modelType, $aggregationType, 'hour', $date)
                        )
                    ))
                    ->flatten(1)
                    ->chunk($this->batchSize)
                    ->each(function ($chunk) {
                        Aggregation::insert($chunk->toArray());
                        $this->command->getOutput()->progressAdvance($chunk->count());
                    });
            }
        }
        
        $this->command->getOutput()->progressFinish();
        $this->command->info("\nAggregations data seeded successfully.");
    }

    protected function createAggregation($modelType, $aggregationType, $granularity, $date)
    {
        return [
            'model_type' => $modelType,
            'aggregation_type' => $aggregationType,
            'granularity' => $granularity,
            'period' => $date,
            'value' => $this->generateRealisticValue($modelType, $aggregationType, $granularity, $date),
            'created_at' => $date,
            'updated_at' => $date,
        ];
    }

    protected function advanceDate(Carbon $date, $granularity)
    {
        switch ($granularity) {
            case 'hour':
                return $date->addHour();
            case 'day':
                return $date->addDay();
            case 'week':
                return $date->addWeek();
            case 'month':
                return $date->addMonth();
            case 'year':
                return $date->addYear();
        }
    }

    protected function checkIfDataExists(): bool
    {
        return Aggregation::count() > 0;
    }

    protected function generateRealisticValue($modelType, $aggregationType, $granularity, $date)
    {
        $baseValue = $this->getBaseValue($modelType, $date);

        switch ($aggregationType) {
            case 'count':
                return $this->generateCount($baseValue, $granularity);
            case 'sum':
                return $this->generateSum($baseValue, $granularity);
            case 'avg':
                return $this->generateAverage($baseValue);
            case 'min':
                return $this->generateMin($baseValue);
            case 'max':
                return $this->generateMax($baseValue);
        }
    }

    protected function getBaseValue($modelType, $date)
    {
        // Simulate seasonal trends and growth
        $dayOfYear = $date->dayOfYear;
        $yearFactor = 1 + ($date->year - $date->copy()->subYears(2)->year) * 0.1;
        $seasonalFactor = 1 + sin($dayOfYear / 365 * 2 * M_PI) * 0.2;

        switch ($modelType) {
            case 'Order':
                return 10 * $yearFactor * $seasonalFactor;
            case 'Customer':
                return 1 * $yearFactor * $seasonalFactor;
        }
    }

    protected function generateCount($baseValue, $granularity)
    {
        $multiplier = $this->getGranularityMultiplier($granularity);

        return round($baseValue * $multiplier * (0.8 + lcg_value() * 0.4));
    }

    protected function generateSum($baseValue, $granularity)
    {
        $multiplier = $this->getGranularityMultiplier($granularity);

        return round($baseValue * $multiplier * (0.8 + lcg_value() * 0.4));
    }

    protected function generateAverage($baseValue)
    {
        return round($baseValue * (0.9 + lcg_value() * 0.2), 2);
    }

    protected function generateMin($baseValue)
    {
        return round($baseValue * (0.5 + lcg_value() * 0.3), 2);
    }

    protected function generateMax($baseValue)
    {
        return round($baseValue * (1.2 + lcg_value() * 0.3), 2);
    }

    protected function getGranularityMultiplier($granularity)
    {
        switch ($granularity) {
            case 'hour':
                return 1;
            case 'day':
                return 24;
            case 'week':
                return 168;
            case 'month':
                return 720;
            case 'year':
                return 8760;
        }
    }
}
