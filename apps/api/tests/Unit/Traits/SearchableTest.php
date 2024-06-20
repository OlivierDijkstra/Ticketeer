<?php

namespace Tests\Unit\Traits;

use App\Models\Show;
use Illuminate\Support\Facades\Config;
use Tests\TestCase;

class SearchableTest extends TestCase
{
    public function test_to_searchable_array()
    {
        Config::set('scout.driver', null);

        $model = Show::factory()->create([
            'created_at' => now(),
            'guests' => json_encode(['key', 'value']),
        ]);

        $searchableArray = $model->toSearchableArray();

        $this->assertIsArray($searchableArray);
        $this->assertArrayHasKey('id', $searchableArray);
        $this->assertArrayHasKey('created_at', $searchableArray);
        $this->assertEquals($model->created_at->timestamp, $searchableArray['created_at']);
        $this->assertIsArray($searchableArray['guests']);
    }

    public function test_to_searchable_array_with_database()
    {
        Config::set('scout.driver', 'database');

        $model = Show::factory()->create([
            'created_at' => now(),
            'guests' => json_encode(['key', 'value']),
        ]);

        $searchableArray = $model->toSearchableArray();

        $this->assertIsArray($searchableArray);
        $this->assertArrayHasKey('id', $searchableArray);
        $this->assertArrayHasKey('created_at', $searchableArray);
        $this->assertEquals($model->created_at->toJSON(), $searchableArray['created_at']);
        $this->assertIsString($searchableArray['guests']);
    }
}
