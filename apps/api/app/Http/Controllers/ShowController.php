<?php

namespace App\Http\Controllers;

use App\Http\Requests\AddProductToShowRequest;
use App\Http\Requests\StoreShowRequest;
use App\Http\Requests\UpdateShowRequest;
use App\Models\Event;
use App\Models\Product;
use App\Models\Show;
use App\Traits\HandlesPaginationAndFiltering;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class ShowController extends Controller implements HasMiddleware
{
    use HandlesPaginationAndFiltering;

    public static function middleware(): array
    {
        return [
            new Middleware('auth:sanctum', only: ['store', 'update', 'destroy', 'addProduct', 'removeProduct']),
        ];
    }

    /**
     * Display a listing of the resource.
     *
     * Params
     * - event_id: int
     * - page: int
     * - per_page: int
     * - search: string
     */
    public function index(Request $request)
    {
        $query = Show::query()
            ->orderBy('start');

        return $this->searchOrPaginate($request, $query);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreShowRequest $request, Event $event)
    {
        $show = $event->shows()->create($request->validated());

        return response()->json($show, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Show $show)
    {
        return $show;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateShowRequest $request, Show $show)
    {
        $show->update($request->validated());

        return $show;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Show $show)
    {
        $show->delete();

        return $show;
    }

    /**
     * Add a product to the show.
     */
    public function addProduct(AddProductToShowRequest $request, Show $show, Product $product)
    {
        $show->products()->attach($product->id, [
            'amount' => $request->amount,
            'adjusted_price' => $request->adjusted_price,
            'enabled' => $request->enabled,
        ]);

        return response()->json($product, 201);
    }

    /**
     * Remove a product from the show.
     */
    public function removeProduct(Show $show, Product $product)
    {
        $show->products()->detach($product->id);

        return response()->json($product, 200);
    }

    /**
     * Update a product on the show.
     */
    public function updateProduct(AddProductToShowRequest $request, Show $show, Product $product)
    {
        $show->products()->updateExistingPivot($product->id, $request->validated());

        return response()->json($product, 200);
    }
}
