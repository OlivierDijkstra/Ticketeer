<?php

namespace Tests\Feature\Controllers;

use App\Models\User;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UserControllerTest extends TestCase
{
    public $test_user;

    public function setUp(): void
    {
        parent::setUp();

        $this->test_user = User::factory()->create();
    }

    public function test_index()
    {
        Sanctum::actingAs($this->test_user);

        $response = $this->getJson(route('users.index'));

        $response->assertStatus(200);
        // 2 because we have the test_user and the user created in the setUp
        $response->assertJsonCount(2);
    }

    public function test_store()
    {
        Sanctum::actingAs($this->test_user);

        $userData = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'password123',
        ];

        $response = $this->postJson(route('users.store'), $userData);

        $response->assertStatus(201);
        $response->assertJsonFragment(['name' => 'John Doe', 'email' => 'john@example.com']);

        $this->assertDatabaseHas('users', ['email' => 'john@example.com']);
    }

    public function test_show()
    {
        Sanctum::actingAs($this->test_user);

        $response = $this->getJson(route('users.show', $this->test_user));

        $response->assertStatus(200);
        $response->assertJson(['id' => $this->test_user->id, 'name' => $this->test_user->name]);
    }

    public function test_update()
    {
        Sanctum::actingAs($this->test_user);

        $updatedData = ['name' => 'Updated Name', 'email' => 'updated@example.com', 'password' => 'password123'];

        $response = $this->putJson(route('users.update', $this->test_user), $updatedData);

        $response->assertStatus(200);
        $this->assertDatabaseHas('users', ['id' => $this->test_user->id, 'name' => 'Updated Name', 'email' => 'updated@example.com']);
    }

    public function test_destroy()
    {
        Sanctum::actingAs($this->test_user);

        $response = $this->deleteJson(route('users.destroy', $this->test_user));

        $response->assertStatus(200);
        $this->assertDatabaseMissing('users', ['id' => $this->test_user->id]);
    }

    public function test_me()
    {
        Sanctum::actingAs($this->test_user);

        $response = $this->getJson(route('users.me'));

        $response->assertStatus(200);
        $response->assertJson(['id' => $this->test_user->id, 'name' => $this->test_user->name]);
    }

    public function test_unauthenticated_access()
    {
        $this->assertGuest();

        $response = $this->getJson(route('users.index'));

        $response->assertStatus(401);
    }
}
