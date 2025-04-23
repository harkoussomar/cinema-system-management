import ClientLayout from '@/layouts/ClientLayout';
import { CalendarIcon, ClockIcon, FilmIcon, TicketIcon } from '@heroicons/react/24/outline';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { formatDate, formatTime } from '../../../utils/dateUtils';

interface Seat {
    id: number;
    row: string;
    number: number;
}

interface Screening {
    id: number;
    start_time: string;
    room: string;
    film: {
        id: number;
        title: string;
        poster_image: string | null;
    };
}

interface Reservation {
    id: number;
    screening: Screening;
    confirmation_code: string;
    seats?: Seat[];
    total_price?: number;
    status: string;
    payment_status?: string;
    created_at: string;
}

interface SearchResultProps {
    reservation: Reservation;
}

export default function SearchResult({ reservation }: SearchResultProps) {
    // Default values for missing properties
    const paymentStatus = reservation.payment_status || 'pending';
    const totalPrice = reservation.total_price || 0;

    // Sort seats for display
    const sortedSeats = reservation.seats
        ? [...reservation.seats].sort((a, b) => {
              if (a.row !== b.row) {
                  return a.row.localeCompare(b.row);
              }
              return a.number - b.number;
          })
        : [];

    return (
        <ClientLayout>
            <Head title="Reservation Details | CineVerse" />

            <div className="bg-gradient-to-b from-gray-900 to-black py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mx-auto max-w-3xl"
                    >
                        <div className="mb-8 flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-white">Your Reservation</h1>
                                <p className="text-gray-400">Here are the details of your reservation</p>
                            </div>
                            <Link
                                href={route('reservations.search')}
                                className="inline-flex items-center justify-center rounded-md border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-700"
                            >
                                Search Again
                            </Link>
                        </div>

                        {/* Status banner */}
                        <div
                            className={`mb-8 rounded-md p-4 ${
                                paymentStatus === 'completed'
                                    ? 'border border-green-700/50 bg-green-900/30'
                                    : 'border border-amber-700/50 bg-amber-900/30'
                            }`}
                        >
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    {paymentStatus === 'completed' ? (
                                        <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    ) : (
                                        <svg className="h-5 w-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                fillRule="evenodd"
                                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    )}
                                </div>
                                <div className="ml-3">
                                    <h3 className={paymentStatus === 'completed' ? 'text-green-400' : 'text-amber-400'}>
                                        {paymentStatus === 'completed' ? 'Confirmed Reservation' : 'Pending Payment'}
                                    </h3>
                                    <div className={paymentStatus === 'completed' ? 'text-green-300/70' : 'text-amber-300/70'}>
                                        {paymentStatus === 'completed'
                                            ? 'Your reservation is confirmed and ready to go. Please arrive 15 minutes before show time.'
                                            : 'Your reservation is not complete. Please make a payment to confirm your seats.'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main content */}
                        <div className="overflow-hidden rounded-lg border border-gray-700 shadow-xl">
                            {/* Film info */}
                            <div className="border-b border-gray-700 bg-gray-800">
                                <div className="flex items-center p-6">
                                    <div className="hidden h-24 w-16 flex-shrink-0 overflow-hidden rounded border border-gray-700 md:block">
                                        {reservation.screening.film.poster_image ? (
                                            <img
                                                src={
                                                    reservation.screening.film.poster_image.startsWith('http')
                                                        ? reservation.screening.film.poster_image
                                                        : `/storage/${reservation.screening.film.poster_image}`
                                                }
                                                alt={reservation.screening.film.title}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-gray-900">
                                                <FilmIcon className="h-8 w-8 text-gray-600" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="ml-4">
                                        <h2 className="text-lg font-medium text-white">{reservation.screening.film.title}</h2>
                                        <div className="mt-1 flex flex-wrap gap-4 text-sm text-gray-400">
                                            <div className="flex items-center">
                                                <CalendarIcon className="mr-1 h-4 w-4 text-gray-500" />
                                                <span>{formatDate(reservation.screening.start_time)}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <ClockIcon className="mr-1 h-4 w-4 text-gray-500" />
                                                <span>{formatTime(reservation.screening.start_time)}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="rounded bg-gray-700 px-2 py-1 text-xs text-gray-300">
                                                    Room {reservation.screening.room}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Ticket info */}
                            <div className="bg-gray-900 p-6">
                                <div className="mb-5 border-b border-gray-800 pb-5">
                                    <h3 className="text-lg font-medium text-white">Reservation Details</h3>
                                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <div className="text-sm font-medium text-gray-400">Confirmation Code</div>
                                            <div className="mt-1 flex items-center">
                                                <TicketIcon className="text-primary mr-1.5 h-5 w-5" />
                                                <span className="font-mono text-lg text-white">{reservation.confirmation_code}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-400">Reservation Date</div>
                                            <div className="mt-1 flex items-center">
                                                <CalendarIcon className="mr-1.5 h-5 w-5 text-gray-500" />
                                                <span className="text-white">{new Date(reservation.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-5 border-b border-gray-800 pb-5">
                                    <h3 className="text-lg font-medium text-white">Seats</h3>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {sortedSeats && sortedSeats.length > 0 ? (
                                            sortedSeats.map((seat) => (
                                                <div
                                                    key={seat.id}
                                                    className="bg-primary/10 text-primary border-primary/30 inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm font-medium"
                                                >
                                                    {seat.row}
                                                    {seat.number}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-gray-400">No seat information available</div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-400">Total Amount</div>
                                    <div className="text-2xl font-bold text-white">${totalPrice.toFixed(2)}</div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between border-t border-gray-700 bg-gray-800 p-6">
                                {paymentStatus === 'completed' ? (
                                    <div className="flex gap-4">
                                        <a
                                            href={route('reservations.download-ticket', { reservation: reservation.id })}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-primary hover:bg-primary/90 focus:ring-primary inline-flex items-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
                                        >
                                            <svg className="mr-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            Download Ticket
                                        </a>
                                    </div>
                                ) : (
                                    <Link
                                        href={route('reservations.payment', { reservation: reservation.id })}
                                        className="bg-primary hover:bg-primary/90 focus:ring-primary inline-flex items-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
                                    >
                                        Complete Payment
                                    </Link>
                                )}
                                <Link
                                    href={route('films.show', { film: reservation.screening.film.id })}
                                    className="text-primary hover:text-primary/80 text-sm font-medium"
                                >
                                    View Film Details
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </ClientLayout>
    );
}
