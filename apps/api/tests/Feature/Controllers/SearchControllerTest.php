<?php

namespace Tests\Feature\Controllers;

use App\Models\Event;
use Laravel\Sanctum\Sanctum;
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

        Sanctum::actingAs($this->user);
    }

    public function test_search()
    {
        $response = $this->getJson(route('search', [
            'query' => 'test',

        ]));

        $response->assertStatus(200);
        $response->assertJsonCount(4);
        $response->assertJsonCount(1, 'events');
    }

    public function test_search_no_query()
    {
        $response = $this->getJson(route('search'));

        $response->assertStatus(200);
        $response->assertJsonCount(0);
    }
}
