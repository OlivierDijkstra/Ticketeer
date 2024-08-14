<?php

namespace App\Http\Controllers;

use App\Models\MonthlyReport;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class MonthlyReportController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('auth:sanctum'),
        ];
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return MonthlyReport::all();
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return MonthlyReport::find($id);
    }
}
