<?php

namespace Tests\Unit\Models;

use App\Models\MonthlyReport;
use Carbon\Carbon;
use Spatie\LaravelPdf\Facades\Pdf;
use Spatie\LaravelPdf\PdfBuilder;
use Tests\TestCase;

class MonthlyReportTest extends TestCase
{
    public function setUp(): void
    {
        parent::setUp();
        Carbon::setTestNow('2023-05-15');

        Pdf::fake();
    }

    public function test_monthly_report_has_factory()
    {
        $monthlyReport = MonthlyReport::factory()->create();
        $this->assertInstanceOf(MonthlyReport::class, $monthlyReport);
    }

    public function test_fillable_attributes()
    {
        $monthlyReport = new MonthlyReport;
        $fillable = [
            'month',
            'total_revenue',
            'total_orders',
            'new_customers',
            'tickets_sold',
            'top_products',
            'revenue_by_event',
            'customer_acquisition_rate',
            'average_order_value',
            'show_product_sales',
        ];
        $this->assertEquals($fillable, $monthlyReport->getFillable());
    }

    public function test_casts_attributes()
    {
        $monthlyReport = new MonthlyReport;
        $casts = [
            'month' => 'date',
            'top_products' => 'array',
            'revenue_by_event' => 'array',
            'show_product_sales' => 'array',
            'id' => 'int',
        ];
        $this->assertEquals($casts, $monthlyReport->getCasts());
    }

    public function test_scope_for_month()
    {
        MonthlyReport::factory()->create(['month' => '2023-05-01']);
        MonthlyReport::factory()->create(['month' => '2023-06-01']);

        $reports = MonthlyReport::forMonth('2023-05')->get();
        $this->assertCount(1, $reports);
        $this->assertEquals('2023-05-01', $reports->first()->month->format('Y-m-d'));
    }

    public function test_month_name_attribute()
    {
        $monthlyReport = MonthlyReport::factory()->create(['month' => '2023-05-01']);
        $this->assertEquals('May 2023', $monthlyReport->month_name);
    }

    public function test_pdf_name_attribute()
    {
        $monthlyReport = MonthlyReport::factory()->create(['month' => '2023-05-01']);
        $this->assertEquals('2023-05-monthly-report.pdf', $monthlyReport->pdf_name);
    }

    public function test_compare_with_previous_month()
    {
        MonthlyReport::factory()->create([
            'month' => '2023-04-01',
            'total_revenue' => 1000,
            'total_orders' => 50,
            'new_customers' => 20,
            'tickets_sold' => 100,
            'customer_acquisition_rate' => 0.4,
            'average_order_value' => 20,
        ]);

        $currentReport = MonthlyReport::factory()->create([
            'month' => '2023-05-01',
            'total_revenue' => 1500,
            'total_orders' => 75,
            'new_customers' => 30,
            'tickets_sold' => 150,
            'customer_acquisition_rate' => 0.5,
            'average_order_value' => 25,
        ]);

        $comparison = $currentReport->compareWithPreviousMonth();

        $this->assertEquals(500, $comparison['total_revenue_change']);
        $this->assertEquals(25, $comparison['total_orders_change']);
        $this->assertEquals(10, $comparison['new_customers_change']);
        $this->assertEquals(50, $comparison['tickets_sold_change']);
        $this->assertEquals(0.1, $comparison['customer_acquisition_rate_change']);
        $this->assertEquals(5, $comparison['average_order_value_change']);
    }

    public function test_generate_pdf()
    {
        $monthlyReport = MonthlyReport::factory()->create(['month' => '2023-05-01']);
        $monthlyReport->generatePDF();

        Pdf::assertSaved(function (PdfBuilder $pdf, string $path) {
            return $path === storage_path('app/reports/2023-05-monthly-report.pdf');
        });
    }

    public function test_get_pdf()
    {
        $monthlyReport = MonthlyReport::factory()->create(['month' => '2023-05-01']);
        $pdfPath = $monthlyReport->getPdf();

        $this->assertStringContainsString('reports/2023-05-monthly-report.pdf', $pdfPath);

        Pdf::assertSaved(function (PdfBuilder $pdf, string $path) {
            return $path === storage_path('app/reports/2023-05-monthly-report.pdf');
        });
    }
}
