<?php

use App\Jobs\AggregateDataJob;
use Illuminate\Support\Facades\Schedule;

Schedule::job(new AggregateDataJob('hour'))->hourly(0);
Schedule::job(new AggregateDataJob('day'))->dailyAt('00:00');
Schedule::job(new AggregateDataJob('week'))->weekly();
Schedule::job(new AggregateDataJob('month'))->monthly();
Schedule::job(new AggregateDataJob('year'))->yearly();
