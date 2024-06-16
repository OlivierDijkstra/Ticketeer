<?php

namespace App\Http\Controllers;

use App\Stats\CustomerStats;
use App\Stats\OrderStats;
use App\Stats\RevenueStats;
use DateTime;
use Illuminate\Http\Request;
use Spatie\Stats\StatsQuery;

class StatsController extends Controller
{
    public $availableStats = [
        'customer' => CustomerStats::class,
        'revenue' => RevenueStats::class,
        'order' => OrderStats::class,
    ];

    public function index(Request $request)
    {
        $model = $request->query('model');
        $start_date = $request->query('start_date');
        $end_date = $request->query('end_date');
        $group_by = $request->query('group_by');

        $statsClass = $this->availableStats[$model];

        $start = new DateTime($start_date);
        $end = new DateTime($end_date);

        // $request->query('filters') is a json encoded object, we need to decode it
        $requestFilters = $request->query('filters');

        if ($requestFilters) {
            $filters = json_decode($requestFilters, true);
        } else {
            $filters = [];
        }

        $filters = [
            'name' => class_basename($statsClass),
            ...$filters,
        ];

        $stats = StatsQuery::for($statsClass, $filters)
            ->start($start)
            ->end($end);

        switch ($group_by) {
            case 'day':
                $stats = $stats->groupByDay();
                break;
            case 'week':
                $stats = $stats->groupByWeek();
                break;
            case 'month':
                $stats = $stats->groupByMonth();
                break;
            case 'year':
                $stats = $stats->groupByYear();
                break;
        }

        return $stats->get();
    }
}
