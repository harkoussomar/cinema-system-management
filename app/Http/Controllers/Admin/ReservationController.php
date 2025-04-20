<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Film;
use App\Models\Reservation;
use App\Models\Screening;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReservationController extends Controller
{
    /**
     * Display a listing of the reservations.
     */
    public function index(Request $request)
    {
        $reservations = Reservation::query()
            ->with(['screening.film', 'user', 'payment', 'reservationSeats'])
            ->withCount('reservationSeats as seats_count')
            ->when($request->film_id, function ($query, $filmId) {
                $query->whereHas('screening', function ($q) use ($filmId) {
                    $q->where('film_id', $filmId);
                });
            })
            ->when($request->screening_id, function ($query, $screeningId) {
                $query->where('screening_id', $screeningId);
            })
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($request->date, function ($query, $date) {
                $query->whereHas('screening', function ($q) use ($date) {
                    $q->whereDate('start_time', $date);
                });
            })
            ->orderByDesc('created_at')
            ->paginate(10)
            ->withQueryString();

        // Calculate the total price for each reservation
        foreach ($reservations as $reservation) {
            $reservation->total_price = $reservation->reservationSeats->sum('price');
        }

        $films = Film::orderBy('title')->get(['id', 'title']);
        $screenings = [];

        if ($request->film_id) {
            $screenings = Screening::where('film_id', $request->film_id)
                ->whereDate('start_time', '>=', now()->subDays(30))
                ->orderBy('start_time')
                ->get(['id', 'start_time']);
        }

        return Inertia::render('Admin/Reservations/Index', [
            'reservations' => $reservations,
            'films' => $films,
            'screenings' => $screenings,
            'filters' => $request->only(['film_id', 'screening_id', 'status', 'date']),
            'statuses' => ['pending', 'confirmed', 'cancelled'],
        ]);
    }

    /**
     * Display the specified reservation.
     */
    public function show(Reservation $reservation)
    {
        $reservation->load([
            'screening.film',
            'user',
            'payment',
            'reservationSeats.seat'
        ]);

        return Inertia::render('Admin/Reservations/Show', [
            'reservation' => $reservation,
        ]);
    }

    /**
     * Update the status of the specified reservation.
     */
    public function updateStatus(Request $request, Reservation $reservation)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,confirmed,cancelled',
        ]);

        $reservation->update([
            'status' => $validated['status'],
        ]);

        // If cancelled, update seat status back to available
        if ($validated['status'] === 'cancelled') {
            $seatIds = $reservation->reservationSeats->pluck('seat_id');

            \App\Models\Seat::whereIn('id', $seatIds)
                ->update(['status' => 'available']);
        }

        return redirect()->route('admin.reservations.show', $reservation)
            ->with('success', 'Reservation status updated successfully.');
    }

    /**
     * Remove the specified reservation from storage.
     */
    public function destroy(Reservation $reservation)
    {
        // Free up the seats
        $seatIds = $reservation->reservationSeats->pluck('seat_id');

        \App\Models\Seat::whereIn('id', $seatIds)
            ->update(['status' => 'available']);

        $reservation->delete();

        return redirect()->route('admin.reservations.index')
            ->with('success', 'Reservation deleted successfully.');
    }
}
