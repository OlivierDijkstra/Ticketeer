<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\HtmlString;

class TicketsNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public Order $order;

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

        $pdf = $order->getPdf();

        return (new MailMessage)
            ->subject('Tickets for '.$event->name)
            ->greeting('Hello '.$notifiable->name)
            ->line('You have purchased '.$this->order->quantity.' tickets for '.$event->name.' on '.$pretty_formatted_start_date.' at '.$pretty_formatted_time)
            ->line('The tickets have been attached to this email.')
            ->line(new HtmlString($show->email_description))
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
