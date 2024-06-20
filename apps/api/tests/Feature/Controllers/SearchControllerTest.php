<?php

namespace Tests\Feature\Controllers;

use App\Models\Event;
use Tests\TestCase;

class SearchControllerTest extends TestCase
{
    public $event;

    public function setUp(): void
    {
        parent::setUp();

        Event::factory()->create([
            'name' => 'test',
        ]);
    }

    public function test_search()
    {
        $response = $this->json('GET', route('search', [
            'query' => 'test',

        ]));

        $response->assertStatus(200);
        $response->assertJsonCount(4);
        $response->assertJsonCount(1, 'events');
    }

    public function test_search_no_query()
    {
        $response = $this->json('GET', route('search'));

        $response->assertStatus(200);
        $response->assertJsonCount(0);
    }
}
