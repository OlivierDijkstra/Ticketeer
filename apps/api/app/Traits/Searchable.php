<?php

namespace App\Traits;

use Laravel\Scout\Searchable as ScoutSearchable;

trait Searchable
{
    use ScoutSearchable;

    public function toSearchableArray(): array
    {
        if (config('scout.driver') === 'database') {
            return $this->toArray();
        }

        $casts = $this->getCasts();
        $dates = $this->getDates();

        // find any fields that are dates and convert them to a timestamp
        foreach ($dates as $date) {
            if (isset($this->{$date})) {
                $this->{$date} = $this->{$date}->timestamp;
            }
        }

        // find any fields that are json and convert them to an array
        foreach ($casts as $field => $cast) {
            if ($cast === 'json' && isset($this->{$field}) && is_string($this->{$field})) {
                $this->{$field} = json_decode($this->{$field}, true);
            }
        }

        return array_merge($this->toArray(), [
            'id' => (string) $this->id,
            'created_at' => $this->created_at->timestamp,
        ]);
    }
}
