import AdminLayout from '@/layouts/AdminLayout';
import { CalendarIcon, CreditCardIcon, EyeIcon, FilmIcon, MagnifyingGlassIcon, TrashIcon, UserIcon } from '@heroicons/react/24/outline';
import { Head, Link, router, useForm } from '@inertiajs/react';
import React, { useState } from 'react';

interface Film {
    id: number;
    title: string;
}

interface Screening {
    id: number;
    start_time: string;
}

interface Payment {
    id: number;
    amount: number;
    payment_method: string;
    status: string;
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface Reservation {
    id: number;
    screening: {
        id: number;
        film: {
            id: number;
            title: string;
        };
        start_time: string;
    };
    user: User | null;
    payment: Payment | null;
    status: string;
    total_price: number;
    seats_count: number;
    created_at: string;
    guest_name?: string;
    guest_email?: string;
}

interface Props {
    reservations: {
        data: Reservation[];
        links: any[];
        total: number;
        current_page: number;
        last_page: number;
    };
    films: Film[];
    screenings: Screening[];
    filters: {
        film_id?: string;
        screening_id?: string;
        status?: string;
        date?: string;
    };
    statuses: string[];
}

export default function Index({ reservations, films, screenings, filters, statuses }: Props) {
    const { data, setData, get, processing } = useForm({
        film_id: filters.film_id || '',
        screening_id: filters.screening_id || '',
        status: filters.status || '',
        date: filters.date || '',
    });

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [reservationToDelete, setReservationToDelete] = useState<number | null>(null);

    // Use React's useEffect to trigger filtering when form data changes
    React.useEffect(() => {
        // Don't run on initial mount
        const currentFilters = {
            film_id: data.film_id,
            screening_id: data.screening_id,
            status: data.status,
            date: data.date
        };

        if (JSON.stringify(filters) !== JSON.stringify(currentFilters)) {
            // Use debounce to avoid rapid-fire requests when multiple filters change
            const timeoutId = setTimeout(() => {
                // Double check that the component is still mounted before making the request
                get(route('admin.reservations.index'), {
                    preserveState: true,
                    replace: true,
                });
            }, 300);

            return () => clearTimeout(timeoutId);
        }
    }, [data.film_id, data.screening_id, data.status, data.date]);

    // Handle film filter change with debounce handling
    const handleFilmChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;

        // First set the film ID
        setData('film_id', value);

        // Then clear the screening ID - this needs to happen after setting film_id
        // but before the filtering happens
        if (data.screening_id) {
            setData('screening_id', '');
        }
    };

    // Handle screening filter change
    const handleScreeningChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setData('screening_id', e.target.value);
    };

    // Handle status filter change
    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setData('status', e.target.value);
    };

    // Handle date filter change
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData('date', e.target.value);
    };

    // Keep the form submission handler for compatibility
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        get(route('admin.reservations.index'), {
            preserveState: true,
            replace: true,
        });
    };

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

    const formatCurrency = (amount: number | null | undefined) => {
        if (amount === null || amount === undefined || isNaN(amount)) {
            return '$0.00';
        }

        // Convert to number if it's a string and ensure it's a valid number
        const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

        if (isNaN(numericAmount)) {
            return '$0.00';
        }

        // Format with 2 decimal places
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(numericAmount);
    };

    const handleDelete = (id: number) => {
        setReservationToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (reservationToDelete) {
            router.delete(route('admin.reservations.destroy', { reservation: reservationToDelete }), {
                onSuccess: () => {
                    setIsDeleteModalOpen(false);
                    setReservationToDelete(null);
                },
            });
        }
    };

    const handleClearFilters = () => {
        // Clear all filters in a consistent way
        setData({
            film_id: '',
            screening_id: '',
            status: '',
            date: '',
        });

        // Use a small timeout to ensure state is updated before triggering the request
        setTimeout(() => {
            get(route('admin.reservations.index'), {
                preserveState: true,
                replace: true,
            });
        }, 50);
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'bg-success/20 text-success';
            case 'pending':
                return 'bg-warning/20 text-warning';
            case 'cancelled':
                return 'bg-destructive/20 text-destructive';
            default:
                return 'bg-muted text-muted-foreground';
        }
    };

    return (
        <AdminLayout title="Reservations Management" subtitle="Manage customer reservations">
            <Head title="Reservations Management" />

            {/* Header with actions */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <CreditCardIcon className="w-6 h-6 mr-2 text-primary" />
                    <h2 className="text-lg font-semibold text-foreground">Reservations</h2>
                    <span className="px-2 py-1 ml-3 text-xs font-medium rounded-md bg-muted">{reservations.total} total</span>
                </div>
            </div>

            {/* Search and filters */}
            <div className="bg-card">
                <div>
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <div>
                                <select
                                    id="film_id"
                                    value={data.film_id}
                                    onChange={handleFilmChange}
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
                                <select
                                    id="screening_id"
                                    value={data.screening_id}
                                    onChange={handleScreeningChange}
                                    className="w-full px-3 py-2 border rounded-md focus:border-primary focus:ring-primary/30 bg-background text-foreground border-input placeholder:text-muted-foreground"
                                    disabled={!data.film_id || screenings.length === 0}
                                >
                                    <option value="">All Screenings</option>
                                    {screenings.map((screening) => (
                                        <option key={screening.id} value={screening.id}>
                                            {formatDate(screening.start_time)} {formatTime(screening.start_time)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <select
                                    id="status"
                                    value={data.status}
                                    onChange={handleStatusChange}
                                    className="w-full px-3 py-2 border rounded-md focus:border-primary focus:ring-primary/30 bg-background text-foreground border-input placeholder:text-muted-foreground"
                                >
                                    <option value="">All Statuses</option>
                                    {statuses.map((status) => (
                                        <option key={status} value={status}>
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <input
                                    id="date"
                                    type="date"
                                    value={data.date}
                                    onChange={handleDateChange}
                                    className="w-full px-3 py-2 border rounded-md focus:border-primary focus:ring-primary/30 bg-background text-foreground border-input placeholder:text-muted-foreground"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end space-x-3">
                            {(data.film_id || data.screening_id || data.status || data.date) && (
                                <button
                                    type="button"
                                    onClick={handleClearFilters}
                                    className="inline-flex items-center px-4 py-2 text-sm font-medium transition border rounded-md border-border text-foreground hover:bg-muted"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            {/* Reservations list table */}
            <div className="overflow-hidden rounded-lg shadow">
                <div className="relative overflow-x-auto border border-border bg-card">
                    <table className="min-w-full divide-y divide-border">
                        <thead className="bg-muted">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">
                                    ID
                                </th>
                                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">
                                    Film / Screening
                                </th>
                                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">
                                    Customer
                                </th>
                                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">
                                    Date Created
                                </th>
                                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">
                                    Seats
                                </th>
                                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">
                                    Total
                                </th>
                                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">
                                    Status
                                </th>
                                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border bg-card">
                            {reservations.data.length > 0 ? (
                                reservations.data.map((reservation) => (
                                    <tr key={reservation.id} className="transition-colors hover:bg-muted/40">
                                        <td className="px-6 py-4 text-sm font-medium text-foreground whitespace-nowrap">#{reservation.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <FilmIcon className="w-5 h-5 mr-2 text-primary" />
                                                <div>
                                                    <div className="text-sm font-medium text-foreground">{reservation.screening.film.title}</div>
                                                    <div className="flex items-center text-xs text-muted-foreground">
                                                        <CalendarIcon className="w-3 h-3 mr-1" />
                                                        {formatDate(reservation.screening.start_time)} {formatTime(reservation.screening.start_time)}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <UserIcon className="w-5 h-5 mr-2 text-muted-foreground" />
                                                <div>
                                                    <div className="text-sm font-medium text-foreground">
                                                        {reservation.user ? reservation.user.name : reservation.guest_name || 'Guest'}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {reservation.user ? reservation.user.email : reservation.guest_email || 'No email'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-foreground whitespace-nowrap">{formatDate(reservation.created_at)}</td>
                                        <td className="px-6 py-4 text-sm text-center text-foreground whitespace-nowrap">{reservation.seats_count}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-foreground whitespace-nowrap">
                                            {formatCurrency(reservation.total_price)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(
                                                    reservation.status,
                                                )}`}
                                            >
                                                {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex space-x-2">
                                                <Link
                                                    href={route('admin.reservations.show', { reservation: reservation.id })}
                                                    className="transition text-primary hover:text-primary/80"
                                                    title="View"
                                                >
                                                    <EyeIcon className="w-5 h-5" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(reservation.id)}
                                                    className="transition text-destructive hover:text-destructive/80"
                                                    title="Delete"
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <CreditCardIcon className="w-12 h-12 mb-4 text-muted-foreground" />
                                            <p className="mb-4 text-sm text-muted-foreground">
                                                {data.film_id || data.screening_id || data.status || data.date
                                                    ? 'No reservations match your filter criteria.'
                                                    : 'No reservations have been made yet.'}
                                            </p>
                                            {(data.film_id || data.screening_id || data.status || data.date) && (
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
            {reservations.data.length > 0 && reservations.last_page > 1 && (
                <div className="flex items-center justify-between pt-6 mt-6 border-t">
                    <div className="text-sm text-muted-foreground">
                        Showing <span className="font-medium text-foreground">{reservations.current_page}</span> of{' '}
                        <span className="font-medium text-foreground">{reservations.last_page}</span> pages
                    </div>
                    <div className="flex space-x-2">
                        {reservations.links.map((link, i) => {
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

            {/* Delete confirmation modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="w-full max-w-md p-6 rounded-lg shadow-lg bg-card">
                        <div className="flex items-center mb-4">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-destructive/10 text-destructive">
                                <TrashIcon className="w-5 h-5" />
                            </div>
                            <h3 className="ml-3 text-lg font-medium text-foreground">Delete Reservation</h3>
                        </div>

                        <p className="mb-6 text-muted-foreground">
                            Are you sure you want to delete this reservation? This action cannot be undone and will release all reserved seats.
                        </p>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="px-4 py-2 text-sm font-medium border rounded-md border-border text-foreground hover:bg-muted focus:outline-none"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 text-sm font-medium rounded-md bg-destructive hover:bg-destructive/90 text-destructive-foreground focus:outline-none"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
