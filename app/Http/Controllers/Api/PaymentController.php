<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Reservation;
use App\Models\Seat;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    /**
     * Initialize payment session.
     */
    public function initialize(Request $request)
    {
        $validated = $request->validate([
            'reservation_id' => 'required|exists:reservations,id',
            'payment_method' => 'required|string|in:credit_card,paypal',
        ]);

        $reservation = Reservation::with('reservationSeats')->findOrFail($validated['reservation_id']);

        // Check if reservation is still pending
        if ($reservation->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'This reservation cannot be processed for payment.',
            ], 400);
        }

        // In a real app, you would integrate with a payment gateway here
        // For this demo, we'll just generate a payment session

        $paymentSession = [
            'id' => Str::uuid()->toString(),
            'reservation_id' => $reservation->id,
            'amount' => $reservation->total_price,
            'payment_method' => $validated['payment_method'],
            'expires_at' => now()->addMinutes(30)->toIso8601String(),
        ];

        // In a real app, store this in the database or cache

        return response()->json([
            'success' => true,
            'payment_session' => $paymentSession,
        ]);
    }

    /**
     * Handle payment webhook from payment gateway.
     */
    public function webhook(Request $request)
    {
        // In a real app, you would verify the webhook signature
        // and process the payment status update

        $validated = $request->validate([
            'transaction_id' => 'required|string',
            'reservation_id' => 'required|exists:reservations,id',
            'status' => 'required|string|in:completed,failed',
            'amount' => 'required|numeric',
        ]);

        $reservation = Reservation::findOrFail($validated['reservation_id']);

        // Create or update payment
        $payment = Payment::updateOrCreate(
            ['reservation_id' => $reservation->id],
            [
                'amount' => $validated['amount'],
                'status' => $validated['status'],
                'transaction_id' => $validated['transaction_id'],
            ]
        );

        // Update reservation status based on payment
        if ($validated['status'] === 'completed') {
            $reservation->update(['status' => 'confirmed']);

            // Update seat status to sold
            $seatIds = $reservation->reservationSeats->pluck('seat_id');
            Seat::whereIn('id', $seatIds)->update(['status' => 'sold']);
        } else {
            // Payment failed, revert reservation
            $reservation->update(['status' => 'cancelled']);

            // Free up the seats
            $seatIds = $reservation->reservationSeats->pluck('seat_id');
            Seat::whereIn('id', $seatIds)->update(['status' => 'available']);
        }

        return response()->json([
            'success' => true,
        ]);
    }
}
