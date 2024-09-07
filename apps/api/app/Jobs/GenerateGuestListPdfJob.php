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
        $pdfPath = storage_path("app/guest-lists/{$this->show->id}-guest-list.pdf");

        $tickets = $this->show->tickets()
            ->with(['order.customer', 'product'])
            ->get();

        Pdf::view('pdf.guest-list', [
            'show' => $this->show,
            'event' => $this->show->event,
            'tickets' => $tickets,
        ])
            ->format('a4')
            ->save($pdfPath);

        $this->user->notify(new GuestListNotification($this->show, $pdfPath));
    }
}
