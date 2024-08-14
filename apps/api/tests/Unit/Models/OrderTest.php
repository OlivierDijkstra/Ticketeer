<?php

namespace Tests\Unit\Models;

use App\Models\Customer;
use App\Models\Event;
use App\Models\Order;
use App\Models\Product;
use App\Models\Show;
use Spatie\LaravelPdf\Facades\Pdf;
use Spatie\LaravelPdf\PdfBuilder;
use Tests\TestCase;

class OrderTest extends TestCase
{
    public function setUp(): void
    {
        parent::setUp();
        Pdf::fake();
    }

    public function test_order_has_payments()
    {
        $order = Order::factory()->create();
        $this->assertInstanceOf('Illuminate\Database\Eloquent\Collection', $order->payments);
    }

    public function test_order_has_products()
    {
        $order = Order::factory()->create();
        $this->assertInstanceOf('Illuminate\Database\Eloquent\Collection', $order->products);
    }

    public function test_order_belongs_to_show()
    {
        $order = Order::factory()->create();
        $this->assertInstanceOf(Show::class, $order->show);
    }

    public function test_order_has_one_through_event()
    {
        $order = Order::factory()->create();
        $this->assertInstanceOf(Event::class, $order->event);
    }

    public function test_order_belongs_to_customer()
    {
        $order = Order::factory()->create();
        $this->assertInstanceOf(Customer::class, $order->customer);
    }

    public function test_sub_total_from_products()
    {
        $order = Order::factory()->create();
        $product = Product::factory()->create(['price' => 100]);
        $order->products()->attach($product, ['amount' => 2, 'price' => 100]);

        $this->assertEquals(200, $order->subTotalFromProducts());
    }

    public function test_total_from_products()
    {
        $order = Order::factory()->create();
        $product = Product::factory()->create(['price' => 100]);
        $order->products()->attach($product, ['amount' => 2, 'price' => 100]);

        $this->assertEquals(200, $order->totalFromProducts());
    }

    public function test_generate_order_number()
    {
        $orderNumber = Order::GenerateOrderNumber();
        $this->assertStringStartsWith('ORD-', $orderNumber);
    }

    public function test_pdf_name_attribute()
    {
        $order = Order::factory()->create(['order_number' => 'ORD-12345']);
        $this->assertEquals('ORD-12345.pdf', $order->pdf_name);
    }

    public function test_generate_pdf()
    {
        $order = Order::factory()->create(['order_number' => 'ORD-12345']);
        $order->generatePDF();

        Pdf::assertSaved(function (PdfBuilder $pdf, string $path) {
            return $path === storage_path('app/tmp/ORD-12345.pdf');
        });
    }

    public function test_get_pdf()
    {
        $order = Order::factory()->create(['order_number' => 'ORD-12345']);
        $pdfPath = $order->getPdf();

        $this->assertStringContainsString('tmp/ORD-12345.pdf', $pdfPath);

        Pdf::assertSaved(function (PdfBuilder $pdf, string $path) {
            return $path === storage_path('app/tmp/ORD-12345.pdf');
        });
    }
}