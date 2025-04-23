import AdminLayout from '@/layouts/AdminLayout';
import { CalendarIcon } from '@heroicons/react/24/outline';
import ArrowLeftIcon from '@heroicons/react/24/outline/ArrowLeftIcon.js';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon.js';
import CurrencyDollarIcon from '@heroicons/react/24/outline/CurrencyDollarIcon.js';
import FilmIcon from '@heroicons/react/24/outline/FilmIcon.js';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import React, { useMemo, useState } from 'react';

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            when: 'beforeChildren',
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 100 },
    },
};

interface Film {
    id: number;
    title: string;
    duration: number;
}

interface Props {
    films: Film[];
}

export default function Create({ films }: Props) {
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [selectedTime, setSelectedTime] = useState<string>('12:00');

    // Default rows for seat layout
    const defaultRows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const [selectedRows, setSelectedRows] = useState<string[]>(defaultRows.slice(0, 5));
    const [seatsPerRow, setSeatsPerRow] = useState<number>(10);

    const { data, setData, errors, post, processing } = useForm({
        film_id: '',
        start_time: '',
        room: '',
        price: '',
        is_active: true,
        total_seats: 50,
        seat_layout: {
            rows: selectedRows,
            seats_per_row: seatsPerRow,
        },
    });

    // Update total seats when rows or seats per row changes
    React.useEffect(() => {
        const total = selectedRows.length * seatsPerRow;
        setData('total_seats', total);
        setData('seat_layout', {
            rows: selectedRows,
            seats_per_row: seatsPerRow,
        });
    }, [selectedRows, seatsPerRow]);

    // Combine the date and time into a single ISO string for submit
    const updateDateTime = () => {
        if (selectedDate && selectedTime) {
            const dateTime = `${selectedDate}T${selectedTime}`;
            setData('start_time', dateTime);
        }
    };

    // Update the start_time whenever the date or time changes
    React.useEffect(() => {
        updateDateTime();
    }, [selectedDate, selectedTime]);

    // Generate time options every 15 minutes
    const timeOptions = useMemo(() => {
        const options = [];
        for (let hour = 9; hour <= 23; hour++) {
            for (let minute = 0; minute < 60; minute += 15) {
                const formattedHour = hour.toString().padStart(2, '0');
                const formattedMinute = minute.toString().padStart(2, '0');
                options.push(`${formattedHour}:${formattedMinute}`);
            }
        }
        return options;
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.screenings.store'));
    };

    // Find the selected film for display
    const selectedFilm = films.find((film) => film.id.toString() === data.film_id);

    // Toggle row selection
    const toggleRow = (row: string) => {
        if (selectedRows.includes(row)) {
            setSelectedRows(selectedRows.filter((r) => r !== row));
        } else {
            setSelectedRows([...selectedRows, row].sort());
        }
    };

    return (
        <AdminLayout title="Schedule New Screening" subtitle="Add a new film screening to the calendar">
            <Head title="Schedule New Screening" />

            <motion.div className="container mx-auto px-4 py-6" variants={containerVariants} initial="hidden" animate="visible">
                {/* Back link */}
                <motion.div className="mb-6" variants={itemVariants}>
                    <Link
                        href={route('admin.screenings.index')}
                        className="text-muted-foreground hover:text-foreground flex items-center text-sm transition-colors"
                    >
                        <ArrowLeftIcon className="mr-1 h-4 w-4" />
                        Back to Screenings
                    </Link>
                </motion.div>

                {/* Header */}
                <motion.div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between" variants={itemVariants}>
                    <div className="flex items-center">
                        <div className="bg-primary/10 mr-3 flex h-10 w-10 items-center justify-center rounded-lg">
                            <CalendarIcon className="text-primary h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-foreground mb-1 text-2xl font-bold">Schedule New Screening</h1>
                            <p className="text-muted-foreground text-sm">Add a new film screening to the calendar</p>
                        </div>
                    </div>
                </motion.div>

                {/* Main form */}
                <motion.div className="border-border bg-card overflow-hidden rounded-lg border shadow-sm" variants={itemVariants}>
                    <div className="border-border bg-muted/30 border-b px-6 py-4">
                        <h2 className="text-foreground flex items-center text-lg font-medium">
                            <FilmIcon className="text-primary mr-2 h-5 w-5" />
                            Screening Information
                        </h2>
                    </div>

                    <div className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Film Selection */}
                            <motion.div
                                className="border-border bg-muted/20 rounded-lg border p-5"
                                variants={itemVariants}
                                whileHover={{ y: -5, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                transition={{ duration: 0.3 }}
                            >
                                <h3 className="text-md text-foreground mb-4 font-medium">Film Selection</h3>
                                <div>
                                    <label htmlFor="film_id" className="text-foreground mb-1.5 block text-sm font-medium">
                                        Select Film <span className="text-destructive">*</span>
                                    </label>
                                    <select
                                        id="film_id"
                                        value={data.film_id}
                                        onChange={(e) => setData('film_id', e.target.value)}
                                        className={`bg-background text-foreground border-input focus:border-primary focus:ring-primary/30 placeholder:text-muted-foreground w-full rounded-md border px-3 py-2.5 ${
                                            errors.film_id ? 'border-destructive focus:border-destructive focus:ring-destructive/30' : ''
                                        }`}
                                        required
                                    >
                                        <option value="">Select a film</option>
                                        {films.map((film) => (
                                            <option key={film.id} value={film.id}>
                                                {film.title} ({film.duration} min)
                                            </option>
                                        ))}
                                    </select>
                                    {errors.film_id && <p className="text-destructive mt-1.5 text-sm">{errors.film_id}</p>}
                                </div>

                                {selectedFilm && (
                                    <motion.div
                                        className="border-border bg-muted/10 mt-4 rounded-md border p-3"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="flex items-center">
                                            <FilmIcon className="text-primary mr-2 h-5 w-5" />
                                            <span className="text-foreground font-medium">{selectedFilm.title}</span>
                                        </div>
                                        <div className="text-muted-foreground mt-2 flex items-center">
                                            <ClockIcon className="mr-1 h-4 w-4" />
                                            <span className="text-sm">Duration: {selectedFilm.duration} minutes</span>
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>

                            {/* Time and Location */}
                            <motion.div
                                className="border-border bg-muted/20 rounded-lg border p-5"
                                variants={itemVariants}
                                whileHover={{ y: -5, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                transition={{ duration: 0.3 }}
                            >
                                <h3 className="text-md text-foreground mb-4 font-medium">Time and Location</h3>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div>
                                        <label htmlFor="screening_date" className="text-foreground mb-1.5 block text-sm font-medium">
                                            Screening Date <span className="text-destructive">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                <CalendarIcon className="text-muted-foreground h-5 w-5" />
                                            </div>
                                            <input
                                                id="screening_date"
                                                type="date"
                                                value={selectedDate}
                                                onChange={(e) => setSelectedDate(e.target.value)}
                                                min={new Date().toISOString().split('T')[0]}
                                                className={`bg-background text-foreground border-input focus:border-primary focus:ring-primary/30 placeholder:text-muted-foreground w-full rounded-md border py-2.5 pr-3 pl-10`}
                                                required
                                            />
                                        </div>
                                        {errors.start_time && <p className="text-destructive mt-1.5 text-sm">{errors.start_time}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="screening_time" className="text-foreground mb-1.5 block text-sm font-medium">
                                            Screening Time <span className="text-destructive">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                <ClockIcon className="text-muted-foreground h-5 w-5" />
                                            </div>
                                            <select
                                                id="screening_time"
                                                value={selectedTime}
                                                onChange={(e) => setSelectedTime(e.target.value)}
                                                className={`bg-background text-foreground border-input focus:border-primary focus:ring-primary/30 placeholder:text-muted-foreground w-full rounded-md border py-2.5 pr-3 pl-10`}
                                                required
                                            >
                                                {timeOptions.map((time) => (
                                                    <option key={time} value={time}>
                                                        {time}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="room" className="text-foreground mb-1.5 block text-sm font-medium">
                                            Room/Theater <span className="text-destructive">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                <FilmIcon className="text-muted-foreground h-5 w-5" />
                                            </div>
                                            <input
                                                id="room"
                                                value={data.room}
                                                onChange={(e) => setData('room', e.target.value)}
                                                placeholder="e.g. Theater 1, IMAX, Screen A"
                                                className={`bg-background text-foreground border-input focus:border-primary focus:ring-primary/30 placeholder:text-muted-foreground w-full rounded-md border py-2.5 pr-3 pl-10 ${
                                                    errors.room ? 'border-destructive focus:border-destructive focus:ring-destructive/30' : ''
                                                }`}
                                                required
                                            />
                                        </div>
                                        {errors.room && <p className="text-destructive mt-1.5 text-sm">{errors.room}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="price" className="text-foreground mb-1.5 block text-sm font-medium">
                                            Ticket Price <span className="text-destructive">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                <CurrencyDollarIcon className="text-muted-foreground h-5 w-5" />
                                            </div>
                                            <input
                                                id="price"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={data.price}
                                                onChange={(e) => setData('price', e.target.value)}
                                                placeholder="0.00"
                                                className={`bg-background text-foreground border-input focus:border-primary focus:ring-primary/30 placeholder:text-muted-foreground w-full rounded-md border py-2.5 pr-3 pl-10 ${
                                                    errors.price ? 'border-destructive focus:border-destructive focus:ring-destructive/30' : ''
                                                }`}
                                                required
                                            />
                                        </div>
                                        {errors.price && <p className="text-destructive mt-1.5 text-sm">{errors.price}</p>}
                                    </div>

                                    <div className="border-border bg-muted/10 flex items-center rounded-md border p-3">
                                        <motion.input
                                            whileTap={{ scale: 0.9 }}
                                            type="checkbox"
                                            id="is_active"
                                            checked={data.is_active}
                                            onChange={(e) => setData('is_active', e.target.checked)}
                                            className="border-input focus:ring-primary/30 text-primary h-5 w-5 rounded"
                                        />
                                        <label htmlFor="is_active" className="text-foreground ml-2 text-sm">
                                            Active (visible to customers)
                                        </label>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Seating Configuration */}
                            <motion.div
                                className="border-border bg-muted/20 rounded-lg border p-5"
                                variants={itemVariants}
                                whileHover={{ y: -5, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                transition={{ duration: 0.3 }}
                            >
                                <h3 className="text-md text-foreground mb-4 font-medium">Seating Configuration</h3>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div>
                                        <label className="text-foreground mb-1.5 block text-sm font-medium">
                                            Seat Rows <span className="text-destructive">*</span>
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {defaultRows.map((row) => (
                                                <button
                                                    key={row}
                                                    type="button"
                                                    onClick={() => toggleRow(row)}
                                                    className={`h-9 w-9 rounded-md border text-sm font-medium transition-colors ${
                                                        selectedRows.includes(row)
                                                            ? 'bg-primary border-primary text-white'
                                                            : 'bg-muted/10 border-border text-foreground hover:bg-muted'
                                                    }`}
                                                >
                                                    {row}
                                                </button>
                                            ))}
                                        </div>
                                        {errors.seat_layout && <p className="text-destructive mt-1.5 text-sm">{errors.seat_layout}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="seats_per_row" className="text-foreground mb-1.5 block text-sm font-medium">
                                            Seats Per Row <span className="text-destructive">*</span>
                                        </label>
                                        <input
                                            id="seats_per_row"
                                            type="number"
                                            min="1"
                                            max="30"
                                            value={seatsPerRow}
                                            onChange={(e) => setSeatsPerRow(parseInt(e.target.value) || 1)}
                                            className="bg-background text-foreground border-input focus:border-primary focus:ring-primary/30 placeholder:text-muted-foreground w-full rounded-md border px-3 py-2.5"
                                            required
                                        />
                                        {errors['seat_layout.seats_per_row'] && (
                                            <p className="text-destructive mt-1.5 text-sm">{errors['seat_layout.seats_per_row']}</p>
                                        )}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label htmlFor="total_seats" className="text-foreground mb-1.5 block text-sm font-medium">
                                            Total Seats
                                        </label>
                                        <div className="border-border bg-muted/10 rounded-md border p-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-foreground">Total capacity:</span>
                                                <span className="text-primary text-lg font-bold">{data.total_seats} seats</span>
                                            </div>
                                            <div className="text-muted-foreground mt-2 flex flex-wrap text-xs">
                                                <span>
                                                    {selectedRows.length} rows × {seatsPerRow} seats per row
                                                </span>
                                            </div>
                                        </div>
                                        {errors.total_seats && <p className="text-destructive mt-1.5 text-sm">{errors.total_seats}</p>}
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div className="border-t p-5" variants={itemVariants}>
                                <p className="text-muted-foreground mb-6 text-sm">
                                    <strong>Note:</strong> After creating a screening, you will be able to configure seating arrangements and view
                                    ticket sales.
                                </p>

                                <div className="flex justify-end space-x-3">
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Link
                                            href={route('admin.screenings.index')}
                                            className="border-border text-foreground hover:bg-muted inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium transition"
                                        >
                                            Cancel
                                        </Link>
                                    </motion.div>
                                    <motion.button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-primary hover:bg-primary/90 focus:ring-primary/30 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm transition focus:ring-2 focus:outline-none disabled:opacity-50"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {processing ? 'Creating...' : 'Create Screening'}
                                    </motion.button>
                                </div>
                            </motion.div>
                        </form>
                    </div>
                </motion.div>
            </motion.div>
        </AdminLayout>
    );
}
