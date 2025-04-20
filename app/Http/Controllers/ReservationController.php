<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Reservation;
use App\Models\ReservationSeat;
use App\Models\Screening;
use App\Models\Seat;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Str;

class ReservationController extends Controller
{
    /**
     * Display the seat selection page for a screening.
     */
    public function seatSelection(Screening $screening)
    {
        $screening->load(['film', 'seats']);

        // Group seats by row for better UI display
        $seatsByRow = $screening->seats->groupBy('row')->toArray();

        return Inertia::render('Client/Reservations/SeatSelection', [
            'screening' => $screening,
            'seatsByRow' => $seatsByRow,
        ]);
    }

    /**
     * Store a new reservation.
     */
    public function store(Request $request, Screening $screening)
    {
        $validated = $request->validate([
            'seat_ids' => 'required|array|min:1',
            'seat_ids.*' => 'required|exists:seats,id',
            'guest_name' => 'required_without:user_id|nullable|string|max:255',
            'guest_email' => 'required_without:user_id|nullable|email|max:255',
            'guest_phone' => 'nullable|string|max:20',
        ]);

        // Check if seats are available
        $seats = Seat::whereIn('id', $validated['seat_ids'])
            ->where('screening_id', $screening->id)
            ->get();

        if ($seats->count() !== count($validated['seat_ids']) ||
            $seats->contains('status', '!=', 'available')) {
            return back()->with('error', 'Some selected seats are no longer available.');
        }

        // Create reservation
        $reservation = Reservation::create([
            'screening_id' => $screening->id,
            'user_id' => Auth::id(),
            'guest_name' => $validated['guest_name'] ?? null,
            'guest_email' => $validated['guest_email'] ?? null,
            'guest_phone' => $validated['guest_phone'] ?? null,
            'status' => 'pending',
        ]);

        // Create reservation seats and update seat status
        foreach ($seats as $seat) {
            ReservationSeat::create([
                'reservation_id' => $reservation->id,
                'seat_id' => $seat->id,
                'price' => $screening->price,
            ]);

            $seat->update(['status' => 'reserved']);
        }

        // Load reservationSeats for payment page
        $reservation->load(['screening.film', 'reservationSeats.seat']);

        // Calculate the total price based on reservation seats
        $totalPrice = $reservation->reservationSeats->sum('price');
        $reservation->total_price = $totalPrice;

        return redirect()->route('reservations.payment', $reservation);
    }

    /**
     * Display payment page for a reservation.
     */
    public function payment(Reservation $reservation)
    {
        if ($reservation->status !== 'pending') {
            return redirect()->route('films.index')
                ->with('error', 'This reservation cannot be processed.');
        }

        $reservation->load(['screening.film', 'reservationSeats.seat']);

        // Calculate the total price based on reservation seats
        $totalPrice = $reservation->reservationSeats->sum('price');
        $reservation->total_price = $totalPrice;

        return Inertia::render('Client/Reservations/Payment', [
            'reservation' => $reservation,
        ]);
    }

    /**
     * Process payment for a reservation.
     */
    public function processPayment(Request $request, Reservation $reservation)
    {
        $validated = $request->validate([
            'payment_method' => 'required|string|in:credit_card,paypal',
            // Additional payment fields would go here in a real implementation
        ]);

        // In a real app, you would integrate with a payment gateway here
        // For this demo, we'll just mark the payment as completed

        // Create payment record
        $payment = Payment::create([
            'reservation_id' => $reservation->id,
            'amount' => $reservation->total_price,
            'status' => 'completed',
            'payment_method' => $validated['payment_method'],
            'transaction_id' => Str::random(10),
        ]);

        // Update reservation and seat status
        $reservation->update(['status' => 'confirmed']);

        $seatIds = $reservation->reservationSeats->pluck('seat_id');
        Seat::whereIn('id', $seatIds)->update(['status' => 'sold']);

        // In a real app, you would send email confirmation here

        return redirect()->route('reservations.confirmation', $reservation);
    }

    /**
     * Display confirmation page after successful payment.
     */
    public function confirmation(Reservation $reservation)
    {
        $reservation->load(['screening.film', 'reservationSeats.seat', 'payment']);

        // Prepare seats data to match the expected structure in the Confirmation component
        $seats = $reservation->reservationSeats->map(function ($reservationSeat) {
            return $reservationSeat->seat;
        });

        // Add seats to the reservation data
        $reservation->seats = $seats;

        // Calculate the total price explicitly
        $totalPrice = $reservation->reservationSeats->sum('price');
        $reservation->total_price = $totalPrice ?: ($seats->count() * $reservation->screening->price);

        // Add confirmation code
        $reservation->confirmation_code = $reservation->reservation_code ?? 'CONF-' . strtoupper(substr(md5($reservation->id), 0, 8));

        // Set payment status
        $reservation->payment_status = $reservation->payment ? $reservation->payment->status : 'pending';

        return Inertia::render('Client/Reservations/Confirmation', [
            'reservation' => $reservation,
        ]);
    }

    /**
     * Display user's reservation history.
     */
    public function userReservations()
    {
        $reservations = Auth::user()->reservations()
            ->with(['screening.film', 'payment'])
            ->orderByDesc('created_at')
            ->paginate(10);

        return Inertia::render('Client/Account/Reservations', [
            'reservations' => $reservations,
            'user' => Auth::user(),
        ]);
    }

    /**
     * Display specific reservation details.
     */
    public function show(Reservation $reservation)
    {
        if (Auth::id() !== $reservation->user_id) {
            abort(403);
        }

        $reservation->load(['screening.film', 'reservationSeats.seat', 'payment']);

        return Inertia::render('Client/Account/ReservationDetails', [
            'reservation' => $reservation,
            'user' => Auth::user(),
        ]);
    }

    /**
     * Download a PDF ticket for a reservation.
     */
    public function downloadTicket(Reservation $reservation)
    {
        // Make sure the user can only download their own reservations or guest reservations they created
        if (Auth::check() && Auth::id() !== $reservation->user_id && !session()->has('guest_reservation_' . $reservation->id)) {
            abort(403);
        }

        $reservation->load(['screening.film', 'reservationSeats.seat', 'payment']);

        // Prepare seats data
        $seats = $reservation->reservationSeats->map(function ($reservationSeat) {
            return $reservationSeat->seat;
        });
        $reservation->seats = $seats;

        // Format seat numbers for display
        $seatsList = $seats->sortBy(function ($seat) {
            return $seat->row . str_pad($seat->number, 3, '0', STR_PAD_LEFT);
        })->map(function ($seat) {
            return $seat->row . $seat->number;
        })->implode(', ');

        // Add confirmation code if not present
        $reservation->confirmation_code = $reservation->reservation_code ?? 'CONF-' . strtoupper(substr(md5($reservation->id), 0, 8));

        // For now, we'll render a blade view as a simplified ticket rather than generating a PDF
        return view('tickets.download', [
            'reservation' => $reservation,
            'seatsList' => $seatsList,
        ]);
    }
}
