import ClientLayout from '@/layouts/ClientLayout';
import { CalendarIcon, ClockIcon, UserIcon } from '@heroicons/react/24/outline';
import { Head, Link } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { route } from 'ziggy-js';

interface Seat {
    id: number;
    row: string;
    number: number;
    status: 'available' | 'reserved' | 'sold';
}

interface Screening {
    id: number;
    start_time: string;
    room: string;
    price: number;
    seats: Seat[];
    available_seats_count: number;
    is_fully_booked: boolean;
}

interface Film {
    id: number;
    title: string;
    description: string;
    duration: number;
    poster_image: string | null;
    genre: string | null;
    release_date: string | null;
    director: string | null;
}

interface FilmShowProps {
    film: Film;
    screenings: {
        [date: string]: Screening[];
    };
}

export default function Show({ film, screenings }: FilmShowProps) {
    const [selectedDate, setSelectedDate] = useState<string>(Object.keys(screenings)[0] || '');
    const [scrollY, setScrollY] = useState(0);
    const [trailerOpen, setTrailerOpen] = useState(false);

    // Animation hooks
    const [headerRef, headerInView] = useInView({ triggerOnce: true, threshold: 0.1 });
    const [detailsRef, detailsInView] = useInView({ triggerOnce: true, threshold: 0.1 });
    const [screeningsRef, screeningsInView] = useInView({ triggerOnce: true, threshold: 0.1 });

    // Parallax effect
    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    };

    const formatTime = (dateTimeString: string) => {
        const date = new Date(dateTimeString);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

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

    const scaleIn = {
        hidden: { scale: 0.9, opacity: 0 },
        visible: { scale: 1, opacity: 1, transition: { duration: 0.5 } },
    };

    return (
        <ClientLayout>
            <Head title={`${film.title} | CineVerse`} />
            <div
                style={{
                    backgroundImage: 'linear-gradient(to bottom,#09090b, black)',
                }}
            >
                {/* Cinematic Hero */}
                <section className="relative overflow-hidden bg-black py-32">
                    {/* Background elements */}
                    <div className="absolute inset-0 z-0 opacity-20">
                        <div
                            className="absolute inset-0"
                            style={{
                                backgroundImage: `url(${film.poster_image ? `/storage/${film.poster_image}` : '/storage/images/cinema-pattern.jpg'})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                filter: 'blur(30px)',
                                transform: `scale(1.1) translateY(${scrollY * 0.05}px)`,
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-gray-900/10" />
                    </div>

                    {/* Film info header */}
                    <div ref={headerRef} className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <motion.div
                            initial="hidden"
                            animate={headerInView ? 'visible' : 'hidden'}
                            variants={fadeIn}
                            className="flex flex-col items-center gap-8 md:flex-row md:items-start lg:gap-16"
                        >
                            {/* Film poster with animation */}
                            <motion.div
                                className="w-64 shrink-0 overflow-hidden rounded-lg border border-red-500/20 shadow-[0_0_50px_rgba(229,70,70,0.2)]"
                                initial={{ x: -50, opacity: 0 }}
                                animate={headerInView ? { x: 0, opacity: 1 } : { x: -50, opacity: 0 }}
                                transition={{ duration: 0.7, delay: 0.2 }}
                            >
                                {film.poster_image ? (
                                    <div className="relative aspect-[2/3]">
                                        <img
                                            src={`/storage/${film.poster_image}`}
                                            alt={film.title}
                                            className="h-full w-full object-cover object-center"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 via-transparent to-transparent" />
                                    </div>
                                ) : (
                                    <div className="flex aspect-[2/3] items-center justify-center bg-gray-800">
                                        <svg className="h-16 w-16 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={1}
                                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                            />
                                        </svg>
                                    </div>
                                )}
                            </motion.div>

                            {/* Title and details with animations */}
                            <div className="flex-1 text-center md:text-left">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                    transition={{ duration: 0.6, delay: 0.4 }}
                                >
                                    <div className="mb-4 inline-flex items-center">
                                        <span className="bg-primary/70 h-[1px] w-8"></span>
                                        <span className="text-primary/80 mx-3 text-sm font-medium tracking-[0.2em] uppercase">
                                            {film.genre || 'Feature Film'}
                                        </span>
                                        <span className="bg-primary/70 h-[1px] w-8"></span>
                                    </div>
                                    <h1 className="mb-4 text-3xl font-bold text-white md:text-4xl lg:text-5xl">{film.title}</h1>

                                    <div className="mt-4 mb-6 flex flex-wrap justify-center gap-4 text-gray-300/80 md:justify-start">
                                        <div className="flex items-center">
                                            <ClockIcon className="text-primary mr-2 h-5 w-5" />
                                            <span>{film.duration} minutes</span>
                                        </div>

                                        {film.director && (
                                            <div className="flex items-center">
                                                <UserIcon className="text-primary mr-2 h-5 w-5" />
                                                <span>Director: {film.director}</span>
                                            </div>
                                        )}

                                        {film.release_date && (
                                            <div className="flex items-center">
                                                <CalendarIcon className="text-primary mr-2 h-5 w-5" />
                                                <span>Released: {new Date(film.release_date).getFullYear()}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-8 space-y-4">
                                        <div className="max-w-2xl text-base text-gray-300/80">
                                            <p className="line-clamp-3 md:line-clamp-4">{film.description}</p>
                                        </div>

                                        <div className="mt-8 flex flex-wrap justify-center gap-4 md:justify-start">
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setTrailerOpen(true)}
                                                className="bg-primary hover:bg-primary/90 focus:ring-primary/50 inline-flex items-center rounded-md border border-transparent px-6 py-3 text-base font-medium text-white shadow-lg transition-colors duration-200 focus:ring-2 focus:ring-offset-2 focus:outline-none"
                                            >
                                                <svg className="mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                                Watch Trailer
                                            </motion.button>

                                            <a
                                                href="#screenings"
                                                className="text-primary bg-primary/10 border-primary/30 hover:bg-primary/20 focus:ring-primary/50 inline-flex items-center rounded-md border px-6 py-3 text-base font-medium shadow-md transition-colors duration-200 focus:ring-2 focus:ring-offset-2 focus:outline-none"
                                            >
                                                <svg className="mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                                View Screenings
                                            </a>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Main Content */}
                <div className="py-16">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        {/* Film details section */}
                        <section ref={detailsRef} className="mb-20">
                            <motion.div initial="hidden" animate={detailsInView ? 'visible' : 'hidden'} variants={fadeIn}>
                                <h2 className="mb-6 text-2xl font-bold text-white">About the Film</h2>

                                <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-8 shadow-lg">
                                    <div className="prose prose-invert max-w-none">
                                        <p className="whitespace-pre-line text-gray-300">{film.description}</p>
                                    </div>

                                    {/* Credits and additional details */}
                                    <div className="mt-8 grid grid-cols-1 gap-6 border-t border-gray-700 pt-6 md:grid-cols-2">
                                        <div>
                                            <h3 className="mb-3 text-lg font-medium text-white">Film Details</h3>
                                            <dl className="space-y-2">
                                                {film.director && (
                                                    <div className="flex">
                                                        <dt className="w-32 flex-shrink-0 text-gray-400">Director:</dt>
                                                        <dd className="text-gray-300">{film.director}</dd>
                                                    </div>
                                                )}

                                                {film.genre && (
                                                    <div className="flex">
                                                        <dt className="w-32 flex-shrink-0 text-gray-400">Genre:</dt>
                                                        <dd>
                                                            <span className="inline-flex items-center rounded-full border border-indigo-800/50 bg-indigo-900/50 px-2.5 py-0.5 text-xs font-medium text-indigo-300">
                                                                {film.genre}
                                                            </span>
                                                        </dd>
                                                    </div>
                                                )}

                                                {film.release_date && (
                                                    <div className="flex">
                                                        <dt className="w-32 flex-shrink-0 text-gray-400">Release Date:</dt>
                                                        <dd className="text-gray-300">
                                                            {new Date(film.release_date).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric',
                                                            })}
                                                        </dd>
                                                    </div>
                                                )}

                                                <div className="flex">
                                                    <dt className="w-32 flex-shrink-0 text-gray-400">Runtime:</dt>
                                                    <dd className="text-gray-300">{film.duration} minutes</dd>
                                                </div>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </section>

                        {/* Screenings section with animation */}
                        <section id="screenings" ref={screeningsRef} className="scroll-mt-20">
                            <motion.div initial="hidden" animate={screeningsInView ? 'visible' : 'hidden'} variants={fadeIn}>
                                <div className="mb-12 text-center">
                                    <h2 className="mb-4 text-3xl font-bold text-white">Available Screenings</h2>
                                    <div className="flex justify-center">
                                        <motion.div
                                            className="from-primary to-primary/50 h-1 w-24 rounded-full bg-gradient-to-r"
                                            initial={{ width: 0 }}
                                            animate={screeningsInView ? { width: '6rem' } : { width: 0 }}
                                            transition={{ delay: 0.3, duration: 0.8 }}
                                        />
                                    </div>
                                    <p className="mx-auto mt-4 max-w-2xl text-gray-400">
                                        Select a date and time to book your tickets for {film.title}
                                    </p>
                                </div>

                                {Object.keys(screenings).length === 0 ? (
                                    <motion.div variants={scaleIn} className="rounded-lg border border-gray-700 bg-gray-800/50 p-6 text-center">
                                        <svg className="mx-auto mb-4 h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={1.5}
                                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                            />
                                        </svg>
                                        <h3 className="mb-1 text-lg font-medium text-white">No Screenings Available</h3>
                                        <p className="text-gray-400">Check back later for upcoming screenings of this film.</p>
                                    </motion.div>
                                ) : (
                                    <>
                                        {/* Date selection with animation */}
                                        <motion.div variants={staggerContainer} className="mb-8 flex justify-center space-x-2 overflow-x-auto pb-4">
                                            {Object.keys(screenings).map((date) => (
                                                <motion.button
                                                    key={date}
                                                    onClick={() => setSelectedDate(date)}
                                                    variants={scaleIn}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className={`relative overflow-hidden rounded-full px-6 py-3 text-sm font-medium transition-all duration-200 ${
                                                        selectedDate === date
                                                            ? 'bg-primary shadow-primary/20 text-white shadow-lg'
                                                            : 'border border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700'
                                                    }`}
                                                >
                                                    {formatDate(date)}
                                                    {selectedDate === date && (
                                                        <motion.span
                                                            layoutId="dateBubble"
                                                            className="bg-primary/80 absolute right-0 bottom-0 left-0 h-1"
                                                            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                                        />
                                                    )}
                                                </motion.button>
                                            ))}
                                        </motion.div>

                                        {/* Screenings for selected date */}
                                        <AnimatePresence mode="wait">
                                            {selectedDate && (
                                                <motion.div
                                                    key={selectedDate}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -20 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                                                >
                                                    {screenings[selectedDate]?.map((screening) => (
                                                        <motion.div
                                                            key={screening.id}
                                                            whileHover={{ y: -5, transition: { duration: 0.2 } }}
                                                            className={`relative overflow-hidden rounded-xl border border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900 p-6 shadow-xl ${
                                                                screening.is_fully_booked ? 'opacity-60' : ''
                                                            }`}
                                                        >
                                                            <div className="from-primary to-primary/50 absolute top-0 right-0 left-0 h-1 bg-gradient-to-r" />

                                                            <div className="mb-4 flex items-start justify-between">
                                                                <div>
                                                                    <div className="flex items-center">
                                                                        <svg
                                                                            className="text-primary mr-2 h-5 w-5"
                                                                            viewBox="0 0 20 20"
                                                                            fill="currentColor"
                                                                        >
                                                                            <path
                                                                                fillRule="evenodd"
                                                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                                                                clipRule="evenodd"
                                                                            />
                                                                        </svg>
                                                                        <p className="text-xl font-bold text-white">
                                                                            {formatTime(screening.start_time)}
                                                                        </p>
                                                                    </div>
                                                                    <p className="mt-1 text-gray-400">Room: {screening.room}</p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-lg font-bold text-white">
                                                                        ${Number(screening.price).toFixed(2)}
                                                                    </p>
                                                                    <p className="mt-1 text-xs text-gray-400">
                                                                        {screening.available_seats_count}{' '}
                                                                        {screening.available_seats_count === 1 ? 'seat' : 'seats'} available
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="mt-6">
                                                                {screening.is_fully_booked ? (
                                                                    <button
                                                                        disabled
                                                                        className="w-full cursor-not-allowed rounded-md bg-gray-700 py-3 text-sm font-medium text-gray-400"
                                                                    >
                                                                        Sold Out
                                                                    </button>
                                                                ) : (
                                                                    <Link
                                                                        href={route('reservations.seat-selection', {
                                                                            screening: screening.id,
                                                                        })}
                                                                        className="bg-primary hover:bg-primary/90 shadow-primary/10 block w-full rounded-md py-3 text-center text-sm font-medium text-white shadow-lg transition-colors duration-200"
                                                                    >
                                                                        Select Seats
                                                                    </Link>
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </>
                                )}
                            </motion.div>
                        </section>
                    </div>
                </div>

                {/* Trailer Modal */}
                <AnimatePresence>
                    {trailerOpen && (
                        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                            <div className="flex min-h-screen items-end justify-center p-4 text-center sm:items-center sm:p-0">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="fixed inset-0 bg-black/80 backdrop-blur-sm"
                                    onClick={() => setTrailerOpen(false)}
                                />

                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.3 }}
                                    className="relative transform overflow-hidden rounded-lg text-left shadow-xl sm:my-8 sm:w-full sm:max-w-5xl"
                                >
                                    <div className="bg-gray-900 p-4">
                                        <div className="aspect-w-16 aspect-h-9">
                                            <div className="flex h-full w-full items-center justify-center bg-gray-800">
                                                <p className="text-center text-gray-400">Trailer not available. This is a demo application.</p>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex justify-end">
                                            <button
                                                type="button"
                                                className="rounded-md border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 focus:outline-none"
                                                onClick={() => setTrailerOpen(false)}
                                            >
                                                Close
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </ClientLayout>
    );
}
