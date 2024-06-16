<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Event;
use App\Models\Product;
use App\Models\Show;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public static function middleware(): array
    {
        return ['auth:sanctum'];
    }

    public function __invoke(Request $request)
    {
        $query = $request->input('query');

        if (! $query) {
            return response()->json();
        }

        $results = $this->getResults($query, $request->input('filter'));

        return response()->json($results);
    }

    private function getResults(string $query, ?string $filter): array
    {
        if (! $filter) {
            return [
                'events' => $this->searchEvents($query, 5),
                'shows' => $this->searchShows($query, 5),
                'products' => $this->searchProducts($query, 5),
                'customers' => $this->searchCustomers($query, 5),
            ];
        }

        return match ($filter) {
            'event' => ['events' => $this->searchEvents($query, 10)],
            'show' => ['shows' => $this->searchShows($query, 10)],
            'product' => ['products' => $this->searchProducts($query, 10)],
            'customer' => ['customers' => $this->searchCustomers($query, 10)],
            default => [],
        };
    }

    private function searchEvents(string $query, int $limit)
    {
        return Event::search($query)
            ->options([
                'query_by' => 'name',
            ])
            ->query(fn ($q) => $q->setEagerLoads([]))
            ->get();
    }

    private function searchShows(string $query, int $limit)
    {
        return Show::search($query)
            ->options([
                'query_by' => 'start,end,guests',
            ])
            ->query(
                fn ($q) => $q->setEagerLoads([])
                    ->with(['event' => fn ($q) => $q->setEagerLoads([])])
            )
            ->get();
    }

    private function searchProducts(string $query, int $limit)
    {
        return Product::search($query)
            ->options([
                'query_by' => 'name',
            ])
            ->query(fn ($q) => $q->setEagerLoads([]))
            ->get();
    }

    private function searchCustomers(string $query, int $limit)
    {
        return Customer::search($query)
            ->options([
                'query_by' => 'first_name,last_name,email',
            ])
            ->query(fn ($q) => $q->setEagerLoads([]))
            ->get();
    }
}
