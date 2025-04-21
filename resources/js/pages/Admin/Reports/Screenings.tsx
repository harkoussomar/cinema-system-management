import AdminLayout from '@/layouts/AdminLayout';
import { CalendarIcon, ClockIcon, FilmIcon, MagnifyingGlassIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import { Head, Link, useForm } from '@inertiajs/react';
import React, { useEffect, useRef } from 'react';

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
        links: any[];
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

export default function Screenings({ screenings, films, filters }: Props) {
    const { data, setData, get, processing } = useForm({
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

            // Make the request
            get(route('admin.reports.screenings'), {
                data: {
                    film_id: data.film_id || null,
                    date: data.date || null,
                    is_full: data.is_full,
                    is_future: data.is_future,
                },
                preserveState: true,
                replace: true,
            });
        }
    }, [data.film_id, data.date, data.is_full, data.is_future]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

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
            <div className="mb-6 border rounded-lg shadow-sm border-border bg-card">
                <div className="flex overflow-x-auto">
                    <Link
                        href={route('admin.reports.films')}
                        className="flex items-center px-6 py-3 text-sm font-medium border-b-2 border-transparent text-muted-foreground hover:text-foreground"
                    >
                        <FilmIcon className="w-5 h-5 mr-2" />
                        Film Popularity
                    </Link>
                    <Link
                        href={route('admin.reports.revenue')}
                        className="flex items-center px-6 py-3 text-sm font-medium border-b-2 border-transparent text-muted-foreground hover:text-foreground"
                    >
                        <CreditCardIcon className="w-5 h-5 mr-2" />
                        Revenue
                    </Link>
                    <Link
                        href={route('admin.reports.screenings')}
                        className="flex items-center px-6 py-3 text-sm font-medium border-b-2 border-primary text-primary"
                    >
                        <CalendarIcon className="w-5 h-5 mr-2" />
                        Screening Occupancy
                    </Link>
                </div>
            </div>

            {/* Header with actions */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <CalendarIcon className="w-6 h-6 mr-2 text-primary" />
                    <h2 className="text-lg font-semibold text-foreground">Screening Occupancy</h2>
                    <span className="px-2 py-1 ml-3 text-xs font-medium rounded-md bg-muted">{screenings.total} total</span>
                </div>
            </div>

            {/* Search and filters */}
            <div className="bg-card">
                <div>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div>
                                <select
                                    id="film_id"
                                    value={data.film_id}
                                    onChange={(e) => setData('film_id', e.target.value)}
                                    className="w-full px-3 py-2 border rounded-md focus:border-primary focus:ring-primary/30 bg-background text-foreground border-input placeholder:text-muted-foreground"
                                >
                                    <option value="">All Films</option>
                                    {films.map((film) => (
                                        <option key={film.id} value={film.id}>
                                            {film.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <input
                                    id="date"
                                    type="date"
                                    value={data.date}
                                    onChange={(e) => setData('date', e.target.value)}
                                    className="w-full px-3 py-2 border rounded-md focus:border-primary focus:ring-primary/30 bg-background text-foreground border-input placeholder:text-muted-foreground"
                                />
                            </div>

                            <div className="flex flex-col justify-end">
                                <div className="flex items-center mb-2 space-x-2">
                                    <input
                                        id="is_full"
                                        type="checkbox"
                                        className="w-4 h-4 rounded focus:ring-primary/30 border-input text-primary"
                                        checked={data.is_full === 'true'}
                                        onChange={() => toggleCheckbox('is_full')}
                                    />
                                    <label htmlFor="is_full" className="text-sm text-foreground">
                                        Show only fully booked screenings
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        id="is_future"
                                        type="checkbox"
                                        className="w-4 h-4 rounded focus:ring-primary/30 border-input text-primary"
                                        checked={data.is_future === 'true'}
                                        onChange={() => toggleCheckbox('is_future')}
                                    />
                                    <label htmlFor="is_future" className="text-sm text-foreground">
                                        Show only future screenings
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            {(data.film_id || data.date || data.is_full === 'true' || data.is_future === 'true') && (
                                <button
                                    type="button"
                                    onClick={handleClearFilters}
                                    className="inline-flex items-center px-4 py-2 text-sm font-medium transition border rounded-md border-border text-foreground hover:bg-muted"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Screenings list table */}
            <div className="overflow-hidden rounded-lg shadow">
                <div className="relative overflow-x-auto border border-border bg-card">
                    <table className="min-w-full divide-y divide-border">
                        <thead className="bg-muted">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">
                                    Film
                                </th>
                                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">
                                    Date & Time
                                </th>
                                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">
                                    Room
                                </th>
                                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">
                                    Occupied
                                </th>
                                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">
                                    Capacity
                                </th>
                                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">
                                    Occupancy Rate
                                </th>
                                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border bg-card">
                            {screenings.data.length > 0 ? (
                                screenings.data.map((screening) => {
                                    const occupancyRate = (screening.occupied_seats / screening.total_seats) * 100;
                                    return (
                                        <tr key={screening.id} className="transition-colors hover:bg-muted/40">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <FilmIcon className="w-5 h-5 mr-2 text-primary" />
                                                    <div className="text-sm font-medium text-foreground">{screening.film.title}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-foreground whitespace-nowrap">
                                                <div className="space-y-1">
                                                    <div className="font-medium">{formatDate(screening.start_time)}</div>
                                                    <div className="flex items-center text-xs text-muted-foreground">
                                                        <ClockIcon className="w-3 h-3 mr-1" />
                                                        {formatTime(screening.start_time)}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-foreground whitespace-nowrap">{screening.room}</td>
                                            <td className="px-6 py-4 text-sm text-foreground whitespace-nowrap">{screening.occupied_seats}</td>
                                            <td className="px-6 py-4 text-sm text-foreground whitespace-nowrap">{screening.total_seats}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-32 h-2 overflow-hidden rounded-full bg-muted">
                                                        <div
                                                            className={`h-full ${occupancyRate >= 90
                                                                ? 'bg-success'
                                                                : occupancyRate >= 70
                                                                    ? 'bg-warning'
                                                                    : occupancyRate >= 30
                                                                        ? 'bg-primary'
                                                                        : 'bg-muted-foreground'
                                                                }`}
                                                            style={{ width: `${occupancyRate}%` }}
                                                        ></div>
                                                    </div>
                                                    <span
                                                        className={`text-xs font-medium ${occupancyRate >= 90
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
                                                <Link
                                                    href={route('admin.screenings.show', { screening: screening.id })}
                                                    className="inline-flex items-center transition text-primary hover:text-primary/80"
                                                >
                                                    View Details
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <CalendarIcon className="w-12 h-12 mb-4 text-muted-foreground" />
                                            <p className="mb-4 text-sm text-muted-foreground">
                                                {data.film_id || data.date || data.is_full === 'true' || data.is_future === 'true'
                                                    ? 'No screenings match your filter criteria.'
                                                    : 'No screenings data available.'}
                                            </p>
                                            {(data.film_id || data.date || data.is_full === 'true' || data.is_future === 'true') && (
                                                <button
                                                    onClick={handleClearFilters}
                                                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white transition rounded-md bg-primary hover:bg-primary/90 focus:ring-primary/30 focus:ring-2 focus:outline-none"
                                                >
                                                    Clear Filters
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {screenings.data.length > 0 && screenings.last_page > 1 && (
                <div className="flex items-center justify-between pt-6 mt-6 border-t">
                    <div className="text-sm text-muted-foreground">
                        Showing <span className="font-medium text-foreground">{screenings.current_page}</span> of{' '}
                        <span className="font-medium text-foreground">{screenings.last_page}</span> pages
                    </div>
                    <div className="flex space-x-2">
                        {screenings.links.map((link, i) => {
                            if (link.label === '&laquo; Previous') {
                                return (
                                    <Link
                                        key={i}
                                        href={link.url || '#'}
                                        className={`border-border hover:bg-muted flex items-center rounded-md border px-3 py-1 text-sm ${!link.url ? 'pointer-events-none opacity-50' : ''
                                            }`}
                                    >
                                        Previous
                                    </Link>
                                );
                            } else if (link.label === 'Next &raquo;') {
                                return (
                                    <Link
                                        key={i}
                                        href={link.url || '#'}
                                        className={`border-border hover:bg-muted flex items-center rounded-md border px-3 py-1 text-sm ${!link.url ? 'pointer-events-none opacity-50' : ''
                                            }`}
                                    >
                                        Next
                                    </Link>
                                );
                            } else {
                                return (
                                    <Link
                                        key={i}
                                        href={link.url || '#'}
                                        className={`border-border flex h-8 w-8 items-center justify-center rounded-md border text-sm ${link.active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-foreground'
                                            } ${!link.url ? 'pointer-events-none opacity-50' : ''}`}
                                    >
                                        {link.label}
                                    </Link>
                                );
                            }
                        })}
                    </div>
                </div>
            )}

            {/* Summary Stats */}
            {screenings.data.length > 0 && (
                <div className="grid grid-cols-1 gap-6 mt-8 md:grid-cols-3">
                    <div className="p-6 overflow-hidden border rounded-lg shadow-sm border-border bg-card">
                        <div className="flex items-center">
                            <div className="flex items-center justify-center w-12 h-12 mr-4 rounded-full bg-primary/10 text-primary">
                                <CalendarIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Screenings</p>
                                <p className="mt-1 text-2xl font-bold text-foreground">{screenings.total}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 overflow-hidden border rounded-lg shadow-sm border-border bg-card">
                        <div className="flex items-center">
                            <div className="flex items-center justify-center w-12 h-12 mr-4 rounded-full bg-primary/10 text-primary">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Average Occupancy</p>
                                <p className="mt-1 text-2xl font-bold text-foreground">
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
                    </div>

                    <div className="p-6 overflow-hidden border rounded-lg shadow-sm border-border bg-card">
                        <div className="flex items-center">
                            <div className="flex items-center justify-center w-12 h-12 mr-4 rounded-full bg-primary/10 text-primary">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Full Capacity Screenings</p>
                                <p className="mt-1 text-2xl font-bold text-foreground">
                                    {screenings.data.filter((screening) => screening.occupied_seats === screening.total_seats).length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
