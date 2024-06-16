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
        Schema::create('payments', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->foreignUuid('order_id')
                ->constrained()
                ->onDelete('cascade');

            $table->string('transaction_id')
                ->nullable()
                ->unique();

            $table->enum('status', ['open', 'paid', 'cancelled', 'refunded', 'partially_refunded', 'failed', 'chargeback'])
                ->default('open');

            $table->float('amount');

            $table->string('payment_method')
                ->nullable();

            $table->float('refunded_amount')
                ->nullable();

            $table->timestamp('paid_at')
                ->nullable();

            $table->timestamp('refunded_at')
                ->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
