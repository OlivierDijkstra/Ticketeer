<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Spatie\Browsershot\Browsershot;

use function Spatie\LaravelPdf\Support\pdf;

class Order extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'show_id',
        'customer_id',
        'order_number',
        'status',
        'description',
        'service_fee',
        'total',
        'discount',
        'refunded_amount',
    ];

    protected $with = ['products', 'show', 'customer', 'payments', 'tickets'];

    public function getPdfNameAttribute()
    {
        return $this->order_number . '.pdf';
    }

    public function tickets()
    {
        return $this->hasMany(Ticket::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function products()
    {
        return $this->belongsToMany(Product::class)
            ->withPivot('amount', 'price');
    }

    public function show()
    {
        return $this->belongsTo(Show::class);
    }

    public function event()
    {
        return $this->hasOneThrough(Event::class, Show::class, 'id', 'id', 'show_id', 'event_id');
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function subTotalFromProducts()
    {
        return $this->products->map(function ($product) {
            $price = $product->pivot->price;

            return $product->pivot->amount * $price;
        })->sum();
    }

    public function totalFromProducts()
    {
        // TODO: Implement discounts
        return $this->subTotalFromProducts();
    }

    // TODO: change case to camel
    public static function GenerateOrderNumber()
    {
        do {
            $number = 'ORD-'.now()->format('YmdHis').'-'.Str::random(4);
        } while (self::where('order_number', $number)->exists());

        return $number;
    }

    private function ensureTmpDirectoryExists()
    {
        if (! Storage::exists('tmp')) {
            Storage::makeDirectory('tmp');
        }
    }

    private function getPdfFilePath()
    {
        return storage_path("app/tmp/{$this->order_number}.pdf");
    }

    public function generatePDF()
    {
        $this->ensureTmpDirectoryExists();

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
            ->view('pdf.tickets', ['order' => $this])
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
