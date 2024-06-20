<?php

namespace Tests\Feature\Controllers;

use App\Models\Product;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProductControllerTest extends TestCase
{
    public function setUp(): void
    {
        parent::setUp();

        Product::factory()->count(10)->create();
    }

    public function test_index()
    {
        Sanctum::actingAs($this->user);

        $response = $this->getJson(route('products.index'));

        $response->assertStatus(200);
    }

    public function test_store()
    {
        Sanctum::actingAs($this->user);

        $response = $this->postJson(route('products.store'), [
            'name' => 'Test',
            'description' => 'Test',
            'price' => 10.00,
            'vat' => 0,
            'is_upsell' => false,
        ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('products', [
            'name' => 'Test',
            'description' => 'Test',
        ]);
    }

    public function test_show()
    {
        Sanctum::actingAs($this->user);

        $product = Product::first();

        $response = $this->getJson(route('products.show', $product));

        $response->assertStatus(200);
    }

    public function test_update()
    {
        Sanctum::actingAs($this->user);

        $needle = 'Test';

        $product = Product::first();

        $response = $this->putJson(route('products.update', $product), [
            ...$product->toArray(),
            'description' => $needle,
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('products', [
            'name' => $product->name,
            'description' => $needle,
        ]);

        $this->assertDatabaseMissing('products', [
            'name' => $product->name,
            'description' => $product->description,
        ]);
    }

    public function test_destroy()
    {
        Sanctum::actingAs($this->user);

        $product = Product::first();

        $response = $this->deleteJson(route('products.destroy', $product));

        $response->assertStatus(200);

        $this->assertDatabaseMissing('products', [
            'name' => $product->name,
            'description' => $product->description,
            'deleted_at' => null,
        ]);
    }

    public function test_update_product()
    {
        $product = Product::factory()->create();
        $updateData = ['name' => 'Updated Product'];

        $response = $this->putJson(route('products.update', $product), $updateData);

        $response->assertStatus(200);
        $this->assertDatabaseHas('products', ['id' => $product->id, 'name' => 'Updated Product']);
    }

    public function test_destroy_product()
    {
        $product = Product::factory()->create();

        $response = $this->deleteJson(route('products.destroy', $product));

        $response->assertStatus(200);
        $this->assertSoftDeleted('products', ['id' => $product->id]);
    }
}
