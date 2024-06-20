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
        'service_fee',
        'description',
        'description_short',
        'enabled',
        'featured',
    ];

    protected $casts = [
        'service_fee' => 'float',
        'enabled' => 'boolean',
        'featured' => 'boolean',
    ];

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
