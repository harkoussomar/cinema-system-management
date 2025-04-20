<?php

use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\SeatController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Seat Management
Route::get('/screenings/{screening}/seats', [SeatController::class, 'getSeats']);
Route::post('/seats/reserve', [SeatController::class, 'reserveTemporarily']);
Route::post('/seats/release', [SeatController::class, 'releaseTemporary']);

// Payment Processing
Route::post('/payment/initialize', [PaymentController::class, 'initialize']);
Route::post('/payment/webhook', [PaymentController::class, 'webhook']);

// Search endpoints
Route::get('/films/search', function (Request $request) {
    $query = $request->input('query');
    $films = \App\Models\Film::where('title', 'like', "%{$query}%")
        ->orWhere('description', 'like', "%{$query}%")
        ->orWhere('genre', 'like', "%{$query}%")
        ->limit(10)
        ->get(['id', 'title', 'poster_image', 'genre']);

    return response()->json(['films' => $films]);
});

Route::get('/screenings/available', function (Request $request) {
    $date = $request->input('date');
    $filmId = $request->input('film_id');

    $query = \App\Models\Screening::with('film')
        ->where('is_active', true)
        ->where('start_time', '>', now());

    if ($date) {
        $query->whereDate('start_time', $date);
    }

    if ($filmId) {
        $query->where('film_id', $filmId);
    }

    $screenings = $query->orderBy('start_time')
        ->limit(20)
        ->get();

    return response()->json(['screenings' => $screenings]);
});

// Get screening details
Route::get('/screenings/{screening}', function (App\Models\Screening $screening) {
    $screening->load(['film', 'seats']);
    return response()->json($screening);
});
