<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_show', function (Blueprint $table) {
            $table->integer('stock')
                ->after('amount')
                ->default(0);
        });
    }

    public function down(): void
    {
        Schema::table('product_show', function (Blueprint $table) {
            $table->dropColumn('stock');
        });
    }
};
