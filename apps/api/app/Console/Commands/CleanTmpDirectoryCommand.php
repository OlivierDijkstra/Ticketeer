<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class CleanTmpDirectoryCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:clean-tmp-directory';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean the tmp directory in storage';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        Storage::deleteDirectory('tmp');
    }
}
