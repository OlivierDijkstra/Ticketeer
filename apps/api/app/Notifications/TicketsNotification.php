<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Spatie\TemporaryDirectory\TemporaryDirectory;
use Illuminate\Support\HtmlString;

use function Spatie\LaravelPdf\Support\pdf;

class TicketsNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected Order $order;

    /**
     * Create a new notification instance.
     */
    public function __construct(Order $order)
    {
        $this->order = $order;
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
        $event = $this->order->event;
        $show = $this->order->show;

        $pretty_formatted_start_date = $show->start->format('d/m/Y');
        $pretty_formatted_time = $show->start->format('H:i');

        $order = $this->order;

        $tempDirectory = TemporaryDirectory::make();

        $file_path = $tempDirectory->path('tickets.pdf');

        $pdf = pdf()
            ->format('A4')
            ->view('pdf.tickets', compact('order'))
            ->save($file_path);

        return (new MailMessage)
            ->subject('Tickets for '.$event->name)
            ->greeting('Hello '.$notifiable->name)
            ->line('You have purchased '.$this->order->quantity.' tickets for '.$event->name.' on '.$pretty_formatted_start_date.' at '.$pretty_formatted_time)
            ->line('The tickets have been attached to this email.')
            ->line(new HtmlString($show->email_description))
            ->attach($file_path);
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
