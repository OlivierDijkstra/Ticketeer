<?php

namespace App\Models;

use BaconQrCode\Renderer\Color\Rgb;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\Fill;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ticket extends Model
{
    use HasFactory;

    protected $fillable = ['order_id', 'product_id', 'unique_code', 'is_used', 'used_at'];

    protected $with = ['product'];

    /**
     * Get the QR code SVG for the ticket.
     *
     * @return string
     */
    public function qrCodeSvg()
    {
        $svg = (new Writer(
            new ImageRenderer(
                new RendererStyle(192, 0, null, null, Fill::uniformColor(new Rgb(255, 255, 255), new Rgb(45, 55, 72))),
                new SvgImageBackEnd
            )
        ))->writeString($this->qrCodeUrl());

        return trim(substr($svg, strpos($svg, "\n") + 1));
    }

    /**
     * Get the URL for the QR code.
     *
     * @return string
     */
    public function qrCodeUrl()
    {
        $data = [
            'ticket_id' => $this->id,
            'unique_code' => $this->unique_code,
            'event_id' => $this->order->show->event_id,
        ];

        return route('tickets.validate', ['data' => base64_encode(json_encode($data))]);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
