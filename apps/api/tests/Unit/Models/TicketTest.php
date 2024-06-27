<?php

namespace Tests\Unit\Models;

use App\Models\Ticket;
use App\Models\Order;
use App\Models\Product;
use App\Models\Show;
use App\Models\Event;
use Tests\TestCase;

class TicketTest extends TestCase
{
    protected $ticket;

    public function setUp(): void
    {
        parent::setUp();

        $event = Event::factory()->create();
        $show = Show::factory()->create(['event_id' => $event->id]);
        $order = Order::factory()->create(['show_id' => $show->id]);
        $product = Product::factory()->create();

        $this->ticket = Ticket::factory()->create([
            'order_id' => $order->id,
            'product_id' => $product->id,
        ]);
    }

    public function test_ticket_belongs_to_order()
    {
        $this->assertInstanceOf(Order::class, $this->ticket->order);
    }

    public function test_ticket_belongs_to_product()
    {
        $this->assertInstanceOf(Product::class, $this->ticket->product);
    }

    public function test_qr_code_svg_generation()
    {
        $svg = $this->ticket->qrCodeSvg();

        $this->assertStringStartsWith('<svg', $svg);
        $this->assertStringEndsWith('</svg>', $svg);
    }

    public function test_qr_code_url_generation()
    {
        $url = $this->ticket->qrCodeUrl();

        $this->assertStringStartsWith(config('app.url'), $url);
        $this->assertStringContainsString('tickets/validate', $url);
        $this->assertStringContainsString('data=', $url);
    }

    public function test_qr_code_url_contains_correct_data()
    {
        $url = $this->ticket->qrCodeUrl();
        $parsedUrl = parse_url($url);
        parse_str($parsedUrl['query'], $queryParams);
        $data = json_decode(base64_decode($queryParams['data']), true);

        $this->assertEquals($this->ticket->id, $data['ticket_id']);
        $this->assertEquals($this->ticket->unique_code, $data['unique_code']);
        $this->assertEquals($this->ticket->order->show->event_id, $data['event_id']);
    }
}
