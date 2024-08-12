<?php

namespace App\Http\Controllers;

use App\Http\Requests\GetAggregationsRequest;
use App\Models\Aggregation;
use Carbon\Carbon;
use Illuminate\Routing\Controllers\Middleware;

class AggregationController extends Controller
{
    public static function middleware(): array
    {
        return [
            new Middleware('auth:sanctum'),
        ];
    }

    public function index(GetAggregationsRequest $request)
    {
        $dateRange = $this->parseDateRange($request->date_range);

        $data = Aggregation::forModel($request->model_type)
            ->forAggregation($request->aggregation_type)
            ->forGranularity($request->granularity)
            ->forPeriod($dateRange['start'], $dateRange['end'])
            ->orderBy('period')
            ->get();

        return response()->json([
            'data' => $data->map(function ($item) {
                return [
                    'x' => $item->period,
                    'value' => $item->value,
                ];
            }),
        ]);
    }

    private function parseDateRange($dateRange)
    {
        switch ($dateRange) {
            case 'This year':
                return [
                    'start' => Carbon::now()->startOfYear(),
                    'end' => Carbon::now()->endOfYear(),
                ];
            case 'Last year':
                return [
                    'start' => Carbon::now()->subYear()->startOfYear(),
                    'end' => Carbon::now()->subYear()->endOfYear(),
                ];
            case 'This month':
                return [
                    'start' => Carbon::now()->startOfMonth(),
                    'end' => Carbon::now()->endOfMonth(),
                ];
            case 'Last month':
                return [
                    'start' => Carbon::now()->subMonth()->startOfMonth(),
                    'end' => Carbon::now()->subMonth()->endOfMonth(),
                ];
            case 'This week':
                return [
                    'start' => Carbon::now()->startOfWeek(),
                    'end' => Carbon::now()->endOfWeek(),
                ];
            case 'Last week':
                return [
                    'start' => Carbon::now()->subWeek()->startOfWeek(),
                    'end' => Carbon::now()->subWeek()->endOfWeek(),
                ];
            case 'This day':
                return [
                    'start' => Carbon::today(),
                    'end' => Carbon::today()->endOfDay(),
                ];
            case 'Last day':
                return [
                    'start' => Carbon::yesterday(),
                    'end' => Carbon::yesterday()->endOfDay(),
                ];
            default:
                try {
                    $dates = json_decode($dateRange, true);

                    return [
                        'start' => Carbon::parse($dates[0]),
                        'end' => Carbon::parse($dates[1]),
                    ];
                } catch (\JsonException $e) {
                    throw new \InvalidArgumentException('Invalid date range format');
                }
        }
    }
}
