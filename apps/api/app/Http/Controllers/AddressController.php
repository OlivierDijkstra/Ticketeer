<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateAddressRequest;
use App\Models\Address;
use Illuminate\Routing\Controllers\Middleware;

class AddressController extends Controller
{
    public static function middleware(): array
    {
        return [
            new Middleware('auth:sanctum'),
        ];
    }

    public function show(Address $address)
    {
        return response()->json($address);
    }

    public function update(UpdateAddressRequest $request, Address $address)
    {
        $address->update($request->validated());

        return response()->json($address);
    }
}
