<?php

namespace App\Notifications;

use App\Models\Show;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class GuestListNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public Show $show;
    public string $pdfPath;

    public function __construct(Show $show, string $pdfPath)
    {
        $this->show = $show;
        $this->pdfPath = $pdfPath;
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Guest List for {$this->show->event->name}")
            ->line("The guest list for {$this->show->event->name} is attached.")
            ->attach($this->pdfPath);
    }
}
