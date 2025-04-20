import AdminLayout from '@/layouts/AdminLayout';
import { ArrowLeftIcon, CalendarIcon, CreditCardIcon, FilmIcon, TrashIcon, UserIcon } from '@heroicons/react/24/outline';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

interface Seat {
    id: number;
    row: string;
    number: number;
    status: string;
}

interface ReservationSeat {
    id: number;
    seat: Seat;
}

interface Payment {
    id: number;
    amount: number;
    payment_method: string;
    status: string;
    created_at: string;
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
            duration: number;
        };
        start_time: string;
        room: string;
        price: number;
    };
    user: User;
    payment: Payment | null;
    status: string;
    reservationSeats: ReservationSeat[];
    total_price: number;
    created_at: string;
}

interface Props {
    reservation: Reservation;
}

export default function Show({ reservation }: Props) {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [newStatus, setNewStatus] = useState(reservation.status);

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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const handleDelete = () => {
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        router.delete(route('admin.reservations.destroy', { reservation: reservation.id }), {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
            },
        });
    };

    const handleStatusChange = () => {
        setIsStatusModalOpen(true);
    };

    const confirmStatusChange = () => {
        router.put(
            route('admin.reservations.update-status', { reservation: reservation.id }),
            {
                status: newStatus,
            },
            {
                onSuccess: () => {
                    setIsStatusModalOpen(false);
                },
            },
        );
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
        <AdminLayout title="Reservation Details" subtitle={`Viewing details for reservation #${reservation.id}`}>
            <Head title={`Reservation #${reservation.id}`} />

            {/* Header with actions */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center">
                    <Link
                        href={route('admin.reservations.index')}
                        className="text-muted-foreground hover:text-foreground mr-4 flex items-center transition"
                    >
                        <ArrowLeftIcon className="mr-1 h-4 w-4" />
                        Back to Reservations
                    </Link>
                    <CreditCardIcon className="text-primary mr-2 h-6 w-6" />
                    <h2 className="text-foreground text-lg font-semibold">Reservation #{reservation.id}</h2>
                    <span className={`ml-3 inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClass(reservation.status)}`}>
                        {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                    </span>
                </div>

                <div className="flex space-x-3">
                    <button
                        onClick={handleStatusChange}
                        className="border-border text-foreground hover:bg-muted inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium transition"
                    >
                        Change Status
                    </button>
                    <button
                        onClick={handleDelete}
                        className="border-destructive text-destructive hover:bg-destructive/10 inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium transition"
                        disabled={reservation.status === 'confirmed'}
                    >
                        <TrashIcon className="mr-1.5 h-4 w-4" />
                        Delete
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {/* Reservation details */}
                <div className="border-border bg-card overflow-hidden rounded-lg border shadow-sm md:col-span-2">
                    <div className="border-border bg-muted border-b px-6 py-4">
                        <h3 className="text-foreground text-lg font-medium">Reservation Details</h3>
                    </div>
                    <div className="divide-border divide-y">
                        {/* Film & Screening */}
                        <div className="px-6 py-4">
                            <div className="flex items-start">
                                <FilmIcon className="text-primary mt-1 mr-3 h-5 w-5" />
                                <div>
                                    <div className="text-muted-foreground mb-1 text-xs font-medium uppercase">Film & Screening</div>
                                    <div className="text-foreground mb-1 text-base font-semibold">{reservation.screening.film.title}</div>
                                    <div className="text-muted-foreground mb-1 text-sm">{reservation.screening.room}</div>
                                    <div className="text-muted-foreground text-sm">
                                        {formatDate(reservation.screening.start_time)} at {formatTime(reservation.screening.start_time)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Customer */}
                        <div className="px-6 py-4">
                            <div className="flex items-start">
                                <UserIcon className="text-primary mt-1 mr-3 h-5 w-5" />
                                <div>
                                    <div className="text-muted-foreground mb-1 text-xs font-medium uppercase">Customer</div>
                                    <div className="text-foreground mb-1 text-base font-semibold">{reservation.user.name}</div>
                                    <div className="text-muted-foreground text-sm">{reservation.user.email}</div>
                                </div>
                            </div>
                        </div>

                        {/* Seats */}
                        <div className="px-6 py-4">
                            <div className="flex items-start">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="text-primary mt-1 mr-3 h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-7-2h2"
                                    />
                                </svg>
                                <div>
                                    <div className="text-muted-foreground mb-1 text-xs font-medium uppercase">
                                        Seats ({reservation.reservationSeats.length})
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {reservation.reservationSeats.map((reservationSeat) => (
                                            <span
                                                key={reservationSeat.id}
                                                className="border-border bg-background inline-flex items-center rounded-md border px-2.5 py-1 text-sm font-medium"
                                            >
                                                {reservationSeat.seat.row}-{reservationSeat.seat.number}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment */}
                        <div className="px-6 py-4">
                            <div className="flex items-start">
                                <CreditCardIcon className="text-primary mt-1 mr-3 h-5 w-5" />
                                <div>
                                    <div className="text-muted-foreground mb-1 text-xs font-medium uppercase">Payment</div>
                                    {reservation.payment ? (
                                        <>
                                            <div className="text-foreground mb-1 text-base font-semibold">
                                                {formatCurrency(reservation.payment.amount)}
                                            </div>
                                            <div className="text-muted-foreground mb-1 text-sm">Method: {reservation.payment.payment_method}</div>
                                            <div className="text-muted-foreground text-sm">Status: {reservation.payment.status}</div>
                                        </>
                                    ) : (
                                        <div className="text-foreground text-sm">No payment information</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Dates */}
                        <div className="px-6 py-4">
                            <div className="flex items-start">
                                <CalendarIcon className="text-primary mt-1 mr-3 h-5 w-5" />
                                <div>
                                    <div className="text-muted-foreground mb-1 text-xs font-medium uppercase">Dates</div>
                                    <div className="text-muted-foreground text-sm">
                                        Created: {formatDate(reservation.created_at)} at {formatTime(reservation.created_at)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Summary */}
                <div className="border-border bg-card overflow-hidden rounded-lg border shadow-sm">
                    <div className="border-border bg-muted border-b px-6 py-4">
                        <h3 className="text-foreground text-lg font-medium">Summary</h3>
                    </div>
                    <div className="px-6 py-4">
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Ticket price:</span>
                                <span className="text-foreground">
                                    {formatCurrency(
                                        typeof reservation.screening.price === 'number'
                                            ? reservation.screening.price
                                            : Number(reservation.screening.price),
                                    )}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Number of seats:</span>
                                <span className="text-foreground">{reservation.reservationSeats.length}</span>
                            </div>
                            <div className="border-border mt-4 border-t pt-4">
                                <div className="flex justify-between font-medium">
                                    <span className="text-foreground">Total:</span>
                                    <span className="text-foreground text-lg">
                                        {formatCurrency(
                                            typeof reservation.total_price === 'number' ? reservation.total_price : Number(reservation.total_price),
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete confirmation modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-card w-full max-w-md rounded-lg p-6 shadow-lg">
                        <div className="mb-4 flex items-center">
                            <div className="bg-destructive/10 text-destructive flex h-10 w-10 items-center justify-center rounded-full">
                                <TrashIcon className="h-5 w-5" />
                            </div>
                            <h3 className="text-foreground ml-3 text-lg font-medium">Delete Reservation</h3>
                        </div>

                        <p className="text-muted-foreground mb-6">
                            Are you sure you want to delete this reservation? This action cannot be undone and will release all reserved seats.
                        </p>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="border-border text-foreground hover:bg-muted rounded-md border px-4 py-2 text-sm font-medium focus:outline-none"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-md px-4 py-2 text-sm font-medium focus:outline-none"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Status change modal */}
            {isStatusModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-card w-full max-w-md rounded-lg p-6 shadow-lg">
                        <div className="mb-4 flex items-center">
                            <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full">
                                <CreditCardIcon className="h-5 w-5" />
                            </div>
                            <h3 className="text-foreground ml-3 text-lg font-medium">Change Reservation Status</h3>
                        </div>

                        <div className="mb-6">
                            <label htmlFor="status" className="text-foreground mb-1.5 block text-sm font-medium">
                                Status
                            </label>
                            <select
                                id="status"
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                className="focus:border-primary focus:ring-primary/30 bg-background text-foreground border-input placeholder:text-muted-foreground w-full rounded-md border px-3 py-2"
                            >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            {newStatus === 'cancelled' && (
                                <p className="text-warning mt-2 text-sm">
                                    Note: Cancelling a reservation will release all reserved seats and make them available for other customers.
                                </p>
                            )}
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setIsStatusModalOpen(false)}
                                className="border-border text-foreground hover:bg-muted rounded-md border px-4 py-2 text-sm font-medium focus:outline-none"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmStatusChange}
                                className="bg-primary hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium text-white focus:outline-none"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
