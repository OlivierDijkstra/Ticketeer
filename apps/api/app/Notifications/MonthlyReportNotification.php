<?php

namespace App\Notifications;

use App\Models\MonthlyReport;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class MonthlyReportNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public MonthlyReport $report;

    /**
     * Create a new notification instance.
     */
    public function __construct(MonthlyReport $report)
    {
        $this->report = $report;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {   
        $pdf = $this->report->getPdf();

        return (new MailMessage)
                    ->subject('Monthly report is ready')
                    ->greeting('Hello '.$notifiable->name)
                    ->line('A monthly report is ready for you, please find it attached to this email.')
                    ->line('You can also find it in the reports section of the dashboard.')
                    ->attach($pdf);
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}
