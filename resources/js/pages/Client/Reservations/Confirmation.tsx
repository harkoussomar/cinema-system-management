import ClientLayout from '@/layouts/ClientLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { AlertTriangle, BadgeCheck, Calendar, Clock, Download, Home, Mail, MapPin, Phone, Ticket, User } from 'lucide-react';
import { route } from 'ziggy-js';
import { formatDate, formatTime } from '../../../utils/dateUtils';

interface Seat {
    id: number;
    row: string;
    number: number;
}

interface Reservation {
    id: string;
    confirmation_code: string;
    created_at: string;
    screening: {
        id: number;
        start_time: string;
        room: string;
        price: number;
        film: {
            id: number;
            title: string;
            poster_image: string;
        };
    };
    seats: Seat[];
    total_price: number | string;
    user_id?: number;
    user?: {
        id: number;
        name: string;
        email: string;
    };
    guest_name?: string;
    guest_email?: string;
    guest_phone?: string;
    payment_status: 'pending' | 'completed' | 'failed';
}

interface ConfirmationProps {
    reservation: Reservation;
}

export default function Confirmation({ reservation }: ConfirmationProps) {
    // Get auth data for user information
    const { auth } = usePage().props as any;

    // Animation variants
    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    return (
        <ClientLayout>
            <Head title="Reservation Confirmed" />

            <div className="min-h-screen bg-gradient-to-b from-neutral-900 to-black pt-8 pb-20">
                <div className="container mx-auto px-4">
                    <motion.div initial="hidden" animate="visible" variants={fadeIn} className="mb-12 text-center">
                        <div className="mb-6 flex justify-center">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="relative"
                            >
                                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-red-500 to-red-700 opacity-75 blur-lg"></div>
                                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-red-600 to-red-700 shadow-xl shadow-red-500/20">
                                    <BadgeCheck className="h-14 w-14 text-white" />
                                </div>
                            </motion.div>
                        </div>
                        <h1 className="text-4xl font-bold text-white">Reservation Confirmed!</h1>
                        <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-gradient-to-r from-red-500 to-red-700"></div>
                        <p className="mt-6 text-lg text-neutral-400">Your seats have been reserved for {reservation.screening.film.title}</p>
                    </motion.div>

                    {reservation.payment_status === 'pending' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="mx-auto mb-8 max-w-3xl rounded-xl border border-yellow-500/20 bg-yellow-900/10 p-5 shadow-lg"
                        >
                            <div className="flex items-start">
                                <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-400" />
                                <div className="ml-3">
                                    <h3 className="text-base font-medium text-yellow-300">Payment Pending</h3>
                                    <div className="mt-2 text-sm text-yellow-200/80">
                                        <p>Please complete payment within 30 minutes to confirm your reservation.</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        {/* Confirmation code and movie details */}
                        <motion.div
                            className="md:col-span-1"
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            {/* Confirmation code */}
                            <div className="mb-6 overflow-hidden rounded-xl border border-neutral-700 bg-gradient-to-b from-neutral-800/80 to-neutral-800/30 backdrop-blur-sm">
                                <div className="border-b border-neutral-700 bg-gradient-to-r from-neutral-800 to-neutral-900 px-6 py-4">
                                    <h2 className="flex items-center text-xl font-semibold text-white">
                                        <Ticket className="mr-2 h-5 w-5 text-red-500" />
                                        Confirmation
                                    </h2>
                                </div>
                                <div className="p-6">
                                    <div className="mb-4 rounded-lg border border-neutral-700 bg-neutral-800/50 p-4 text-center">
                                        <p className="mb-1 text-sm text-neutral-400">Confirmation Code</p>
                                        <p className="text-2xl font-bold tracking-wider text-white">{reservation.confirmation_code}</p>
                                    </div>
                                    <div className="text-center text-sm text-neutral-500">
                                        {new Date(reservation.created_at).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Movie card */}
                            <div className="overflow-hidden rounded-xl border border-neutral-700 bg-gradient-to-b from-neutral-800/80 to-neutral-800/30 shadow-xl backdrop-blur-sm">
                                <div className="relative h-48 overflow-hidden">
                                    {reservation.screening.film.poster_image ? (
                                        <div className="absolute inset-0">
                                            <img
                                                src={
                                                    reservation.screening.film.poster_image.startsWith('http')
                                                        ? reservation.screening.film.poster_image
                                                        : `/storage/${reservation.screening.film.poster_image}`
                                                }
                                                alt={reservation.screening.film.title}
                                                className="h-full w-full object-cover"
                                                onError={(e) => {
                                                    // Fallback to a placeholder if the image fails to load
                                                    e.currentTarget.src = 'https://via.placeholder.com/300x450?text=No+Poster';
                                                }}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/80 to-neutral-900/20"></div>
                                        </div>
                                    ) : (
                                        <div className="absolute inset-0 bg-gradient-to-b from-neutral-800 to-neutral-900"></div>
                                    )}
                                    <div className="absolute bottom-0 left-0 w-full p-6">
                                        <h3 className="text-2xl font-bold text-white">{reservation.screening.film.title}</h3>
                                    </div>
                                </div>
                                <div className="divide-y divide-neutral-700">
                                    <div className="flex items-center gap-3 p-4">
                                        <Calendar className="h-5 w-5 text-red-500/80" />
                                        <div className="text-sm text-neutral-300">{formatDate(reservation.screening.start_time)}</div>
                                    </div>
                                    <div className="flex items-center gap-3 p-4">
                                        <Clock className="h-5 w-5 text-red-500/80" />
                                        <div className="text-sm text-neutral-300">{formatTime(reservation.screening.start_time)}</div>
                                    </div>
                                    <div className="flex items-center gap-3 p-4">
                                        <MapPin className="h-5 w-5 text-red-500/80" />
                                        <div className="text-sm text-neutral-300">Room {reservation.screening.room}</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Reservation details */}
                        <motion.div
                            className="md:col-span-2"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            {/* Seat information */}
                            <div className="mb-6 overflow-hidden rounded-xl border border-neutral-700 bg-gradient-to-b from-neutral-800/80 to-neutral-800/30 shadow-xl backdrop-blur-sm">
                                <div className="border-b border-neutral-700 bg-gradient-to-r from-neutral-800 to-neutral-900 px-6 py-4">
                                    <h2 className="flex items-center text-xl font-semibold text-white">
                                        <Ticket className="mr-2 h-5 w-5 text-red-500" />
                                        Seats Information
                                    </h2>
                                </div>
                                <div className="p-6">
                                    <div className="mb-8">
                                        <h3 className="mb-3 text-lg font-medium text-white">Your Seats</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {reservation.seats?.map((seat) => (
                                                <div
                                                    key={seat.id}
                                                    className="flex h-10 w-14 items-center justify-center rounded-md bg-red-600 text-sm font-medium text-white shadow-lg shadow-red-600/20"
                                                >
                                                    {seat.row}
                                                    {seat.number}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Price breakdown */}
                                    <div className="rounded-lg border border-neutral-700 bg-neutral-800/50 p-5">
                                        <h3 className="mb-4 font-medium text-white">Price Details</h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-neutral-400">Ticket price</span>
                                                <span className="font-medium text-white">
                                                    $
                                                    {(() => {
                                                        if (typeof reservation.screening.price === 'number' && !isNaN(reservation.screening.price)) {
                                                            return reservation.screening.price.toFixed(2);
                                                        }
                                                        if (typeof reservation.screening.price === 'string') {
                                                            const parsed = parseFloat(reservation.screening.price);
                                                            if (!isNaN(parsed)) {
                                                                return parsed.toFixed(2);
                                                            }
                                                        }
                                                        return '0.00';
                                                    })()}{' '}
                                                    each
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-neutral-400">Number of seats</span>
                                                <span className="font-medium text-white">{reservation.seats?.length || 0}</span>
                                            </div>
                                            <div className="border-t border-neutral-700 pt-3">
                                                <div className="flex justify-between">
                                                    <span className="text-lg font-medium text-white">Total</span>
                                                    <span className="text-lg font-bold text-red-500">
                                                        $
                                                        {(() => {
                                                            if (
                                                                typeof reservation.total_price === 'number' &&
                                                                !isNaN(reservation.total_price) &&
                                                                reservation.total_price > 0
                                                            ) {
                                                                return reservation.total_price.toFixed(2);
                                                            }

                                                            if (
                                                                typeof reservation.total_price === 'string' &&
                                                                reservation.total_price &&
                                                                reservation.total_price !== ''
                                                            ) {
                                                                const parsed = parseFloat(reservation.total_price);
                                                                if (!isNaN(parsed) && parsed > 0) {
                                                                    return parsed.toFixed(2);
                                                                }
                                                            }

                                                            // Calculate from price per seat and number of seats
                                                            const seatsCount = reservation.seats?.length || 0;
                                                            let pricePerSeat = 0;

                                                            if (typeof reservation.screening.price === 'number') {
                                                                pricePerSeat = reservation.screening.price;
                                                            } else if (typeof reservation.screening.price === 'string') {
                                                                pricePerSeat = parseFloat(reservation.screening.price) || 0;
                                                            }

                                                            const calculatedTotal = seatsCount * pricePerSeat;
                                                            return calculatedTotal > 0 ? calculatedTotal.toFixed(2) : '0.00';
                                                        })()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Customer information */}
                            <div className="mb-6 overflow-hidden rounded-xl border border-neutral-700 bg-gradient-to-b from-neutral-800/80 to-neutral-800/30 shadow-xl backdrop-blur-sm">
                                <div className="border-b border-neutral-700 bg-gradient-to-r from-neutral-800 to-neutral-900 px-6 py-4">
                                    <h2 className="flex items-center text-xl font-semibold text-white">
                                        <User className="mr-2 h-5 w-5 text-red-500" />
                                        Customer Information
                                    </h2>
                                </div>
                                <div className="divide-y divide-neutral-700">
                                    <div className="flex items-center gap-3 p-4">
                                        <User className="h-5 w-5 text-neutral-500" />
                                        <div>
                                            <p className="text-xs text-neutral-500">Name</p>
                                            <p className="text-sm font-medium text-white">
                                                {reservation.guest_name ||
                                                    (reservation.user && reservation.user.name) ||
                                                    (auth.user && auth.user.name) ||
                                                    'Guest User'}
                                            </p>
                                        </div>
                                    </div>

                                    {(reservation.guest_email || (reservation.user && reservation.user.email) || (auth.user && auth.user.email)) && (
                                        <div className="flex items-center gap-3 p-4">
                                            <Mail className="h-5 w-5 text-neutral-500" />
                                            <div>
                                                <p className="text-xs text-neutral-500">Email</p>
                                                <p className="text-sm font-medium text-white">
                                                    {reservation.guest_email ||
                                                        (reservation.user && reservation.user.email) ||
                                                        (auth.user && auth.user.email)}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {reservation.guest_phone && (
                                        <div className="flex items-center gap-3 p-4">
                                            <Phone className="h-5 w-5 text-neutral-500" />
                                            <div>
                                                <p className="text-xs text-neutral-500">Phone</p>
                                                <p className="text-sm font-medium text-white">{reservation.guest_phone}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <motion.div
                                className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4"
                                variants={staggerContainer}
                                initial="hidden"
                                animate="visible"
                            >
                                <motion.div variants={fadeIn} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="flex-1">
                                    <Link
                                        href="/"
                                        className="flex w-full items-center justify-center rounded-md bg-gradient-to-r from-red-600 to-red-700 px-4 py-3 text-base font-medium text-white shadow-lg shadow-red-600/20 transition-all hover:from-red-700 hover:to-red-800"
                                    >
                                        <Home className="mr-2 h-5 w-5" />
                                        Return to Home
                                    </Link>
                                </motion.div>

                                <motion.div variants={fadeIn} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="flex-1">
                                    <a
                                        href={route('reservations.download-ticket', reservation.id)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex w-full items-center justify-center rounded-md border border-neutral-600 bg-neutral-800 px-4 py-3 text-base font-medium text-white shadow-md transition-all hover:bg-neutral-700"
                                    >
                                        <Download className="mr-2 h-5 w-5" />
                                        Download Ticket
                                    </a>
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </ClientLayout>
    );
}
