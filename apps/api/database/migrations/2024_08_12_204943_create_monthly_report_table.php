<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('monthly_reports', function (Blueprint $table) {
            $table->id();
            $table->date('month');
            $table->decimal('total_revenue', 15, 2);
            $table->integer('total_orders');
            $table->integer('new_customers');
            $table->integer('tickets_sold');
            $table->json('top_products');
            $table->json('revenue_by_event');
            $table->decimal('customer_acquisition_rate', 8, 4);
            $table->decimal('average_order_value', 10, 2);
            $table->json('show_product_sales');
            $table->timestamps();

            $table->index('month');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('monthly_reports');
    }
};
