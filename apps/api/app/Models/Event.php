<?php

namespace App\Models;

use App\Traits\Searchable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Http\UploadedFile;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class Event extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia, Searchable, SoftDeletes;

    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('blur')
            ->width(10)
            ->quality(25)
            ->blur(10)
            ->nonQueued();
    }

    protected $fillable = [
        'name',
        'slug',
        'statistics_slug',
        'service_price',
        'description',
        'description_short',
        'enabled',
        'featured',
    ];

    protected $casts = [
        'service_price' => 'float',
        'enabled' => 'boolean',
        'featured' => 'boolean',
    ];

    // protected $appends = ['images'];

    // public function getImagesAttribute()
    // {
    //     $media = $this->media->map(function ($media) {
    //         return [
    //             'id' => $media->id,
    //             'name' => $media->name,
    //             'file_name' => $media->file_name,
    //             'mime_type' => $media->mime_type,
    //             'url' => $media->getFullUrl(),
    //             'base64' => $media->getCustomProperty('base64'),
    //         ];
    //     });

    //     // $this->makeHidden('media');

    //     return $media;
    // }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function addMediaAndGenerateBase64(UploadedFile $file): Media
    {
        $media = $this->addMedia($file)->toMediaCollection();

        $media->setCustomProperty('base64', 'data:image/png;base64,'.base64_encode(file_get_contents($media->getPath('blur'))));
        $media->save();

        return $media;
    }

    public function shows()
    {
        return $this->hasMany(Show::class);
    }

    // public function orders()
    // {
    //     return $this->hasManyThrough(Order::class, Show::class);
    // }

    // When created, generate a slug
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function ($event) {
            $event->statistics_slug = $event->slug;
        });

        static::retrieved(function ($event) {
            $event->load('media');
        });
    }
}
