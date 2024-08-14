<?php

namespace App\Console\Commands;

use App\Jobs\GenerateMonthlyReportJob;
use Carbon\Carbon;
use Illuminate\Console\Command;

class GenerateMonthlyReportCommand extends Command
{
    protected $signature = 'report:generate {date? : The date for which to generate the report (format: Y-m-d)}';

    protected $description = 'Generate a monthly report for debugging purposes';

    public function handle()
    {
        $dateString = $this->argument('date');
        $date = $dateString ? Carbon::createFromFormat('Y-m-d', $dateString)->startOfMonth() : null;

        $this->info('Dispatching GenerateMonthlyReport job...');
        GenerateMonthlyReportJob::dispatch($date);
        $this->info('Job dispatched successfully.');

        if ($date) {
            $this->info('Report will be generated for the month of: '.$date->format('F Y'));
        } else {
            $this->info('Report will be generated for the previous month.');
        }
    }
}
