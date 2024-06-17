<?php

namespace App\Traits;

use Exception;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Laravel\Scout\Builder as ScoutBuilder;

trait HandlesPaginationAndFiltering
{
    private $defaultPerPage = 6;

    private $pivotFieldsCache = [];

    /**
     * Handle search or pagination based on the presence of 'search' parameter.
     *
     * @param  Request  $request  The HTTP request object.
     * @param  Builder  $query  The Eloquent query builder.
     * @return mixed The paginated results or the search results.
     */
    public function searchOrPaginate(Request $request, Builder $query)
    {
        if ($request->has('search')) {
            return $this->search($request, $query, $request->input('search'));
        }

        // Apply filters
        $query = $this->applyFilters($request, $query);

        // Apply pagination only if 'page' parameter is present
        if ($request->has('page') || $request->has('per_page')) {
            $results = $this->paginate($request, $query);
            return $this->flattenPivotFields($results, $request);
        }

        return $query->get();
    }

    /**
     * Paginate the given query with a default or specified per page value.
     *
     * @param  Request  $request  The HTTP request object.
     * @param  Builder  $query  The Eloquent query builder.
     * @return LengthAwarePaginator The paginated results.
     */
    private function paginate(Request $request, Builder $query): LengthAwarePaginator
    {
        $perPage = $request->input('per_page', $this->defaultPerPage);

        $parsed = json_decode($request->sort, true);

        if ($parsed) {
            $query->orderBy($parsed['id'], $parsed['desc'] ? 'desc' : 'asc');
        }

        return $query->paginate($perPage);
    }

    /**
     * Apply various filters to the query based on the request parameters.
     *
     * @param  Request  $request  The HTTP request object.
     * @param  Builder|ScoutBuilder  $query  The Eloquent query builder or Scout builder.
     * @return Builder|ScoutBuilder The query builder with applied filters.
     */
    private function applyFilters(Request $request, Builder|ScoutBuilder $query)
    {
        // Apply basic filters
        $filters = ['enabled', 'event_id', 'customer_id'];
        foreach ($filters as $filter) {
            if ($request->has($filter)) {
                $query->where($filter, $request->input($filter));
            }
        }

        // Apply show_id filter if present
        if ($request->has('show_id')) {
            $this->applyShowIdFilter($request, $query);
        }

        return $query;
    }

    /**
     * Apply the filter for show_id, handling different types of relationships.
     *
     * @param  Request  $request  The HTTP request object.
     * @param  Builder  $query  The Eloquent query builder.
     *
     * @throws Exception If no valid relation is found.
     */
    private function applyShowIdFilter(Request $request, Builder $query): void
    {
        $model = $query->getModel();
        $relation = $this->getShowRelation($model);

        if ($relation) {
            if ($relation instanceof \Illuminate\Database\Eloquent\Relations\BelongsTo) {
                // Handle BelongsTo relationship
                $query->where($relation->getForeignKeyName(), $request->input('show_id'));
            } else {
                // Handle Many-to-Many relationship
                $pivotTable = $relation->getTable();
                $pivotFields = $this->getPivotFields($pivotTable);

                // Apply the filter and include pivot fields
                $query->whereHas($relation->getRelationName(), function ($q) use ($request) {
                    $q->where('shows.id', $request->input('show_id'));
                })->with([$relation->getRelationName() => function ($q) use ($pivotFields, $pivotTable, $request) {
                    $q->where('shows.id', $request->input('show_id'));

                    foreach ($pivotFields as $field) {
                        $q->addSelect("$pivotTable.$field as pivot_$field");
                    }
                }]);
            }
        } else {
            throw new Exception("No valid 'shows' or 'show' relation found on the model.");
        }
    }

    /**
     * Perform a search and apply filters to the search results.
     *
     * @param  Request  $request  The HTTP request object.
     * @param  Builder  $query  The Eloquent query builder.
     * @param  string|null  $searchQuery  The search query string or null.
     * @return \Illuminate\Support\Collection The search results.
     */
    private function search(Request $request, Builder $query, ?string $searchQuery): \Illuminate\Support\Collection
    {
        $query_by = 'name';

        if ($query->getModel() instanceof \App\Models\Customer) {
            $query_by = 'first_name, last_name';
        }

        if ($query->getModel() instanceof \App\Models\Show) {
            $query_by = 'start';
        }

        $search = $query->getModel()::search($searchQuery ?? '')->options([
            'query_by' => $query_by,
        ]);

        $search = $this->applyFilters($request, $search);

        return $search->get();
    }

    /**
     * Flatten pivot fields for Many-to-Many relationships in the results.
     *
     * @param  LengthAwarePaginator  $results  The paginated results.
     * @param  Request  $request  The HTTP request object.
     * @return LengthAwarePaginator The transformed results with flattened pivot fields.
     */
    private function flattenPivotFields(LengthAwarePaginator $results, Request $request): LengthAwarePaginator
    {
        if (! $request->has('show_id')) {
            return $results;
        }

        // Transform results to include pivot fields
        $results->getCollection()->transform(function ($item) {
            if ($item->relationLoaded('shows')) {
                foreach ($item->shows as $show) {
                    $pivot = [];
                    foreach ($show->pivot->getAttributes() as $field => $value) {
                        $pivot[$field] = $value;
                    }
                    $item->setAttribute('pivot', $pivot);
                }
                unset($item->shows); // Remove the original shows relationship
            }

            return $item;
        });

        return $results;
    }

    /**
     * Get the list of pivot fields for a given pivot table.
     *
     * @param  string  $pivotTable  The name of the pivot table.
     * @return array The list of pivot fields.
     */
    private function getPivotFields(string $pivotTable): array
    {
        if (! isset($this->pivotFieldsCache[$pivotTable])) {
            $this->pivotFieldsCache[$pivotTable] = Schema::getColumnListing($pivotTable);
        }

        return $this->pivotFieldsCache[$pivotTable];
    }

    /**
     * Determine the relationship method for shows.
     *
     * @param  mixed  $model  The model instance.
     * @return \Illuminate\Database\Eloquent\Relations\Relation|null The relationship method or null if not found.
     */
    private function getShowRelation($model): ?Relation
    {
        if (method_exists($model, 'shows')) {
            return $model->shows();
        } elseif (method_exists($model, 'show')) {
            return $model->show();
        }

        return null;
    }
}
