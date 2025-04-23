import AdminLayout from '@/layouts/AdminLayout';
import { CalendarIcon, ClockIcon, FilmIcon } from '@heroicons/react/24/outline';
import CreditCardIcon from '@heroicons/react/24/outline/CreditCardIcon.js';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { formatShortDate, formatTime } from '../../../utils/dateUtils';

interface Film {
    id: number;
    title: string;
}

interface Screening {
    id: number;
    start_time: string;
    room: string;
    total_seats: number;
    film: {
        id: number;
        title: string;
    };
    occupied_seats: number;
    seats_count: number;
}

interface Props {
    screenings: {
        data: Screening[];
        links: { url: string | null; label: string; active: boolean }[];
        total: number;
        current_page: number;
        last_page: number;
    };
    films: Film[];
    filters: {
        film_id?: string;
        date?: string;
        is_full?: string;
        is_future?: string;
    };
}

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 24,
        },
    },
};

export default function Screenings({ screenings, films, filters }: Props) {
    const { data, setData, get } = useForm({
        film_id: filters.film_id || '',
        date: filters.date || '',
        is_full: filters.is_full || 'false',
        is_future: filters.is_future || 'false',
    });

    // Reference to track previous filter state
    const prevFiltersRef = useRef({
        film_id: filters.film_id || '',
        date: filters.date || '',
        is_full: filters.is_full || 'false',
        is_future: filters.is_future || 'false',
    });

    // Apply filters automatically when they change
    useEffect(() => {
        // Check if any filter has changed to avoid unnecessary requests
        if (
            prevFiltersRef.current.film_id !== data.film_id ||
            prevFiltersRef.current.date !== data.date ||
            prevFiltersRef.current.is_full !== data.is_full ||
            prevFiltersRef.current.is_future !== data.is_future
        ) {
            // Update previous filter state
            prevFiltersRef.current = { ...data };

            // Make the request with query parameters
            get(
                route('admin.reports.screenings', {
                    film_id: data.film_id || undefined,
                    date: data.date || undefined,
                    is_full: data.is_full,
                    is_future: data.is_future,
                }),
                {
                    preserveState: true,
                    replace: true,
                },
            );
        }
    }, [data.film_id, data.date, data.is_full, data.is_future]);

    const handleClearFilters = () => {
        setData({
            film_id: '',
            date: '',
            is_full: 'false',
            is_future: 'false',
        });
        // The useEffect will handle submitting the form
    };

    const toggleCheckbox = (name: 'is_full' | 'is_future') => {
        setData(name, data[name] === 'true' ? 'false' : 'true');
        // The useEffect will handle submitting the form
    };

    return (
        <AdminLayout title="Screening Occupancy Report" subtitle="Monitor screening attendance and capacity">
            <Head title="Screening Occupancy Report" />

            {/* Report Navigation */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="border-border bg-card mb-6 rounded-lg border shadow-sm"
            >
                <div className="flex overflow-x-auto">
                    <Link
                        href={route('admin.reports.films')}
                        className="text-muted-foreground hover:text-foreground flex items-center border-b-2 border-transparent px-6 py-3 text-sm font-medium"
                    >
                        <FilmIcon className="mr-2 h-5 w-5" />
                        Film Popularity
                    </Link>
                    <Link
                        href={route('admin.reports.revenue')}
                        className="text-muted-foreground hover:text-foreground flex items-center border-b-2 border-transparent px-6 py-3 text-sm font-medium"
                    >
                        <CreditCardIcon className="mr-2 h-5 w-5" />
                        Revenue
                    </Link>
                    <Link
                        href={route('admin.reports.screenings')}
                        className="border-primary text-primary flex items-center border-b-2 px-6 py-3 text-sm font-medium"
                    >
                        <CalendarIcon className="mr-2 h-5 w-5" />
                        Screening Occupancy
                    </Link>
                </div>
            </motion.div>

            {/* Header with actions */}
            <motion.div
                className="mb-6 flex items-center justify-between"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
            >
                <div className="flex items-center">
                    <motion.div whileHover={{ rotate: 10 }} className="bg-primary/10 mr-2 flex h-10 w-10 items-center justify-center rounded-lg">
                        <CalendarIcon className="text-primary h-6 w-6" />
                    </motion.div>
                    <div>
                        <h2 className="text-foreground text-lg font-semibold">Screening Occupancy</h2>
                        <p className="text-muted-foreground text-sm">Monitor seat utilization and identify popular time slots</p>
                    </div>
                </div>
            </motion.div>

            {/* Search and filters */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="border-border bg-card mb-6 rounded-lg border p-4 shadow-sm"
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                            <label htmlFor="film_id" className="text-foreground mb-1 block text-sm font-medium">
                                Film
                            </label>
                            <motion.select
                                whileFocus={{ scale: 1.01 }}
                                transition={{ duration: 0.2 }}
                                id="film_id"
                                value={data.film_id}
                                onChange={(e) => setData('film_id', e.target.value)}
                                className="focus:border-primary focus:ring-primary/30 bg-background text-foreground border-input placeholder:text-muted-foreground w-full rounded-md border px-3 py-2 shadow-sm"
                            >
                                <option value="">All Films</option>
                                {films.map((film) => (
                                    <option key={film.id} value={film.id}>
                                        {film.title}
                                    </option>
                                ))}
                            </motion.select>
                        </div>

                        <div>
                            <label htmlFor="date" className="text-foreground mb-1 block text-sm font-medium">
                                Date
                            </label>
                            <motion.input
                                whileFocus={{ scale: 1.01 }}
                                transition={{ duration: 0.2 }}
                                id="date"
                                type="date"
                                value={data.date}
                                onChange={(e) => setData('date', e.target.value)}
                                className="focus:border-primary focus:ring-primary/30 bg-background text-foreground border-input placeholder:text-muted-foreground w-full rounded-md border px-3 py-2 shadow-sm"
                            />
                        </div>

                        <div className="flex flex-col justify-end space-y-2">
                            <div className="flex items-center space-x-2">
                                <motion.input
                                    whileTap={{ scale: 0.9 }}
                                    id="is_full"
                                    type="checkbox"
                                    className="focus:ring-primary/30 border-input text-primary h-4 w-4 rounded"
                                    checked={data.is_full === 'true'}
                                    onChange={() => toggleCheckbox('is_full')}
                                />
                                <label htmlFor="is_full" className="text-foreground text-sm">
                                    Show only fully booked screenings
                                </label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <motion.input
                                    whileTap={{ scale: 0.9 }}
                                    id="is_future"
                                    type="checkbox"
                                    className="focus:ring-primary/30 border-input text-primary h-4 w-4 rounded"
                                    checked={data.is_future === 'true'}
                                    onChange={() => toggleCheckbox('is_future')}
                                />
                                <label htmlFor="is_future" className="text-foreground text-sm">
                                    Show only future screenings
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        {(data.film_id || data.date || data.is_full === 'true' || data.is_future === 'true') && (
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                type="button"
                                onClick={handleClearFilters}
                                className="border-border text-foreground hover:bg-muted inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium transition"
                            >
                                Clear Filters
                            </motion.button>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Screenings list table */}
            <motion.div
                className="overflow-hidden rounded-lg shadow-md transition-shadow hover:shadow-lg"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <div className="border-border bg-card relative overflow-x-auto border">
                    <table className="divide-border min-w-full divide-y">
                        <thead className="bg-muted">
                            <tr>
                                <th scope="col" className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                                    Film
                                </th>
                                <th scope="col" className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                                    Date & Time
                                </th>
                                <th scope="col" className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                                    Room
                                </th>
                                <th scope="col" className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                                    Occupied
                                </th>
                                <th scope="col" className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                                    Capacity
                                </th>
                                <th scope="col" className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                                    Occupancy Rate
                                </th>
                                <th scope="col" className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-border bg-card divide-y">
                            {screenings.data.length > 0 ? (
                                screenings.data.map((screening, index) => {
                                    const occupancyRate = (screening.occupied_seats / screening.total_seats) * 100;
                                    return (
                                        <motion.tr
                                            key={screening.id}
                                            className="hover:bg-muted/40 transition-colors"
                                            variants={itemVariants}
                                            custom={index}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <motion.div whileHover={{ scale: 1.2, rotate: 5 }} transition={{ duration: 0.2 }}>
                                                        <FilmIcon className="text-primary mr-2 h-5 w-5" />
                                                    </motion.div>
                                                    <div className="text-foreground text-sm font-medium">{screening.film.title}</div>
                                                </div>
                                            </td>
                                            <td className="text-foreground px-6 py-4 text-sm whitespace-nowrap">
                                                <div className="space-y-1">
                                                    <div className="font-medium">{formatShortDate(screening.start_time)}</div>
                                                    <div className="text-muted-foreground flex items-center text-xs">
                                                        <ClockIcon className="mr-1 h-3 w-3" />
                                                        {formatTime(screening.start_time)}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm whitespace-nowrap">
                                                <span className="bg-primary/10 text-primary inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium">
                                                    {screening.room}
                                                </span>
                                            </td>
                                            <td className="text-foreground px-6 py-4 text-sm whitespace-nowrap">{screening.occupied_seats}</td>
                                            <td className="text-foreground px-6 py-4 text-sm whitespace-nowrap">{screening.total_seats}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center space-x-2">
                                                    <div className="bg-muted h-2 w-32 overflow-hidden rounded-full">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${occupancyRate}%` }}
                                                            transition={{ duration: 0.8, delay: index * 0.1 }}
                                                            className={`h-full ${
                                                                occupancyRate >= 90
                                                                    ? 'bg-success'
                                                                    : occupancyRate >= 70
                                                                      ? 'bg-warning'
                                                                      : occupancyRate >= 30
                                                                        ? 'bg-primary'
                                                                        : 'bg-muted-foreground'
                                                            }`}
                                                        />
                                                    </div>
                                                    <span
                                                        className={`text-xs font-medium ${
                                                            occupancyRate >= 90
                                                                ? 'text-success'
                                                                : occupancyRate >= 70
                                                                  ? 'text-warning'
                                                                  : 'text-muted-foreground'
                                                        }`}
                                                    >
                                                        {occupancyRate.toFixed(1)}%
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                                    <Link
                                                        href={route('admin.screenings.show', { screening: screening.id })}
                                                        className="text-primary hover:text-primary/80 inline-flex items-center transition"
                                                    >
                                                        View Details
                                                    </Link>
                                                </motion.div>
                                            </td>
                                        </motion.tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <motion.div
                                                initial={{ scale: 0.5, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={{ duration: 0.5 }}
                                            >
                                                <CalendarIcon className="text-muted-foreground mb-4 h-12 w-12" />
                                            </motion.div>
                                            <p className="text-muted-foreground mb-4 text-sm">
                                                {data.film_id || data.date || data.is_full === 'true' || data.is_future === 'true'
                                                    ? 'No screenings match your filter criteria.'
                                                    : 'No screenings data available.'}
                                            </p>
                                            {(data.film_id || data.date || data.is_full === 'true' || data.is_future === 'true') && (
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={handleClearFilters}
                                                    className="bg-primary hover:bg-primary/90 focus:ring-primary/30 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-white transition focus:ring-2 focus:outline-none"
                                                >
                                                    Clear Filters
                                                </motion.button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Pagination */}
            {screenings.data.length > 0 && screenings.last_page > 1 && (
                <motion.div
                    className="mt-6 flex items-center justify-between border-t pt-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                >
                    <div className="text-muted-foreground text-sm">
                        Showing <span className="text-foreground font-medium">{screenings.current_page}</span> of{' '}
                        <span className="text-foreground font-medium">{screenings.last_page}</span> pages
                    </div>
                    <div className="flex space-x-2">
                        {screenings.links.map((link, i) => {
                            if (link.label === '&laquo; Previous') {
                                return (
                                    <motion.div key={i} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Link
                                            href={link.url || '#'}
                                            className={`border-border hover:bg-muted flex items-center rounded-md border px-3 py-1 text-sm ${
                                                !link.url ? 'pointer-events-none opacity-50' : ''
                                            }`}
                                        >
                                            Previous
                                        </Link>
                                    </motion.div>
                                );
                            } else if (link.label === 'Next &raquo;') {
                                return (
                                    <motion.div key={i} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Link
                                            href={link.url || '#'}
                                            className={`border-border hover:bg-muted flex items-center rounded-md border px-3 py-1 text-sm ${
                                                !link.url ? 'pointer-events-none opacity-50' : ''
                                            }`}
                                        >
                                            Next
                                        </Link>
                                    </motion.div>
                                );
                            } else {
                                return (
                                    <motion.div key={i} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Link
                                            href={link.url || '#'}
                                            className={`border-border flex h-8 w-8 items-center justify-center rounded-md border text-sm ${
                                                link.active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-foreground'
                                            } ${!link.url ? 'pointer-events-none opacity-50' : ''}`}
                                        >
                                            {link.label}
                                        </Link>
                                    </motion.div>
                                );
                            }
                        })}
                    </div>
                </motion.div>
            )}

            {/* Summary Stats */}
            {screenings.data.length > 0 && (
                <motion.div
                    className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.5 }}
                >
                    <motion.div
                        variants={itemVariants}
                        className="border-border bg-card overflow-hidden rounded-lg border p-6 shadow-sm transition-shadow hover:shadow-md"
                    >
                        <div className="flex items-center">
                            <motion.div
                                whileHover={{ rotate: 10, scale: 1.1 }}
                                transition={{ duration: 0.2 }}
                                className="bg-primary/10 text-primary mr-4 flex h-12 w-12 items-center justify-center rounded-full"
                            >
                                <CalendarIcon className="h-6 w-6" />
                            </motion.div>
                            <div>
                                <p className="text-muted-foreground text-sm">Total Screenings</p>
                                <p className="text-foreground mt-1 text-2xl font-bold">{screenings.total}</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        variants={itemVariants}
                        className="border-border bg-card overflow-hidden rounded-lg border p-6 shadow-sm transition-shadow hover:shadow-md"
                    >
                        <div className="flex items-center">
                            <motion.div
                                whileHover={{ rotate: 10, scale: 1.1 }}
                                transition={{ duration: 0.2 }}
                                className="bg-primary/10 text-primary mr-4 flex h-12 w-12 items-center justify-center rounded-full"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                    />
                                </svg>
                            </motion.div>
                            <div>
                                <p className="text-muted-foreground text-sm">Average Occupancy</p>
                                <p className="text-foreground mt-1 text-2xl font-bold">
                                    {screenings.data.length
                                        ? (
                                              screenings.data.reduce(
                                                  (acc, screening) => acc + (screening.occupied_seats / screening.total_seats) * 100,
                                                  0,
                                              ) / screenings.data.length || 0
                                          ).toFixed(1)
                                        : 0}
                                    %
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        variants={itemVariants}
                        className="border-border bg-card overflow-hidden rounded-lg border p-6 shadow-sm transition-shadow hover:shadow-md"
                    >
                        <div className="flex items-center">
                            <motion.div
                                whileHover={{ rotate: 10, scale: 1.1 }}
                                transition={{ duration: 0.2 }}
                                className="bg-primary/10 text-primary mr-4 flex h-12 w-12 items-center justify-center rounded-full"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                                    />
                                </svg>
                            </motion.div>
                            <div>
                                <p className="text-muted-foreground text-sm">Full Capacity Screenings</p>
                                <p className="text-foreground mt-1 text-2xl font-bold">
                                    {screenings.data.filter((screening) => screening.occupied_seats === screening.total_seats).length}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AdminLayout>
    );
}
