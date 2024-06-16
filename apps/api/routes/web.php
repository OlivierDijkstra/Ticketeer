<?php

use App\Http\Controllers\MollieWebhookController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([], 200);
});

Route::post('/webhooks/mollie', MollieWebhookController::class)->name('webhooks.mollie');
