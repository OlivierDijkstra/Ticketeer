<?php

namespace App\Http\Requests;

use Carbon\Carbon;
use Illuminate\Foundation\Http\FormRequest;

class GetAggregationsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'model_type' => 'required|string|in:Order,Customer,Revenue',
            'aggregation_type' => 'required|string|in:count,sum,avg,min,max',
            'granularity' => 'required|string|in:hour,day,week,month,year',
            'date_range' => ['required', function ($attribute, $value, $fail) {
                $validRanges = ['This year', 'Last year', 'This month', 'Last month', 'This week', 'Last week', 'This day', 'Last day'];

                if (in_array($value, $validRanges)) {
                    return;
                }

                // Check if the value is a JSON-encoded array
                if (is_string($value)) {
                    try {
                        $dates = json_decode($value, true);
                        if (is_array($dates) && count($dates) === 2) {
                            foreach ($dates as $date) {
                                if (! Carbon::parse($date)->isValid()) {
                                    $fail('The date range must contain valid dates in ISO 8601 format (YYYY-MM-DD).');

                                    return;
                                }
                            }

                            return;
                        }
                    } catch (\JsonException $e) {
                        // If JSON decoding fails, it's not a valid JSON string
                    }
                }

                $fail('The date range must be a valid preset or a JSON-encoded array of two dates.');
            }],
        ];
    }
}
