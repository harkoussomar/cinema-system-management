import ClientLayout from '@/layouts/ClientLayout';
import { Head, useForm } from '@inertiajs/react';
import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { motion } from 'framer-motion';
import { CalendarIcon, ClockIcon, CreditCardIcon, FilmIcon, LoaderIcon, LockIcon, MapPinIcon, TicketIcon, UserIcon } from 'lucide-react';
import { useState } from 'react';
import { formatDate, formatTime } from '../../../utils/dateUtils';

// Initialize Stripe with your test publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface Seat {
    id: number;
    row: string;
    number: number;
}

interface ReservationSeat {
    id: number;
    seat: Seat;
    price: number;
}

interface Reservation {
    id: number;
    screening: {
        id: number;
        start_time: string;
        room: string;
        price: number;
        film: {
            id: number;
            title: string;
            poster_image: string;
            duration: number;
        };
    };
    reservationSeats: ReservationSeat[];
    total_price: number | string;
    user_id?: number;
    guest_name?: string;
    guest_email?: string;
    guest_phone?: string;
    status: 'pending' | 'confirmed' | 'cancelled';
}

interface PaymentProps {
    reservation: Reservation;
}

// Create a payment form component that uses Stripe elements
const CheckoutForm = ({ reservation, setIsProcessing }: { reservation: Reservation; setIsProcessing: (val: boolean) => void }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState<string | null>(null);
    const [cardComplete, setCardComplete] = useState(false);

    const form = useForm({
        payment_method: 'credit_card',
        cardholder_name: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            // Stripe.js has not yet loaded.
            return;
        }

        if (!cardComplete) {
            setError('Please complete your card details');
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            // Get card element
            const cardElement = elements.getElement(CardElement);

            if (!cardElement) {
                setIsProcessing(false);
                setError('Card element not found');
                return;
            }

            // Create payment method
            const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
                billing_details: {
                    name: form.data.cardholder_name || undefined,
                },
            });

            if (stripeError) {
                setIsProcessing(false);
                setError(stripeError.message || 'Payment failed');
                return;
            }

            // Process payment on the server
            form.post(
                route('reservations.process-payment', {
                    reservation: reservation.id,
                    payment_method_id: paymentMethod?.id,
                }),
                {
                    onSuccess: () => {
                        // Payment successfully processed
                        // Already redirecting, let processing state continue
                    },
                    onError: (errors) => {
                        setIsProcessing(false);
                        if (errors.payment) {
                            setError(errors.payment);
                        }
                    },
                },
            );
        } catch (e) {
            setIsProcessing(false);
            setError('An unexpected error occurred. Please try again.');
            console.error('Payment error:', e);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-4">
                <div>
                    <label htmlFor="cardholder-name" className="block mb-2 text-sm font-medium text-neutral-300">
                        Cardholder Name
                    </label>
                    <div className="flex border rounded-md border-neutral-600 bg-neutral-700 focus-within:border-red-500">
                        <div className="flex items-center justify-center w-10 text-neutral-400">
                            <UserIcon className="w-4 h-4" />
                        </div>
                        <input
                            type="text"
                            id="cardholder-name"
                            name="cardholder_name"
                            value={form.data.cardholder_name}
                            onChange={(e) => form.setData('cardholder_name', e.target.value)}
                            className="w-full py-2 pl-0 pr-3 text-white bg-transparent border-0 rounded-r-md placeholder:text-neutral-400 focus:ring-0 focus:outline-none"
                            placeholder="Full Name"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="card-element" className="block mb-2 text-sm font-medium text-neutral-300">
                        Credit Card Details
                    </label>
                    <div className="p-3 border rounded-md border-neutral-600 bg-neutral-700 focus-within:border-red-500">
                        <CardElement
                            id="card-element"
                            onChange={(e) => setCardComplete(e.complete)}
                            options={{
                                style: {
                                    base: {
                                        color: 'white',
                                        fontFamily: '"Inter", sans-serif',
                                        fontSmoothing: 'antialiased',
                                        fontSize: '16px',
                                        '::placeholder': {
                                            color: '#9ca3af',
                                        },
                                    },
                                    invalid: {
                                        color: '#ef4444',
                                        iconColor: '#ef4444',
                                    },
                                },
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Error messages */}
            {error && (
                <div className="p-4 mt-4 text-red-300 rounded-md bg-red-900/30">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="w-5 h-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-300">Payment error:</h3>
                            <div className="mt-2 text-sm">{error}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Errors from form validation */}
            {Object.keys(form.errors).length > 0 && (
                <div className="p-4 mt-4 text-red-300 rounded-md bg-red-900/30">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="w-5 h-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-300">Please fix the following errors:</h3>
                            <div className="mt-2 text-sm">
                                <ul className="pl-5 space-y-1 list-disc">
                                    {Object.entries(form.errors).map(([key, value]) => (
                                        <li key={key}>{value}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Test mode notice */}
            <div className="p-4 mt-4 text-blue-300 border rounded-md border-blue-500/20 bg-blue-900/10">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                            <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-blue-300">
                            <strong>Test Mode:</strong> Use the following test card:
                        </p>
                        <ul className="mt-1 text-sm list-disc list-inside">
                            <li>Card number: 4242 4242 4242 4242</li>
                            <li>Any future expiration date</li>
                            <li>Any 3-digit CVC</li>
                            <li>Any postal code</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Submit button */}
            <motion.div className="mt-8" whileTap={{ scale: 0.98 }}>
                <button
                    type="submit"
                    className="w-full px-4 py-4 text-base font-semibold text-center text-white transition-all rounded-md shadow-lg bg-gradient-to-r from-red-600 to-red-700 shadow-red-600/20 hover:from-red-700 hover:to-red-800 disabled:opacity-70"
                    disabled={!stripe || form.processing}
                >
                    {form.processing ? (
                        <span className="flex items-center justify-center">
                            <LoaderIcon className="w-5 h-5 mr-2 animate-spin" />
                            Processing Payment...
                        </span>
                    ) : (
                        <span className="flex items-center justify-center">
                            <LockIcon className="w-5 h-5 mr-2" />
                            Pay ${Number(reservation.total_price || 0).toFixed(2)} Securely
                        </span>
                    )}
                </button>
            </motion.div>
        </form>
    );
};

export default function Payment({ reservation }: PaymentProps) {
    const [, setIsProcessing] = useState(false);

    // Animation variants
    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
    };

    return (
        <ClientLayout>
            <Head title="Complete Payment" />

            <div className="min-h-screen pt-8 pb-20 bg-gradient-to-b from-neutral-900 to-black">
                <div className="container px-4 mx-auto">
                    <motion.div initial="hidden" animate="visible" variants={fadeIn} className="mb-12 text-center">
                        <h1 className="text-4xl font-bold text-white">Complete Your Payment</h1>
                        <div className="w-24 h-1 mx-auto mt-4 rounded-full bg-gradient-to-r from-red-500 to-red-700"></div>
                        <p className="mt-6 text-lg text-neutral-400">Finalize your booking for {reservation.screening.film.title}</p>
                    </motion.div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        {/* Reservation Summary */}
                        <motion.div
                            className="md:col-span-1"
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="overflow-hidden border shadow-xl rounded-xl border-neutral-700 bg-neutral-800/50">
                                <div className="px-6 py-4 border-b border-neutral-700 bg-gradient-to-r from-neutral-800 to-neutral-900">
                                    <h2 className="flex items-center text-xl font-semibold text-white">
                                        <TicketIcon className="w-5 h-5 mr-2 text-red-500" />
                                        Booking Summary
                                    </h2>
                                </div>

                                {/* Movie details */}
                                <div className="p-6 border-b border-neutral-700 bg-gradient-to-b from-neutral-800/50 to-neutral-800/20">
                                    <div className="flex items-start">
                                        <div className="relative w-16 h-24 mr-4 overflow-hidden border rounded-md shadow-lg border-neutral-700">
                                            {reservation.screening.film.poster_image ? (
                                                <img
                                                    src={
                                                        reservation.screening.film.poster_image.startsWith('http')
                                                            ? reservation.screening.film.poster_image
                                                            : `/storage/${reservation.screening.film.poster_image}`
                                                    }
                                                    alt={reservation.screening.film.title}
                                                    className="object-cover object-center w-full h-full"
                                                    onError={(e) => {
                                                        // Fallback to a placeholder if the image fails to load
                                                        e.currentTarget.src = 'https://via.placeholder.com/300x450?text=No+Poster';
                                                    }}
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center w-full h-full bg-neutral-900">
                                                    <FilmIcon className="w-8 h-8 text-neutral-600" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                                        </div>

                                        <div>
                                            <h3 className="text-xl font-bold text-white">{reservation.screening.film.title}</h3>
                                            <p className="mt-1 text-sm text-neutral-400">{reservation.screening.film.duration} minutes</p>

                                            <div className="mt-3 space-y-2">
                                                <div className="flex items-center text-sm text-neutral-300">
                                                    <CalendarIcon className="w-4 h-4 mr-2 text-red-500/80" />
                                                    {formatDate(reservation.screening.start_time)}
                                                </div>
                                                <div className="flex items-center text-sm text-neutral-300">
                                                    <ClockIcon className="w-4 h-4 mr-2 text-red-500/80" />
                                                    {formatTime(reservation.screening.start_time)}
                                                </div>
                                                <div className="flex items-center text-sm text-neutral-300">
                                                    <MapPinIcon className="w-4 h-4 mr-2 text-red-500/80" />
                                                    Room {reservation.screening.room}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Seats */}
                                <div className="px-6 py-4 border-b border-neutral-700">
                                    <h3 className="mb-3 font-medium text-white">Your Seats</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {reservation.reservationSeats?.map((rs) => (
                                            <div
                                                key={rs.id}
                                                className="flex items-center justify-center w-10 h-8 text-sm font-medium text-white bg-red-600 rounded-md shadow-lg"
                                            >
                                                {rs.seat.row}
                                                {rs.seat.number}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Price breakdown */}
                                <div className="px-6 py-4 space-y-3 text-neutral-300">
                                    <div className="flex justify-between">
                                        <span className="text-sm">Price per seat</span>
                                        <span className="font-medium text-white">${Number(reservation.screening.price).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm">Number of seats</span>
                                        <span className="font-medium text-white">{reservation.reservationSeats?.length || 0}</span>
                                    </div>
                                    <div className="flex justify-between pt-3 text-lg font-bold border-t border-neutral-700">
                                        <span className="text-white">Total</span>
                                        <span className="text-red-500">
                                            $
                                            {typeof reservation.total_price === 'number'
                                                ? reservation.total_price.toFixed(2)
                                                : Number(reservation.total_price || 0).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 mt-4 text-yellow-300 border rounded-xl border-yellow-500/20 bg-yellow-900/10">
                                <div className="flex">
                                    <LockIcon className="flex-shrink-0 w-5 h-5 text-yellow-400" />
                                    <div className="ml-3">
                                        <p>This is using Stripe in Test Mode. No actual charges will be made.</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Payment Form */}
                        <motion.div
                            className="md:col-span-2"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <div className="overflow-hidden border shadow-xl rounded-xl border-neutral-700 bg-neutral-800/50">
                                <div className="px-6 py-4 border-b border-neutral-700 bg-gradient-to-r from-neutral-800 to-neutral-900">
                                    <h2 className="flex items-center text-xl font-semibold text-white">
                                        <CreditCardIcon className="w-5 h-5 mr-2 text-red-500" />
                                        Payment Method
                                    </h2>
                                </div>

                                <div className="p-6">
                                    <Elements stripe={stripePromise}>
                                        <CheckoutForm reservation={reservation} setIsProcessing={setIsProcessing} />
                                    </Elements>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </ClientLayout>
    );
}
