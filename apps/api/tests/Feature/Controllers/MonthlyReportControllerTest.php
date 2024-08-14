<?php

namespace Tests\Feature\Controllers;

use App\Models\MonthlyReport;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MonthlyReportControllerTest extends TestCase
{
    protected $monthlyReport;

    public function setUp(): void
    {
        parent::setUp();

        MonthlyReport::factory()->count(5)->create();

        $this->monthlyReport = MonthlyReport::first();
    }

    public function test_index()
    {
        Sanctum::actingAs($this->user);

        $response = $this->getJson(route('monthly-reports.index'));

        $response->assertStatus(200);
        $response->assertJsonCount(5);
    }

    public function test_show()
    {
        Sanctum::actingAs($this->user);

        $response = $this->getJson(route('monthly-reports.show', $this->monthlyReport->id));

        $response->assertStatus(200);
        $response->assertJson(['id' => $this->monthlyReport->id]);
    }

    public function test_unauthenticated_access()
    {
        $response = $this->getJson(route('monthly-reports.index'));

        $response->assertStatus(401);
    }
}
