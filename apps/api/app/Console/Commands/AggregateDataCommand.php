<?php

namespace App\Console\Commands;

use App\Jobs\AggregateDataJob;
use Illuminate\Console\Command;

class AggregateDataCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:aggregate-data {granularity=day}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Aggregate data from the database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $granularity = $this->argument('granularity');

        $job = new AggregateDataJob($granularity);
        dispatch($job);
        $this->info("Aggregation job for {$granularity} granularity has been dispatched.");
    }
}
