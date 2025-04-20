import { Head, useForm, usePage } from '@inertiajs/react';
import {
    Banknote as BanknotesIcon,
    Clock as ClockIcon,
    Mail as EnvelopeIcon,
    Film as FilmIcon,
    Loader as LoaderIcon,
    MapPin as MapPinIcon,
    Phone as PhoneIcon,
    Ticket as TicketIcon,
    User as UserIcon,
} from 'lucide-react';
import React, { useState } from 'react';
import { route } from 'ziggy-js';
import Button from '../../../components/ui/button';
import ClientLayout from '../../../layouts/ClientLayout';

interface Seat {
    id: number;
    row: string;
    number: number;
    status: 'available' | 'reserved' | 'sold';
}

interface Screening {
    id: number;
    film: {
        id: number;
        title: string;
        poster_image: string;
        duration: number;
    };
    start_time: string;
    room: string;
    price: number;
}

interface SeatSelectionProps {
    screening: Screening;
    seatsByRow: Record<string, Seat[]>;
}

export default function SeatSelection({ screening, seatsByRow }: SeatSelectionProps) {
    const { auth } = usePage().props as any;
    const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);

    const form = useForm({
        seat_ids: [] as number[],
        guest_name: '',
        guest_email: '',
        guest_phone: '',
    });

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // Format time
    const formatTime = (timeString: string) => {
        const date = new Date(timeString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Handle seat selection
    const handleSeatSelect = (seat: Seat) => {
        if (seat.status !== 'available') return;

        const isSelected = selectedSeats.some((s) => s.id === seat.id);

        if (isSelected) {
            // Remove seat
            const newSelectedSeats = selectedSeats.filter((s) => s.id !== seat.id);
            setSelectedSeats(newSelectedSeats);
            form.setData(
                'seat_ids',
                newSelectedSeats.map((s) => s.id),
            );
        } else {
            // Add seat
            const newSelectedSeats = [...selectedSeats, seat];
            setSelectedSeats(newSelectedSeats);
            form.setData(
                'seat_ids',
                newSelectedSeats.map((s) => s.id),
            );
        }
    };

    // Calculate total price
    const totalPrice = selectedSeats.length * screening.price;

    // Submit reservation
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedSeats.length === 0) {
            alert('Please select at least one seat to continue.');
            return;
        }

        form.post(route('reservations.store', { screening: screening.id }), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                // Will redirect to payment page handled by controller
            },
            onError: (errors) => {
                console.error('Validation errors:', errors);
            },
        });
    };

    // Sort rows alphabetically
    const sortedRows = Object.keys(seatsByRow).sort();

    return (
        <ClientLayout>
            <Head title={`Select Seats - ${screening.film.title}`} />

            <div className="container mx-auto px-4 py-8">
                <h1 className="mb-8 text-3xl font-bold text-white">Select Your Seats</h1>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Seat Selection Area */}
                    <div className="lg:col-span-2">
                        <div className="mb-6 overflow-hidden rounded-lg border border-neutral-700 bg-neutral-800 shadow-lg">
                            <div className="border-b border-neutral-700 bg-gradient-to-r from-neutral-800 to-neutral-900 px-6 py-4">
                                <h2 className="flex items-center text-xl font-semibold text-white">
                                    <TicketIcon className="mr-2 h-5 w-5 text-red-500" />
                                    Select Your Seats
                                </h2>
                            </div>
                            <div className="px-6 py-4">
                                {/* Screen */}
                                <div className="mb-10 pt-6">
                                    <div className="mx-auto mb-2 h-2 w-3/4 rounded-lg bg-red-500/20"></div>
                                    <div className="mx-auto h-6 w-2/3 rounded-t-3xl bg-red-500/30 text-center text-xs text-white">SCREEN</div>
                                </div>

                                {/* Seating map */}
                                <div className="mb-6 overflow-x-auto pb-4">
                                    <div className="min-w-[600px]">
                                        {sortedRows.map((row) => (
                                            <div key={row} className="mb-3 flex items-center">
                                                <div className="mr-4 w-8 text-center text-sm font-medium text-neutral-300">{row}</div>
                                                <div className="flex flex-1 flex-wrap justify-center gap-2">
                                                    {seatsByRow[row].map((seat) => (
                                                        <button
                                                            key={seat.id}
                                                            onClick={() => handleSeatSelect(seat)}
                                                            disabled={seat.status !== 'available'}
                                                            className={`flex h-9 w-9 items-center justify-center rounded-md text-xs font-medium transition ${
                                                                selectedSeats.some((s) => s.id === seat.id)
                                                                    ? 'bg-red-600 text-white'
                                                                    : seat.status === 'available'
                                                                      ? 'bg-neutral-700 text-white hover:bg-neutral-600'
                                                                      : 'cursor-not-allowed bg-neutral-800 text-neutral-500'
                                                            }`}
                                                        >
                                                            {seat.number}
                                                        </button>
                                                    ))}
                                                </div>
                                                <div className="ml-4 w-8 text-center text-sm font-medium text-neutral-300">{row}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Legend */}
                                <div className="flex flex-wrap items-center justify-center gap-4 border-t border-neutral-700 pt-4 text-sm">
                                    <div className="flex items-center">
                                        <div className="mr-2 h-4 w-4 rounded bg-neutral-700"></div>
                                        <span className="text-neutral-300">Available</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="mr-2 h-4 w-4 rounded bg-red-600"></div>
                                        <span className="text-neutral-300">Selected</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="mr-2 h-4 w-4 rounded bg-neutral-800"></div>
                                        <span className="text-neutral-400">Unavailable</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 overflow-hidden rounded-lg border border-neutral-700 bg-neutral-800 shadow-lg">
                            <div className="border-b border-neutral-700 bg-gradient-to-r from-neutral-800 to-neutral-900 px-6 py-4">
                                <h2 className="flex items-center text-xl font-semibold text-white">
                                    <FilmIcon className="mr-2 h-5 w-5 text-red-500" />
                                    Your Booking
                                </h2>
                            </div>

                            {/* Film info */}
                            <div className="border-b border-neutral-700 px-6 py-4">
                                <h3 className="mb-3 text-lg font-semibold text-white">{screening.film.title}</h3>
                                <div className="space-y-2 text-sm text-neutral-300">
                                    <div className="flex items-start">
                                        <ClockIcon className="mt-0.5 mr-3 h-4 w-4 text-neutral-400" />
                                        <div>
                                            <p>{formatTime(screening.start_time)}</p>
                                            <p>{formatDate(screening.start_time)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <MapPinIcon className="mr-3 h-4 w-4 text-neutral-400" />
                                        <p>Room: {screening.room}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Selected seats */}
                            <div className="border-b border-neutral-700 px-6 py-4">
                                <div className="mb-2 flex items-center justify-between">
                                    <h3 className="text-base font-medium text-white">Selected Seats</h3>
                                    <span className="text-neutral-400">
                                        {selectedSeats.length} {selectedSeats.length === 1 ? 'seat' : 'seats'}
                                    </span>
                                </div>
                                {selectedSeats.length > 0 ? (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {selectedSeats.map((seat) => (
                                            <div key={seat.id} className="rounded-md bg-neutral-700 px-2 py-1 text-sm text-white">
                                                {seat.row}-{seat.number}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-neutral-400">No seats selected yet</p>
                                )}
                            </div>

                            {/* Price summary */}
                            <div className="border-b border-neutral-700 px-6 py-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-neutral-300">Price per seat</span>
                                    <span className="text-white">${Number(screening.price).toFixed(2)}</span>
                                </div>
                                <div className="mt-2 flex items-center justify-between font-medium">
                                    <span className="text-white">Total</span>
                                    <span className="text-lg text-red-500">${totalPrice.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* User info form */}
                            <form onSubmit={handleSubmit}>
                                {!auth.user && (
                                    <div className="border-b border-neutral-700 px-6 py-4">
                                        <h3 className="mb-3 text-base font-medium text-white">Guest Information</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="mb-1 block text-sm text-neutral-300" htmlFor="guest_name">
                                                    Name
                                                </label>
                                                <div className="flex rounded-md border border-neutral-600 bg-neutral-700 focus-within:border-red-500">
                                                    <div className="flex w-10 items-center justify-center text-neutral-400">
                                                        <UserIcon className="h-4 w-4" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        id="guest_name"
                                                        value={form.data.guest_name}
                                                        onChange={(e) => form.setData('guest_name', e.target.value)}
                                                        className="w-full rounded-r-md border-0 bg-transparent py-2 pr-3 pl-0 text-white placeholder:text-neutral-400 focus:ring-0 focus:outline-none"
                                                        placeholder="Full Name"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-sm text-neutral-300" htmlFor="guest_email">
                                                    Email
                                                </label>
                                                <div className="flex rounded-md border border-neutral-600 bg-neutral-700 focus-within:border-red-500">
                                                    <div className="flex w-10 items-center justify-center text-neutral-400">
                                                        <EnvelopeIcon className="h-4 w-4" />
                                                    </div>
                                                    <input
                                                        type="email"
                                                        id="guest_email"
                                                        value={form.data.guest_email}
                                                        onChange={(e) => form.setData('guest_email', e.target.value)}
                                                        className="w-full rounded-r-md border-0 bg-transparent py-2 pr-3 pl-0 text-white placeholder:text-neutral-400 focus:ring-0 focus:outline-none"
                                                        placeholder="Email Address"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-sm text-neutral-300" htmlFor="guest_phone">
                                                    Phone (optional)
                                                </label>
                                                <div className="flex rounded-md border border-neutral-600 bg-neutral-700 focus-within:border-red-500">
                                                    <div className="flex w-10 items-center justify-center text-neutral-400">
                                                        <PhoneIcon className="h-4 w-4" />
                                                    </div>
                                                    <input
                                                        type="tel"
                                                        id="guest_phone"
                                                        value={form.data.guest_phone}
                                                        onChange={(e) => form.setData('guest_phone', e.target.value)}
                                                        className="w-full rounded-r-md border-0 bg-transparent py-2 pr-3 pl-0 text-white placeholder:text-neutral-400 focus:ring-0 focus:outline-none"
                                                        placeholder="Phone Number"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Book button */}
                                <div className="px-6 py-4">
                                    <Button
                                        type="submit"
                                        disabled={selectedSeats.length === 0 || form.processing}
                                        className="w-full bg-red-600 hover:bg-red-700 disabled:bg-neutral-700"
                                    >
                                        {form.processing ? (
                                            <>
                                                <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <BanknotesIcon className="mr-2 h-4 w-4" />
                                                {selectedSeats.length === 0 ? 'Select seats to continue' : 'Continue to Payment'}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </ClientLayout>
    );
}
