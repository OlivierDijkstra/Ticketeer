<?php

use App\Http\Controllers\AddressController;
use App\Http\Controllers\AggregationController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PaymentsController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\ShowController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

//
// Users
//
Route::get('users/me', [UserController::class, 'me'])->name('users.me');
Route::apiResource('users', UserController::class);

//
// Customers
//
Route::apiResource('customers', CustomerController::class);

//
// Addresses
//
Route::apiResource('addresses', AddressController::class)->only(['show', 'update']);

//
// Products
//
Route::apiResource('products', ProductController::class);

//
// Events
//
Route::apiResource('events', EventController::class);

Route::prefix('events/{event}')->group(function () {
    Route::post('media', [EventController::class, 'addMedia'])->name('events.media.add');
    Route::delete('media/{media}', [EventController::class, 'deleteMedia'])->name('events.media.delete');
    Route::put('media/{media}/cover', [EventController::class, 'setMediaCover'])->name('events.media.cover');
});

//
// Shows
//
Route::apiResource('shows', ShowController::class)->except(['store']);
Route::post('events/{event}/shows', [ShowController::class, 'store'])->name('shows.store');

Route::prefix('shows/{show}')->group(function () {
    Route::post('products/{product}', [ShowController::class, 'addProduct'])->name('shows.products.add');
    Route::put('products/{product}', [ShowController::class, 'updateProduct'])->name('shows.products.update');
    Route::delete('products/{product}', [ShowController::class, 'removeProduct'])->name('shows.products.remove');
});

//
// Products
//
Route::apiResource('products', ProductController::class);

//
// Orders
//
Route::apiResource('orders', OrderController::class);
Route::post('orders/{order}/payment-link', [OrderController::class, 'createPaymentLink'])->name('orders.payment-link');
Route::get('orders/{order:order_number}/is-paid', [OrderController::class, 'isPaid'])->name('orders.is-paid');

//
// Payments
//
Route::get('orders/{order}/payments', [PaymentsController::class, 'index'])->name('payments.index');
Route::post('payments/{payment}/refund', [PaymentsController::class, 'refund'])->name('payments.refund');

//
// Aggregations
//
Route::get('aggregations', [AggregationController::class, 'index'])->name('aggregations.index');

//
// Search
//
Route::get('search', SearchController::class)->name('search');

//
// Tickets
//
Route::get('tickets/validate', [TicketController::class, 'validate'])->name('tickets.validate');

//
// Notifications
//
Route::post('notifications/tickets', [NotificationController::class, 'notifyTickets'])->name('notifications.tickets');
