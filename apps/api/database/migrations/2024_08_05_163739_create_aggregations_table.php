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
        Schema::create('aggregations', function (Blueprint $table) {
            $table->id();
            $table->string('model_type');
            $table->string('aggregation_type');
            $table->string('granularity');
            $table->timestamp('period');
            $table->decimal('value', 15, 2);
            $table->timestamps();

            $table->index(['model_type', 'aggregation_type', 'granularity', 'period'], 'aggregations_composite_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('aggregations');
    }
};
