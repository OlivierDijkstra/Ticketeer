<?php

namespace Tests\Unit\Models;

use App\Models\Show;
use Tests\TestCase;

class ShowTest extends TestCase
{
    public function test_address_created_on_show_created()
    {
        $show = Show::factory()->create();
        $this->assertDatabaseHas('addresses', ['addressable_id' => $show->id, 'addressable_type' => Show::class]);
    }

    public function test_address_deleted_on_show_deleted()
    {
        $show = Show::factory()->create();
        $show->delete();
        $this->assertDatabaseMissing('addresses', ['addressable_id' => $show->id, 'addressable_type' => Show::class]);
    }
}
