<?php

namespace Tests\Unit\Traits;

use App\Models\Event;
use App\Models\Product;
use App\Models\Show;
use App\Traits\HandlesPaginationAndFiltering;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Laravel\Scout\Builder as ScoutBuilder;
use Mockery as m;
use Tests\TestCase;

class HandlesPaginationAndFilteringTest extends TestCase
{
    use HandlesPaginationAndFiltering;

    public function setUp(): void
    {
        parent::setUp();

        $event = Event::factory()->create();

        $shows = Show::factory()->count(10)->create([
            'event_id' => $event->id,
            'enabled' => 1,
        ]);

        $products = Product::factory()->count(10)->create();

        foreach ($shows as $show) {
            $show->products()->attach($products->random(2)->pluck('id'), [
                'amount' => rand(1, 10),
                'adjusted_price' => rand(10, 100),
                'enabled' => rand(0, 1),
            ]);
        }
    }

    public function tearDown(): void
    {
        m::close();
        parent::tearDown();
    }

    public function test_search_or_paginate_without_search()
    {
        $request = new Request([
            'per_page' => 5,
            'enabled' => 1,
        ]);

        $query = Show::query();

        $result = $this->searchOrPaginate($request, $query);

        $this->assertInstanceOf(LengthAwarePaginator::class, $result);
        $this->assertCount(5, $result->items());
    }

    public function test_search_or_paginate_with_search()
    {
        $request = new Request([
            'search' => 'test',
        ]);

        $query = m::mock(Builder::class);
        $query->shouldReceive('getModel')->andReturn(new Show);
        $query->shouldReceive('get')->andReturn(collect());

        $result = $this->searchOrPaginate($request, $query);

        $this->assertInstanceOf(\Illuminate\Support\Collection::class, $result);
    }

    public function test_search_or_paginate_without_filters()
    {
        $request = new Request([
            'page' => 1,
            'per_page' => 5,
        ]);

        $query = Show::query();

        $result = $this->searchOrPaginate($request, $query);

        $this->assertInstanceOf(LengthAwarePaginator::class, $result);
    }

    public function test_search_or_paginate_with_invalid_show_id()
    {
        $request = new Request([
            'show_id' => 999999, // Assume this ID does not exist
            'page' => 1,
            'per_page' => 5,
        ]);

        $query = Product::query();

        $result = $this->searchOrPaginate($request, $query);

        $this->assertInstanceOf(LengthAwarePaginator::class, $result);
        $this->assertCount(0, $result->items());
    }

    public function test_paginate()
    {
        $request = new Request([
            'per_page' => 3,
        ]);

        $query = Show::query();

        $result = $this->paginate($request, $query);

        $this->assertInstanceOf(LengthAwarePaginator::class, $result);
        $this->assertCount(3, $result->items());
    }

    public function test_apply_filters()
    {
        $request = new Request([
            'enabled' => 1,
            'event_id' => 1,
        ]);

        $query = Show::query();

        $result = $this->applyFilters($request, $query);

        $this->assertInstanceOf(Builder::class, $result);
    }

    public function test_apply_filters_with_show_id()
    {
        $request = new Request([
            'show_id' => Show::first()->id,
        ]);

        $query = Product::query();

        $result = $this->applyFilters($request, $query);

        $this->assertInstanceOf(Builder::class, $result);
        $this->assertTrue($result->getQuery()->wheres != []);
    }

    public function test_apply_filters_with_belongs_to_relationship()
    {
        $request = new Request([
            'show_id' => Show::first()->id,
        ]);

        $query = Product::query();

        $result = $this->applyFilters($request, $query);

        $this->assertInstanceOf(Builder::class, $result);
        $this->assertTrue($result->getQuery()->wheres != []);
    }

    public function test_flatten_pivot_fields()
    {
        $request = new Request([
            'show_id' => Show::first()->id,
        ]);

        $query = Product::query();
        $query = $this->applyFilters($request, $query);

        $results = $query->paginate(5);

        $flattenedResults = $this->flattenPivotFields($results, $request);

        foreach ($flattenedResults as $product) {
            $this->assertArrayHasKey('pivot', $product->toArray());
            $this->assertArrayHasKey('amount', $product->pivot);
            $this->assertArrayHasKey('adjusted_price', $product->pivot);
            $this->assertArrayHasKey('enabled', $product->pivot);
        }
    }

    public function test_flatten_pivot_fields_with_empty_results()
    {
        $request = new Request([
            'show_id' => 999999, // Assume this ID does not exist
        ]);

        $query = Product::query();
        $query = $this->applyFilters($request, $query);

        $results = $query->paginate(5);

        $flattenedResults = $this->flattenPivotFields($results, $request);

        $this->assertCount(0, $flattenedResults->items());
    }

    public function test_get_pivot_fields()
    {
        $pivotFields = $this->getPivotFields('product_show');

        $this->assertIsArray($pivotFields);
        $this->assertContains('product_id', $pivotFields);
        $this->assertContains('show_id', $pivotFields);
        $this->assertContains('amount', $pivotFields);
        $this->assertContains('adjusted_price', $pivotFields);
        $this->assertContains('enabled', $pivotFields);
    }

    public function test_get_show_relation()
    {
        $product = new Product();

        $relation = $this->getShowRelation($product);

        $this->assertNotNull($relation);
        $this->assertEquals('shows', $relation->getRelationName());
    }

    public function test_search()
    {
        $request = new Request([
            'search' => 'test',
            'enabled' => 1,
        ]);

        $query = m::mock(Builder::class);
        $query->shouldReceive('getModel')->andReturn(new Show);
        $searchQuery = 'test';

        $modelSearch = m::mock(ScoutBuilder::class);
        $modelSearch->shouldReceive('get')->andReturn(collect());
        $modelSearch->shouldReceive('where')->andReturn($modelSearch);

        $result = $this->search($request, $query, $searchQuery);

        $this->assertInstanceOf(\Illuminate\Support\Collection::class, $result);
    }

    public function test_invalid_show_id_throws_exception()
    {
        $request = new Request([
            'show_id' => 'invalid', // Invalid show_id
        ]);

        $query = Show::query();

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage("No valid 'shows' or 'show' relation found on the model.");

        $this->applyFilters($request, $query);
    }

    public function test_paginate_with_default_per_page()
    {
        $request = new Request();

        $query = Show::query();

        $result = $this->paginate($request, $query);

        $this->assertInstanceOf(LengthAwarePaginator::class, $result);
        $this->assertEquals($this->defaultPerPage, $result->perPage());
    }

    public function test_belongs_to_relationship_without_pivot()
    {
        $request = new Request([
            'show_id' => Show::first()->id,
        ]);

        $query = Product::query();

        $result = $this->applyFilters($request, $query);

        $this->assertInstanceOf(Builder::class, $result);
        $this->assertTrue($result->getQuery()->wheres != []);
    }

    public function test_flatten_pivot_fields_without_show_id()
    {
        $request = new Request();

        $query = Product::query();
        $query = $this->applyFilters($request, $query);

        $results = $query->paginate(5);

        $flattenedResults = $this->flattenPivotFields($results, $request);

        $this->assertEquals($results, $flattenedResults);
    }

    public function test_handling_large_datasets()
    {
        // Simulate a large number of products and shows
        $shows = Show::factory()->count(50)->create([
            'event_id' => Event::factory()->create()->id,
        ]);

        $products = Product::factory()->count(100)->create();

        foreach ($shows as $show) {
            $show->products()->attach($products->random(50)->pluck('id'), [
                'amount' => rand(1, 10),
                'adjusted_price' => rand(10, 100),
                'enabled' => rand(0, 1),
            ]);
        }

        $request = new Request([
            'show_id' => $shows->random()->id,
        ]);

        $query = Product::query();
        $query = $this->applyFilters($request, $query);

        $results = $query->paginate(50);

        $flattenedResults = $this->flattenPivotFields($results, $request);

        $this->assertInstanceOf(LengthAwarePaginator::class, $flattenedResults);
        $this->assertCount(50, $flattenedResults->items());
    }

    public function test_get_show_relation_returns_null_for_invalid_relation()
    {
        $model = new class
        {
            public function invalidRelation()
            {
                return null;
            }
        };

        $relation = $this->getShowRelation($model);

        $this->assertNull($relation);
    }

    public function test_search_or_paginate_without_page_parameter()
    {
        $request = new Request([
            'enabled' => 1,
        ]);

        $query = Show::query();

        $result = $this->searchOrPaginate($request, $query);

        $this->assertInstanceOf(\Illuminate\Support\Collection::class, $result);
        $this->assertCount(10, $result); // Assuming there are 10 shows created in the setup
    }
}
