<?php

use App\Http\Controllers\MollieWebhookController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return ['Laravel' => app()->version()];
});

Route::post('/webhooks/mollie', MollieWebhookController::class)->name('webhooks.mollie');

require __DIR__ . '/auth.php';
