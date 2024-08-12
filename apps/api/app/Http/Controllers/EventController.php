<?php

namespace App\Http\Controllers;

use App\Http\Requests\IndexEventRequest;
use App\Http\Requests\StoreEventMediaRequest;
use App\Http\Requests\StoreEventRequest;
use App\Http\Requests\UpdateEventRequest;
use App\Models\Event;
use App\Traits\HandlesPaginationAndFiltering;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Str;

class EventController extends Controller implements HasMiddleware
{
    use HandlesPaginationAndFiltering;

    public static function middleware(): array
    {
        return [
            new Middleware('auth:sanctum', only: ['store', 'update', 'destroy', 'addMedia', 'deleteMedia']),
        ];
    }

    /**
     * Display a listing of the resource.
     *
     * Params
     * - page: int
     * - per_page: int
     * - search: string
     */
    public function index(IndexEventRequest $request)
    {
        return $this->searchOrPaginate($request, Event::query());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreEventRequest $request)
    {
        $event = Event::create($request->validated());

        return response($event, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Event $event)
    {
        return $event;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateEventRequest $request, Event $event)
    {
        if ($request->has('featured')) {
            Event::where('featured', true)->update(['featured' => false]);
        }

        $event->update($request->validated());

        if ($request->has('name')) {
            $event->slug = Str::slug($request->name);
            $event->save();
        }

        return $event;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Event $event)
    {
        $event->delete();

        return $event;
    }

    /**
     * Add media to the specified resource.
     */
    public function addMedia(StoreEventMediaRequest $request, Event $event)
    {
        $media = $request->file('media');

        foreach ($media as $file) {
            $event->addMediaAndGenerateBase64($file);
        }

        $event->load('media');

        return $event;
    }

    /**
     * Remove media from the specified resource.
     */
    public function deleteMedia(Event $event, int $mediaId)
    {
        $media = $event->media()->where('id', $mediaId)->first();

        if ($media->getCustomProperty('cover')) {
            $otherMedia = $event->media()->where('id', '!=', $mediaId)->first();

            if ($otherMedia) {
                $otherMedia->setCustomProperty('cover', true);
                $otherMedia->save();
            }
        }

        $event->getMedia()->where('id', $mediaId)->first()->delete();

        $event->load('media');

        return $event;
    }

    /**
     * Set featured media for the specified resource.
     */
    public function setMediaCover(Event $event, int $mediaId)
    {
        $currentCover = $event->media()->where('custom_properties->cover', true)->first();

        if ($currentCover) {
            $currentCover->setCustomProperty('cover', false);
            $currentCover->save();
        }

        $media = $event->media()->where('id', $mediaId)->first();

        $media->setCustomProperty('cover', true);

        $media->save();

        $event->load('media');

        return $event;
    }
}
