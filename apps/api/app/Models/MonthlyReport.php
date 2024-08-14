<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use Spatie\Browsershot\Browsershot;

use function Spatie\LaravelPdf\Support\pdf;

class MonthlyReport extends Model
{
    use HasFactory;

    protected $fillable = [
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

    protected $casts = [
        'month' => 'date',
        'top_products' => 'array',
        'revenue_by_event' => 'array',
        'show_product_sales' => 'array',
    ];

    // Scopes
    public function scopeForMonth($query, $month)
    {
        return $query->where('month', Carbon::parse($month)->startOfMonth());
    }

    // Accessors
    public function getMonthNameAttribute()
    {
        return $this->month->format('F Y');
    }

    public function getPdfNameAttribute()
    {
        return $this->month->format('Y-m').'-monthly-report.pdf';
    }

    public function compareWithPreviousMonth()
    {
        $previousMonth = $this->month->copy()->subMonth();
        $previousReport = self::forMonth($previousMonth)->first();

        if (! $previousReport) {
            return null;
        }

        return [
            'total_revenue_change' => $this->total_revenue - $previousReport->total_revenue,
            'total_orders_change' => $this->total_orders - $previousReport->total_orders,
            'new_customers_change' => $this->new_customers - $previousReport->new_customers,
            'tickets_sold_change' => $this->tickets_sold - $previousReport->tickets_sold,
            'customer_acquisition_rate_change' => round($this->customer_acquisition_rate - $previousReport->customer_acquisition_rate, 2),
            'average_order_value_change' => $this->average_order_value - $previousReport->average_order_value,
        ];
    }

    private function ensureReportsDirectoryExists()
    {
        if (! Storage::exists('reports')) {
            Storage::makeDirectory('reports');
        }
    }

    private function getPdfFilePath()
    {
        return storage_path("app/reports/{$this->pdf_name}");
    }

    public function generatePDF()
    {
        $this->ensureReportsDirectoryExists();

        $file_path = $this->getPdfFilePath();

        if (Storage::exists($file_path)) {
            Storage::delete($file_path);
        }

        pdf()
            ->withBrowsershot(function (Browsershot $browsershot) {
                $browsershot
                    ->noSandbox()
                    ->showBackground();
            })
            ->format('A4')
            ->view('pdf.monthly-report', ['report' => $this])
            ->save($file_path);
    }

    public function getPdf()
    {
        $file_path = $this->getPdfFilePath();

        if (! Storage::exists($file_path)) {
            $this->generatePDF();
        }

        return $file_path;
    }
}
