<?php

namespace Tests\Feature\Controllers;

use App\Models\Event;
use Illuminate\Http\UploadedFile;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class EventControllerTest extends TestCase
{
    protected $event;

    public function setUp(): void
    {
        parent::setUp();

        Event::factory()->count(5)->create();

        $this->event = Event::first();
    }

    public function test_index()
    {
        $response = $this->getJson(route('events.index'));

        $response->assertStatus(200);
        $response->assertJsonCount(5);
    }

    public function test_featured()
    {
        $this->event->update(['featured' => true]);

        $response = $this->getJson(route('events.index', ['featured' => true]));

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'id' => $this->event->id,
        ]);
    }

    public function test_store()
    {
        Sanctum::actingAs($this->user);

        $response = $this->postJson(route('events.store'), [
            'name' => 'Test Event',
            'slug' => 'test-event',
            'service_fee' => 100.00,
            'description' => 'Test Description',
            'enabled' => true,
            'featured' => false,
        ]);

        $response->assertStatus(201);
        $response->assertJsonFragment([
            'name' => 'Test Event',
        ]);

        $this->assertDatabaseHas('events', [
            'name' => 'Test Event',
        ]);
    }

    public function test_show()
    {
        $response = $this->getJson(route('events.show', $this->event->slug));

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'id' => $this->event->id,
        ]);
    }

    public function test_update()
    {
        Sanctum::actingAs($this->user);

        $needle = 'Test';

        $response = $this->putJson(route('events.update', $this->event->slug), [
            ...$this->event->toArray(),
            'description' => $needle,
        ]);

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'description' => $needle,
        ]);
    }

    public function test_destroy()
    {
        Sanctum::actingAs($this->user);

        $response = $this->deleteJson(route('events.destroy', $this->event->slug));

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'id' => $this->event->id,
        ]);
    }

    public function test_add_media()
    {
        Sanctum::actingAs($this->user);

        $file = UploadedFile::fake()->image('test.jpg');

        $response = $this->postJson(route('events.media.add', $this->event->slug), [
            'media' => [
                $file,
            ],
        ]);

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'id' => $this->event->id,
        ]);
        $response->assertJsonCount(1, 'media');

        $this->assertDatabaseHas('media', [
            'model_id' => $this->event->id,
            'model_type' => Event::class,
        ]);
    }

    public function test_delete_media()
    {
        Sanctum::actingAs($this->user);

        $file = UploadedFile::fake()->image('test.jpg');

        $media = $this->event->addMediaAndGenerateBase64($file);

        $response = $this->deleteJson(route('events.media.delete', [$this->event->slug, $media->id]));

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'id' => $this->event->id,
        ]);

        $this->assertDatabaseMissing('media', [
            'model_id' => $this->event->id,
            'model_type' => Event::class,
        ]);
    }

    public function test_set_cover()
    {
        Sanctum::actingAs($this->user);

        $file = UploadedFile::fake()->image('test.jpg');

        $media = $this->event->addMediaAndGenerateBase64($file);

        $response = $this->putJson(route('events.media.cover', [$this->event->slug, $media->id]));

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'id' => $this->event->id,
        ]);
        $response->assertJsonCount(1, 'media');

        $this->assertDatabaseHas('media', [
            'model_id' => $this->event->id,
            'model_type' => Event::class,
        ]);
    }
}
