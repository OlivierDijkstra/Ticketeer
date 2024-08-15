<?php

use App\Jobs\AggregateDataJob;
use App\Jobs\GenerateMonthlyReportJob;
use Illuminate\Support\Facades\Schedule;

Schedule::job(new AggregateDataJob('hour'))->hourly(0);
Schedule::job(new AggregateDataJob('day'))->dailyAt('00:00');
Schedule::job(new AggregateDataJob('week'))->weekly();
Schedule::job(new AggregateDataJob('month'))->monthly();
Schedule::job(new AggregateDataJob('year'))->yearly();

Schedule::job(new GenerateMonthlyReportJob)->monthly();

Schedule::command('app:clean-tmp-directory')->daily();
