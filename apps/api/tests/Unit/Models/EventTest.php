<?php

namespace Tests\Unit\Models;

use App\Models\Event;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class EventTest extends TestCase
{
    public function test_add_media_and_generate_base64()
    {
        $event = Event::factory()->create();
        $file = UploadedFile::fake()->image('test.jpg');

        $media = $event->addMediaAndGenerateBase64($file);

        $this->assertNotNull($media->getCustomProperty('base64'));
    }

    public function test_get_route_key_name()
    {
        $event = new Event();
        $this->assertEquals('slug', $event->getRouteKeyName());
    }

    public function test_boot_creating()
    {
        $event = Event::factory()->make(['slug' => 'test-slug']);
        $event->save();

        $this->assertEquals('test-slug', $event->statistics_slug);
    }

    public function test_boot_retrieved()
    {
        $event = Event::factory()->create();
        $retrievedEvent = Event::find($event->id);

        $this->assertTrue($retrievedEvent->relationLoaded('media'));
    }
}
