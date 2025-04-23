import { Head, useForm, usePage } from '@inertiajs/react';
import {
    Clock as ClockIcon,
    Mail as EnvelopeIcon,
    Film as FilmIcon,
    Loader as LoaderIcon,
    MapPin as MapPinIcon,
    ChevronsRight as NextIcon,
    Phone as PhoneIcon,
    Ticket as TicketIcon,
    User as UserIcon,
    X as XIcon,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { route } from 'ziggy-js';
import Button from '../../../components/ui/button';
import ClientLayout from '../../../layouts/ClientLayout';
import { formatDate, formatTime } from '../../../utils/dateUtils';

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

interface PageProps {
    auth: {
        user: Record<string, unknown> | null;
    };
    errors: Record<string, string>;
    deferred?: Record<string, string[] | undefined>;
}

export default function SeatSelection({ screening, seatsByRow }: SeatSelectionProps) {
const { auth } = usePage().props as unknown as PageProps;

// Use a Set for faster lookups on selected seats
const [selectedSeatIds, setSelectedSeatIds] = useState<Set<number>>(new Set());
const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
const form = useForm({
    seat_ids: [] as number[],
    guest_name: '',
    guest_email: '',
    guest_phone: '',
});

// Handle seat selection - optimized with Set for O(1) lookups
const handleSeatSelect = (seat: Seat) => {
    if (seat.status !== 'available') return;

    // Create new Set from the current one to maintain immutability
    const newSelectedSeatIds = new Set(selectedSeatIds);

    if (newSelectedSeatIds.has(seat.id)) {
        // Remove seat
        newSelectedSeatIds.delete(seat.id);
        const newSelectedSeats = selectedSeats.filter((s) => s.id !== seat.id);
        setSelectedSeats(newSelectedSeats);
        setSelectedSeatIds(newSelectedSeatIds);
        form.setData('seat_ids', Array.from(newSelectedSeatIds));
    } else {
        // Add seat
        newSelectedSeatIds.add(seat.id);
        const newSelectedSeats = [...selectedSeats, seat];
        setSelectedSeats(newSelectedSeats);
        setSelectedSeatIds(newSelectedSeatIds);
        form.setData('seat_ids', Array.from(newSelectedSeatIds));
    }
};

// Memoize total price calculation to prevent unnecessary recalculations
const totalPrice = useMemo(() => selectedSeats.length * screening.price, [selectedSeats.length, screening.price]);

// Submit reservation
const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedSeats.length === 0) {
        alert('Please select at least one seat to continue.');
        return;
    }

    // If user is not logged in, validate guest information
    if (!auth.user && (!form.data.guest_name || !form.data.guest_email)) {
        alert('Please fill in your name and email to continue.');
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

// Memoize sorted rows to prevent sorting on every render
const sortedRows = useMemo(() => Object.keys(seatsByRow).sort(), [seatsByRow]);

    return (
        <ClientLayout>
            <Head title={`Select Seats - ${screening.film.title}`} />

            <div className="container px-4 py-8 mx-auto">
                <h1 className="relative mb-8 text-4xl font-extrabold text-transparent bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text">
                    <span className="animate-pulse-slow">Pick Your Perfect Spot</span>
                </h1>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Seat Selection Area */}
                    <div className="lg:col-span-2">
                        <div className="mb-6 overflow-hidden transition duration-300 transform border shadow-lg rounded-xl border-neutral-700 bg-gradient-to-b from-neutral-800 to-neutral-900 shadow-red-500/10 hover:shadow-red-500/20">
                            <div className="relative px-6 py-4 border-b border-neutral-700 bg-gradient-to-r from-red-900 to-neutral-900">
                                <h2 className="flex items-center text-xl font-semibold text-white">
                                    <TicketIcon className="w-5 h-5 mr-2 text-red-500 animate-pulse-slow" />
                                    Select Your Seats
                                </h2>

                                <div className="absolute flex space-x-2 top-4 right-4">
                                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                </div>
                            </div>
                            <div className="px-6 py-4">
                                {/* Screen */}
                                <div className="relative pt-6 mb-10">
                                    <div className="absolute inset-0 bg-gradient-to-b from-red-500/20 to-transparent blur-md"></div>
                                    <div className="w-3/4 h-2 mx-auto mb-2 rounded-lg animate-glow bg-red-500/30"></div>
                                    <div className="relative flex items-center justify-center w-2/3 h-8 mx-auto text-xs font-bold text-center text-white rounded-t-3xl bg-gradient-to-r from-red-600/40 to-red-400/40">
                                        <span className="animate-text-flicker">CINEMA SCREEN</span>
                                    </div>
                                </div>

                                {/* Seating map */}
                                <div className="pb-4 mb-6 overflow-x-auto">
                                    <div className="min-w-[600px]">
                                        {sortedRows.map((row) => (
                                            <div key={row} className="flex items-center mb-3">
                                                <div className="w-8 mr-4 text-sm font-medium text-center text-red-400">{row}</div>
                                                <div className="flex flex-wrap justify-center flex-1 gap-2">
                                                    {seatsByRow[row].map((seat) => (
                                                        <button
                                                            key={seat.id}
                                                            onClick={() => handleSeatSelect(seat)}
                                                            disabled={seat.status !== 'available'}
                                                            className={`group flex h-10 w-10 transform items-center justify-center rounded-md text-xs font-medium transition-all duration-300 hover:scale-110 ${
                                                                selectedSeats.some((s) => s.id === seat.id)
                                                                    ? 'animate-pulse-slow bg-gradient-to-br from-red-600 to-red-700 text-white shadow-md shadow-red-600/50'
                                                                    : seat.status === 'available'
                                                                      ? 'bg-neutral-700 text-white hover:bg-neutral-600'
                                                                      : 'cursor-not-allowed bg-neutral-800 text-neutral-500'
                                                            }`}
                                                        >
                                                            <span className={selectedSeats.some((s) => s.id === seat.id) ? 'animate-wiggle' : ''}>
                                                                {seat.number}
                                                            </span>
                                                        </button>
                                                    ))}
                                                </div>
                                                <div className="w-8 ml-4 text-sm font-medium text-center text-red-400">{row}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Legend */}
                                <div className="flex flex-wrap items-center justify-center gap-4 pt-4 text-sm border-t border-neutral-700">
                                    <div className="flex items-center p-2 rounded-md bg-neutral-800/50">
                                        <div className="w-4 h-4 mr-2 rounded bg-neutral-700"></div>
                                        <span className="text-neutral-300">Available</span>
                                    </div>
                                    <div className="flex items-center p-2 rounded-md bg-neutral-800/50">
                                        <div className="w-4 h-4 mr-2 rounded animate-pulse bg-gradient-to-br from-red-600 to-red-700"></div>
                                        <span className="text-neutral-300">Selected</span>
                                    </div>
                                    <div className="flex items-center p-2 rounded-md bg-neutral-800/50">
                                        <div className="w-4 h-4 mr-2 rounded bg-neutral-800"></div>
                                        <span className="text-neutral-400">Unavailable</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="sticky overflow-hidden transition duration-300 border shadow-lg top-24 rounded-xl border-neutral-700 bg-gradient-to-b from-neutral-800 to-neutral-900 shadow-red-500/10 hover:shadow-red-500/20">
                            <div className="relative px-6 py-4 border-b border-neutral-700 bg-gradient-to-r from-red-900 to-neutral-900">
                                <h2 className="flex items-center text-xl font-semibold text-white">
                                    <FilmIcon className="w-5 h-5 mr-2 text-red-500" />
                                    Your Movie Experience
                                </h2>
                                <div className="absolute flex space-x-2 top-4 right-4">
                                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                </div>
                            </div>

                            {/* Film info */}
                            <div className="px-6 py-4 border-b border-neutral-700 bg-gradient-to-r from-neutral-800 to-neutral-800/50">
                                <div className="flex items-start gap-4">
                                    {screening.film.poster_image && (
                                        <div className="w-20 overflow-hidden rounded-md shadow-lg h-28 shadow-black/40">
                                            <img
                                                src={screening.film.poster_image}
                                                alt={screening.film.title}
                                                className="object-cover w-full h-full"
                                            />
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="mb-2 text-lg font-semibold text-white bg-gradient-to-r from-white to-neutral-300 bg-clip-text">
                                            {screening.film.title}
                                        </h3>
                                        <div className="space-y-2 text-sm text-neutral-300">
                                            <div className="flex items-start">
                                                <ClockIcon className="mt-0.5 mr-3 h-4 w-4 text-red-400" />
                                                <div>
                                                    <p className="text-white">{formatTime(screening.start_time)}</p>
                                                    <p>{formatDate(screening.start_time)}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <MapPinIcon className="w-4 h-4 mr-3 text-red-400" />
                                                <p>
                                                    Room: <span className="text-white">{screening.room}</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Selected seats */}
                            <div className="px-6 py-4 border-b border-neutral-700 bg-gradient-to-r from-neutral-800 to-neutral-800/50">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-base font-medium text-white">Selected Seats</h3>
                                    <span className="rounded-full bg-neutral-700/50 px-2 py-0.5 text-xs font-medium text-neutral-400">
                                        {selectedSeats.length} {selectedSeats.length === 1 ? 'seat' : 'seats'}
                                    </span>
                                </div>
                                {selectedSeats.length > 0 ? (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {selectedSeats.map((seat) => (
                                            <div
                                                key={seat.id}
                                                className="relative px-2 py-1 text-sm text-white transition-all duration-300 rounded-md shadow-sm group bg-gradient-to-r from-red-700 to-red-600 shadow-red-700/30 hover:shadow-red-600/50"
                                                onClick={() => handleSeatSelect(seat)}
                                            >
                                                {seat.row}-{seat.number}
                                                <span className="absolute inset-0 flex items-center justify-center transition-all duration-300 rounded-md opacity-0 bg-neutral-900/80 group-hover:opacity-100">
                                                    <XIcon className="w-3 h-3 text-white" />
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-3 text-sm border border-dashed rounded-lg border-neutral-700 bg-neutral-800/50 text-neutral-400">
                                        <div className="flex items-center justify-center">
                                            <TicketIcon className="w-4 h-4 mr-2 text-neutral-500" />
                                            <p>Click on some seats to get started!</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Price summary */}
                            <div className="px-6 py-4 border-b border-neutral-700 bg-gradient-to-r from-neutral-800 to-neutral-800/50">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-neutral-300">Price per seat</span>
                                    <span className="font-medium text-white">${Number(screening.price).toFixed(2)}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 mt-4 font-medium rounded-lg bg-gradient-to-r from-neutral-800 to-neutral-700">
                                    <span className="text-white">Total</span>
                                    <span className="text-lg font-bold text-transparent bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text">
                                        ${totalPrice.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {/* User info form */}
                            <form onSubmit={handleSubmit}>
                                {!auth.user && (
                                    <div className="px-6 py-4 border-b border-neutral-700 bg-gradient-to-r from-neutral-800 to-neutral-800/50">
                                        <h3 className="flex items-center mb-3 text-base font-medium text-white">
                                            <UserIcon className="w-4 h-4 mr-2 text-red-500" />
                                            Guest Information
                                        </h3>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block mb-1 text-sm text-neutral-300" htmlFor="guest_name">
                                                    Name
                                                </label>
                                                <div className="flex transition-all duration-300 border rounded-md border-neutral-600 bg-neutral-700 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500/50">
                                                    <div className="flex items-center justify-center w-10 text-neutral-400">
                                                        <UserIcon className="w-4 h-4" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        id="guest_name"
                                                        value={form.data.guest_name}
                                                        onChange={(e) => form.setData('guest_name', e.target.value)}
                                                        className="w-full py-2 pl-0 pr-3 text-white bg-transparent border-0 rounded-r-md placeholder:text-neutral-400 focus:ring-0 focus:outline-none"
                                                        placeholder="Full Name"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block mb-1 text-sm text-neutral-300" htmlFor="guest_email">
                                                    Email
                                                </label>
                                                <div className="flex transition-all duration-300 border rounded-md border-neutral-600 bg-neutral-700 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500/50">
                                                    <div className="flex items-center justify-center w-10 text-neutral-400">
                                                        <EnvelopeIcon className="w-4 h-4" />
                                                    </div>
                                                    <input
                                                        type="email"
                                                        id="guest_email"
                                                        value={form.data.guest_email}
                                                        onChange={(e) => form.setData('guest_email', e.target.value)}
                                                        className="w-full py-2 pl-0 pr-3 text-white bg-transparent border-0 rounded-r-md placeholder:text-neutral-400 focus:ring-0 focus:outline-none"
                                                        placeholder="Email Address"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block mb-1 text-sm text-neutral-300" htmlFor="guest_phone">
                                                    Phone (optional)
                                                </label>
                                                <div className="flex transition-all duration-300 border rounded-md border-neutral-600 bg-neutral-700 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500/50">
                                                    <div className="flex items-center justify-center w-10 text-neutral-400">
                                                        <PhoneIcon className="w-4 h-4" />
                                                    </div>
                                                    <input
                                                        type="tel"
                                                        id="guest_phone"
                                                        value={form.data.guest_phone}
                                                        onChange={(e) => form.setData('guest_phone', e.target.value)}
                                                        className="w-full py-2 pl-0 pr-3 text-white bg-transparent border-0 rounded-r-md placeholder:text-neutral-400 focus:ring-0 focus:outline-none"
                                                        placeholder="Phone Number"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {auth.user && (
                                    <div className="px-6 py-4 border-b border-neutral-700 bg-gradient-to-r from-neutral-800 to-neutral-800/50">
                                        <h3 className="flex items-center mb-1 text-base font-medium text-white">
                                            <UserIcon className="w-4 h-4 mr-2 text-red-500" />
                                            Logged in as
                                        </h3>
                                        <p className="text-sm text-neutral-300">
                                            {(auth.user as any).name} ({(auth.user as any).email})
                                        </p>
                                    </div>
                                )}

                                {/* Book button */}
                                <div className="px-6 py-4 bg-gradient-to-r from-neutral-800 to-neutral-800/50">
                                    <Button
                                        type="submit"
                                        disabled={selectedSeats.length === 0 || form.processing}
                                        className={`w-full transform transition-all duration-300 hover:scale-105 ${
                                            selectedSeats.length === 0 || form.processing
                                                ? 'cursor-not-allowed bg-neutral-700'
                                                : 'bg-gradient-to-r from-red-600 to-red-700 shadow-lg shadow-red-700/30 hover:from-red-700 hover:to-red-800 hover:shadow-red-600/50'
                                        }`}
                                    >
                                        {form.processing ? (
                                            <>
                                                <LoaderIcon className="w-4 h-4 mr-2 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                {selectedSeats.length === 0 ? (
                                                    <>
                                                        <TicketIcon className="w-4 h-4 mr-2" />
                                                        Select seats to continue
                                                    </>
                                                ) : (
                                                    <>
                                                        <NextIcon className="w-4 h-4 mr-2" />
                                                        Continue to Payment
                                                    </>
                                                )}
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
