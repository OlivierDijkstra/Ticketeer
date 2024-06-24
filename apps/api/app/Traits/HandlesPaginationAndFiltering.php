<?php

namespace App\Traits;

use Exception;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Laravel\Scout\Builder as ScoutBuilder;
use Illuminate\Support\Collection;

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

        $query = $this->applyFilters($request, $query);

        if ($request->has('page') || $request->has('per_page')) {
            $results = $this->paginate($request, $query);
            return $this->flattenPivotFields($results);
        }

        $results = $query->get();
        return $this->flattenPivotFields($results);
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
        $this->applySorting($request, $query);
        return $query->paginate($perPage);
    }

    /**
     * Apply sorting to the query based on the request parameters.
     *
     * @param  Request  $request  The HTTP request object.
     * @param  Builder  $query  The Eloquent query builder.
     * @return void
     */
    private function applySorting(Request $request, Builder $query): void
    {
        $sort = json_decode($request->input('sort', ''), true);
        if ($sort) {
            $query->orderBy($sort['id'], $sort['desc'] ? 'desc' : 'asc');
        }
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
        $this->applyBasicFilters($request, $query);
        if ($request->has('show_id')) {
            $query = $this->applyShowIdFilter($request, $query);
        }
        return $query;
    }

    /**
     * Apply basic filters to the query.
     *
     * @param  Request  $request  The HTTP request object.
     * @param  Builder|ScoutBuilder  $query  The Eloquent query builder or Scout builder.
     * @return void
     */
    private function applyBasicFilters(Request $request, Builder|ScoutBuilder $query): void
    {
        $filters = ['enabled', 'event_id', 'customer_id'];
        foreach ($filters as $filter) {
            if ($request->has($filter)) {
                $query->where($filter, $filter === 'enabled' ? (int) $request->input($filter) : $request->input($filter));
            }
        }
    }

    /**
     * Flatten pivot fields for Many-to-Many relationships in the results.
     *
     * @param  LengthAwarePaginator|Collection  $results  The results.
     * @param  Request  $request  The HTTP request object.
     * @return LengthAwarePaginator|Collection The transformed results with flattened pivot fields.
     */
    private function flattenPivotFields($results): LengthAwarePaginator|Collection
    {
        $items = $results instanceof LengthAwarePaginator ? $results->items() : $results;
        collect($items)->transform(fn($item) => $this->hoistPivotFields($item));
        return $results;
    }

    /**
     * Recursively hoist pivot fields from nested properties.
     *
     * @param  mixed  $item  The item to transform.
     * @return mixed The transformed item.
     */
    private function hoistPivotFields($item)
    {
        foreach ($item->getRelations() as $relationName => $relation) {
            if ($relation && $relationItem = $relation->first()) {
                if ($pivot = $relationItem->pivot) {
                    $item->pivot = $pivot->getAttributes();
                    unset($item->getRelations()[$relationName]);
                }
            }
        }
        return $item;
    }

    /**
     * Apply the filter for show_id, handling different types of relationships.
     *
     * @param  Request  $request  The HTTP request object.
     * @param  Builder|ScoutBuilder  $query  The Eloquent query builder or Scout builder.
     * @return Builder|ScoutBuilder The query builder with applied show_id filter.
     * @throws Exception If no valid relation is found.
     */
    private function applyShowIdFilter(Request $request, Builder|ScoutBuilder $query)
    {
        $model = $query instanceof ScoutBuilder ? $query->model : $query->getModel();
        $relation = $this->getShowRelation($model);

        if (!$relation) {
            throw new Exception("No valid 'shows' or 'show' relation found on the model.");
        }

        if ($relation instanceof \Illuminate\Database\Eloquent\Relations\BelongsTo) {
            $query->where($relation->getForeignKeyName(), $request->input('show_id'));
        } else {
            $this->applyManyToManyShowIdFilter($request, $query, $relation);
        }

        return $query;
    }

    /**
     * Apply the filter for show_id in Many-to-Many relationships.
     *
     * @param  Request  $request  The HTTP request object
     * @param  Builder|ScoutBuilder  $query  The Eloquent query builder or Scout builder.
     * @param  Relation  $relation  The relationship instance.
     * @return void
     */
    private function applyManyToManyShowIdFilter(Request $request, Builder|ScoutBuilder $query, Relation $relation): void
    {
        $pivotTable = $relation->getTable();
        $pivotFields = $this->getPivotFields($pivotTable);

        if ($query instanceof ScoutBuilder) {
            $modelClass = get_class($query->model);
            $modelIds = $modelClass::search($request->input('show_id'))->get()->pluck('id');
            $query = $modelClass::whereIn('id', $modelIds);
        }

        $query->whereHas($relation->getRelationName(), function ($q) use ($request, $pivotTable) {
            $q->where("$pivotTable.show_id", $request->input('show_id'));
        });

        $query->with($relation->getRelationName());

        $query->with([$relation->getRelationName() => function ($q) use ($request, $pivotFields, $pivotTable) {
            $q->where("$pivotTable.show_id", $request->input('show_id'));
            foreach ($pivotFields as $field) {
                $q->addSelect("$pivotTable.$field as pivot_$field");
            }
        }]);
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
        $query_by = $this->determineQueryBy($query->getModel());

        $search = $query->getModel()::search($searchQuery ?? '')->options([
            'query_by' => $query_by,
        ]);

        if ($request->has('show_id')) {
            $model = $query->getModel();
            $relation = $this->getShowRelation($model);
            $pivotTable = $relation->getTable();
            $pivotFields = $this->getPivotFields($pivotTable);

            $search->query(function ($q) use ($request, $relation, $pivotFields, $pivotTable) {
                $q->with([$relation->getRelationName() => function ($q) use ($request, $pivotFields, $pivotTable) {
                    $q->where("$pivotTable.show_id", $request->input('show_id'));
                    foreach ($pivotFields as $field) {
                        $q->addSelect("$pivotTable.$field as pivot_$field");
                    }
                }]);
            });
        }

        $search = $this->applyFilters($request, $search);

        if ($search instanceof \Illuminate\Support\Collection) {
            return $search;
        }

        $results = $search->get();

        return $this->flattenPivotFields($results);
    }

    /**
     * Determine the query_by field based on the model type.
     *
     * @param  mixed  $model  The model instance.
     * @return string The query_by field.
     */
    private function determineQueryBy($model): string
    {
        if ($model instanceof \App\Models\Customer) {
            return 'first_name, last_name';
        }

        if ($model instanceof \App\Models\Show) {
            return 'start';
        }

        return 'name';
    }

    /**
     * Get the list of pivot fields for a given pivot table.
     *
     * @param  string  $pivotTable  The name of the pivot table.
     * @return array The list of pivot fields.
     */
    private function getPivotFields(string $pivotTable): array
    {
        if (!isset($this->pivotFieldsCache[$pivotTable])) {
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
