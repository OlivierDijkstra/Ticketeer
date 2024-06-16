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
        Schema::create('product_show', function (Blueprint $table) {
            $table->id();

            $table->foreignId('show_id')
                ->constrained()
                ->onDelete('cascade');

            $table->foreignId('product_id')
                ->references('id')
                ->on('products');

            $table->integer('amount')
                ->default(0);

            $table->decimal('adjusted_price', 10, 2)
                ->nullable();

            $table->boolean('enabled')
                ->default(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_show');
    }
};
