<?php

namespace App\Jobs;

use App\Models\Show;
use App\Models\User;
use App\Notifications\GuestListNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use Spatie\Browsershot\Browsershot;
use Spatie\LaravelPdf\Facades\Pdf;

class GenerateGuestListPdfJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public Show $show,
        protected User $user
    ) {}

    public function handle(): void
    {
        if (! Storage::exists('tmp')) {
            Storage::makeDirectory('tmp');
        }

        $file_path = storage_path("app/tmp/{$this->show->id}-guest-list.pdf");

        if (Storage::exists($file_path)) {
            Storage::delete($file_path);
        }

        $tickets = $this->show->tickets()
            ->with(['order.customer', 'product'])
            ->get();

        Pdf::view('pdf.guest-list', [
            'show' => $this->show,
            'event' => $this->show->event,
            'tickets' => $tickets,
        ])
            ->withBrowsershot(function (Browsershot $browsershot) {
                $browsershot
                    ->noSandbox()
                    ->showBackground();
            })
            ->format('a4')
            ->save($file_path);

        $this->user->notify(new GuestListNotification($this->show, $file_path));
    }
}
