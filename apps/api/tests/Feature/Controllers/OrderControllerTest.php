<?php

namespace Tests\Feature\Controllers;

use App\Actions\CreatePaymentAction;
use App\Jobs\HandleCustomerJob;
use App\Models\Order;
use App\Models\Product;
use App\Models\Show;
use Illuminate\Support\Facades\Queue;
use Mockery\MockInterface;
use Tests\TestCase;

class OrderControllerTest extends TestCase
{
    protected $show;

    protected $products;

    public function setUp(): void
    {
        parent::setUp();

        $this->show = Show::factory()->create();
        $this->products = Product::factory()->count(2)->create();

        $this->show->products()->attach($this->products->pluck('id'), [
            'amount' => 10,
        ]);
    }

    public function test_store_order_successfully()
    {
        Queue::fake();

        $requestData = [
            'show_id' => $this->show->id,
            'products' => $this->products->map(fn ($product) => ['id' => $product->id, 'amount' => 1])->toArray(),
            'redirect_url' => 'http://example.com',
            'tos' => true,
        ];

        $response = $this->postJson(route('orders.store'), $requestData);

        $response->assertStatus(201);
        $this->assertDatabaseHas('orders', ['show_id' => $this->show->id]);
    }

    public function test_store_order_with_customer_data()
    {
        Queue::fake();

        $requestData = [
            'show_id' => $this->show->id,
            'customer' => [
                'email' => 'customer@example.com',
                'first_name' => 'John',
                'last_name' => 'Doe',
                'street' => '123 Main St',
                'city' => 'Springfield',
                'postal_code' => '62701',
                'state' => 'IL',
                'country' => 'United States',
            ],
            'products' => $this->products->map(fn ($product) => ['id' => $product->id, 'amount' => 1])->toArray(),
            'redirect_url' => 'http://example.com',
            'tos' => true,
        ];

        $response = $this->postJson(route('orders.store'), $requestData);

        $response->assertStatus(201);
        $this->assertDatabaseHas('orders', ['show_id' => $this->show->id]);

        Queue::assertPushed(HandleCustomerJob::class);
    }

    public function test_store_order_handles_payment_exception()
    {
        $requestData = [
            'show_id' => $this->show->id,
            'products' => $this->products->map(fn ($product) => ['id' => $product->id, 'amount' => 1])->toArray(),
            'redirect_url' => 'http://example.com',
            'tos' => true,
        ];

        // Fake the queue
        Queue::fake();

        $this->mock(CreatePaymentAction::class, function (MockInterface $mock) {
            // mock the handle method to throw an exception
            $mock->shouldReceive('handle')->andThrow(new \Exception('Payment error'));
        });

        Queue::assertNothingPushed();

        $response = $this->postJson(route('orders.store'), $requestData);

        $response->assertStatus(500);
        $this->assertDatabaseMissing('orders', ['show_id' => $this->show->id]);
    }

    public function test_create_payment_link_successfully()
    {
        $order = Order::factory()->create([
            'total' => '10.00',
        ]);

        $requestData = ['redirect_url' => 'http://example.com'];

        $response = $this->postJson(route('orders.payment-link', $order), $requestData);

        $response->assertStatus(200);
        $response->assertJsonStructure(['payment_url']);
    }

    public function test_create_payment_link_handles_exception()
    {
        $order = Order::factory()->create();
        $requestData = ['redirect_url' => 'http://example.com'];

        $this->mock(CreatePaymentAction::class, function (MockInterface $mock) {
            $mock->shouldReceive('handle')->andThrow(new \Exception('Payment error'));
        });

        $response = $this->postJson(route('orders.payment-link', $order), $requestData);

        $response->assertStatus(500);
    }

    public function test_is_paid_returns_true_for_paid_order()
    {
        $order = Order::factory()->create(['status' => 'paid']);

        $response = $this->getJson(route('orders.is-paid', $order));

        $response->assertStatus(200);
        $response->assertJson(['is_paid' => true]);
    }

    public function test_is_paid_returns_false_for_unpaid_order()
    {
        $order = Order::factory()->create(['status' => 'pending']);

        $response = $this->getJson(route('orders.is-paid', $order));

        $response->assertStatus(200);
        $response->assertJson(['is_paid' => false]);
    }

    public function test_index_returns_orders()
    {
        Order::factory()->count(3)->create();

        $response = $this->getJson(route('orders.index'));

        $response->assertStatus(200);
        $response->assertJsonCount(3);
    }

    public function test_show_returns_order()
    {
        $order = Order::factory()->create();

        $response = $this->getJson(route('orders.show', ['show' => $order->show_id, 'order' => $order->id]));

        $response->assertStatus(200);
        $response->assertJson(['id' => $order->id]);
    }

    public function test_update_order()
    {
        $order = Order::factory()->create();
        $updateData = ['status' => 'paid'];

        $response = $this->putJson(route('orders.update', $order), $updateData);

        $response->assertStatus(200);
        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'paid']);
    }

    public function test_destroy_order()
    {
        $order = Order::factory()->create();

        $response = $this->deleteJson(route('orders.destroy', $order));

        $response->assertStatus(200);
        $this->assertDatabaseMissing('orders', ['id' => $order->id]);
    }

    public function test_store_order_with_no_products()
    {
        $requestData = [
            'show_id' => $this->show->id,
            'products' => [],
            'redirect_url' => 'http://example.com',
            'tos' => true,
        ];

        $response = $this->postJson(route('orders.store'), $requestData);

        $response->assertStatus(422);
    }

    public function test_store_order_with_only_upsell_products()
    {
        $upsellProduct = Product::factory()->create(['is_upsell' => true]);
        $this->show->products()->attach($upsellProduct->id, ['amount' => 10]);

        $requestData = [
            'show_id' => $this->show->id,
            'products' => [['id' => $upsellProduct->id, 'amount' => 1]],
            'redirect_url' => 'http://example.com',
            'tos' => true,
        ];

        $response = $this->postJson(route('orders.store'), $requestData);

        $response->assertStatus(201);
        $this->assertDatabaseHas('orders', ['show_id' => $this->show->id]);

        // Assert that no tickets were generated
        $this->assertDatabaseMissing('tickets', ['order_id' => $response->json('order.id')]);
    }
}
