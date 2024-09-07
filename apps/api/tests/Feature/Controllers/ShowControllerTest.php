<?php

namespace Tests\Feature\Controllers;

use App\Jobs\GenerateGuestListPdfJob;
use App\Models\Event;
use App\Models\Order;
use App\Models\Product;
use App\Models\Show;
use App\Models\Ticket;
use Illuminate\Support\Facades\Queue;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ShowControllerTest extends TestCase
{
    protected $event;

    protected $show;

    protected $product;

    public function setUp(): void
    {
        parent::setUp();

        $this->event = Event::factory()->create();
        $this->show = Show::factory()->create(['event_id' => $this->event->id]);
        $this->product = Product::factory()->create();
    }

    public function test_index()
    {
        $response = $this->getJson(route('shows.index', $this->event));

        $response->assertStatus(200);
        $response->assertJsonCount(1);
    }

    public function test_store()
    {
        Sanctum::actingAs($this->user);

        $start = now()->toDateTimeString();
        $end = now()->addHour()->toDateTimeString();

        $response = $this->postJson(route('shows.store', $this->event), [
            'start' => $start,
            'end' => $end,
            'enabled' => true,
            'description' => 'This is a description',
            'guests' => ['John Doe', 'Jane Doe'],
        ]);

        $response->assertStatus(201);
        $response->assertJson(['description' => 'This is a description']);

        $this->assertDatabaseHas('shows', [
            'start' => $start,
            'end' => $end,
            'enabled' => true,
            'description' => 'This is a description',
        ]);
    }

    public function test_show()
    {
        $response = $this->getJson(route('shows.show', [$this->show]));

        $response->assertStatus(200);
    }

    public function test_update()
    {
        Sanctum::actingAs($this->user);

        $newDescription = 'New description';
        $start = now()->toDateTimeString();
        $end = now()->addHour()->toDateTimeString();

        $response = $this->patchJson(route('shows.update', [$this->show]), [
            'start' => $start,
            'end' => $end,
            'description' => $newDescription,
            'enabled' => $this->show->enabled,
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('shows', [
            'start' => $start,
            'end' => $end,
            'description' => $newDescription,
        ]);
    }

    public function test_destroy()
    {
        Sanctum::actingAs($this->user);

        $response = $this->deleteJson(route('shows.destroy', [$this->show]));

        $response->assertStatus(200);

        $this->assertSoftDeleted('shows', ['id' => $this->show->id]);
    }

    public function test_add_product()
    {
        Sanctum::actingAs($this->user);

        $response = $this->postJson(route('shows.products.add', [$this->show, $this->product]), [
            'product_id' => $this->product->id,
            'amount' => 10,
            'adjusted_price' => 10.5,
            'enabled' => true,
        ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('product_show', [
            'product_id' => $this->product->id,
            'show_id' => $this->show->id,
            'amount' => 10,
            'adjusted_price' => 10.5,
            'enabled' => true,
        ]);
    }

    public function test_remove_product()
    {
        Sanctum::actingAs($this->user);

        $this->show->products()->attach($this->product->id, [
            'amount' => 10,
            'adjusted_price' => 10.5,
            'enabled' => true,
        ]);

        $response = $this->deleteJson(route('shows.products.remove', [$this->show, $this->product]));

        $response->assertStatus(200);

        $this->assertDatabaseMissing('product_show', [
            'product_id' => $this->product->id,
            'show_id' => $this->show->id,
        ]);
    }

    public function test_update_product()
    {
        Sanctum::actingAs($this->user);

        $this->show->products()->attach($this->product->id, [
            'amount' => 10,
            'adjusted_price' => 10.5,
            'enabled' => true,
        ]);

        $newAmount = 20;
        $newPrice = 200;

        $response = $this->putJson(route('shows.products.update', [$this->show, $this->product]), [
            'amount' => $newAmount,
            'adjusted_price' => $newPrice,
            'enabled' => true,
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('product_show', [
            'product_id' => $this->product->id,
            'show_id' => $this->show->id,
            'amount' => $newAmount,
            'adjusted_price' => $newPrice,
            'enabled' => true,
        ]);
    }

    public function test_search()
    {
        Sanctum::actingAs($this->user);

        $search = $this->show->start;

        $response = $this->getJson(route('shows.index', ['search' => $search]));

        $response->assertStatus(200);
        $response->assertJsonFragment(['start' => $search->toISOString()]);
    }

    public function test_pagination()
    {
        Show::factory()->count(4)->create(['event_id' => $this->event->id]);

        $response = $this->getJson(route('shows.index', ['page' => 1, 'per_page' => 5]));

        $response->assertStatus(200);
        $response->assertJsonCount(5, 'data');
    }

    public function test_generate_guest_list()
    {
        Queue::fake();

        Sanctum::actingAs($this->user);

        $show = Show::factory()->create();

        $orders = Order::factory()->create([
            'show_id' => $show->id,
        ]);

        $orders->each(function ($order) {
            Ticket::factory()->count(2)->create([
                'order_id' => $order->id,
            ]);
        });

        $response = $this->postJson(route('shows.guest-list', $show));

        $response->assertStatus(200);
        $response->assertJson(['message' => 'Guest list generation started']);

        Queue::assertPushed(GenerateGuestListPdfJob::class, function ($job) use ($show) {
            return $job->show->id === $show->id;
        });
    }
}
