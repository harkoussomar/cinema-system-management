<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Film;
use App\Models\Reservation;
use App\Models\Screening;
use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display the admin dashboard.
     */
    public function index()
    {
        // Get statistics for the dashboard
        $stats = [
            'films_count' => Film::count(),
            'screenings_count' => Screening::count(),
            'reservations_count' => Reservation::count(),
            'revenue' => floatval(Payment::where('status', 'completed')->sum('amount')),
            'recent_growth' => [
                'films' => Film::where('created_at', '>', now()->subDays(30))->count(),
                'screenings' => Screening::where('created_at', '>', now()->subDays(30))->count(),
                'reservations' => Reservation::where('created_at', '>', now()->subDays(30))->count(),
                'revenue' => floatval(Payment::where('status', 'completed')
                    ->where('created_at', '>', now()->subDays(30))
                    ->sum('amount')),
            ],
        ];

        // Get upcoming screenings
        $upcomingScreenings = Screening::with('film')
            ->where('start_time', '>', now())
            ->where('is_active', true)
            ->orderBy('start_time')
            ->limit(5)
            ->get();

        // Get recent reservations
        $recentReservations = Reservation::with(['screening.film', 'user'])
            ->latest()
            ->limit(5)
            ->get();

        // Get popular films
        $popularFilms = Film::withCount('reservations')
            ->orderByDesc('reservations_count')
            ->limit(5)
            ->get();

        return Inertia::render('Admin/Dashboard/Index', [
            'stats' => $stats,
            'upcomingScreenings' => $upcomingScreenings,
            'recentReservations' => $recentReservations,
            'popularFilms' => $popularFilms,
        ]);
    }
}
