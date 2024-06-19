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
        Schema::create('orders', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->foreignId('show_id')
                ->constrained();

            $table->foreignUuid('customer_id')
                ->nullable()
                ->constrained()
                ->onDelete('cascade');

            $table->string('order_number')
                ->unique();

            $table->enum('status', ['pending', 'paid', 'cancelled', 'refunded', 'partially_refunded'])
                ->default('pending');

            $table->longText('description')
                ->nullable();

            $table->decimal('service_fee', 10, 2)
                ->nullable();

            $table->decimal('total', 10, 2)
                ->nullable();

            $table->decimal('discount', 10, 2)
                ->nullable();

            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
