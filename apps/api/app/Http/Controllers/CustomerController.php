<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUpdateCustomerRequest;
use App\Models\Customer;
use App\Traits\HandlesPaginationAndFiltering;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;

class CustomerController extends Controller implements HasMiddleware
{
    use HandlesPaginationAndFiltering;

    public static function middleware(): array
    {
        return ['auth:sanctum'];
    }

    /**
     * Display a listing of the resource.
     *
     * Params
     * - search: string
     * - page: int
     * - per_page: int
     * - sort: string
     */
    public function index(Request $request)
    {
        $query = Customer::query();

        return $this->searchOrPaginate($request, $query);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUpdateCustomerRequest $request)
    {
        $customer = Customer::create($request->validated());
        $customer->address()->update($request->validated('address'));

        return $customer;
    }

    /**
     * Display the specified resource.
     */
    public function show(Customer $customer)
    {
        return $customer;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(StoreUpdateCustomerRequest $request, Customer $customer)
    {
        $customer->update($request->validated());
        $customer->address()->update($request->validated('address'));

        return $customer;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Customer $customer)
    {
        $customer->delete();

        return $customer;
    }
}
