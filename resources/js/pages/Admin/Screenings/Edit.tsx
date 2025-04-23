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

interface Screening {
    id: number;
    film_id: number;
    start_time: string;
    room: string;
    price: number;
    total_seats: number;
    is_active: boolean;
}

interface Props {
    screening: Screening;
    films: Film[];
}

export default function Edit({ screening, films }: Props) {
    // Parse the screening start time
    const startDate = new Date(screening.start_time);

    // Set initial values for date and time selectors
    const [selectedDate, setSelectedDate] = useState<string>(startDate.toISOString().split('T')[0]);

    const [selectedTime, setSelectedTime] = useState<string>(
        `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`,
    );

    const { data, setData, errors, put, processing } = useForm({
        film_id: screening.film_id.toString(),
        start_time: '',
        room: screening.room,
        price: screening.price.toString(),
        is_active: screening.is_active,
    });

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
        put(route('admin.screenings.update', { screening: screening.id }));
    };

    // Find the selected film
    const selectedFilm = films.find((film) => film.id.toString() === data.film_id);

    return (
        <AdminLayout title="Edit Screening" subtitle="Modify screening details">
            <Head title="Edit Screening" />

            <motion.div className="container px-4 py-6 mx-auto" variants={containerVariants} initial="hidden" animate="visible">
                {/* Back link */}
                <motion.div className="mb-6" variants={itemVariants}>
                    <Link
                        href={route('admin.screenings.show', { screening: screening.id })}
                        className="flex items-center text-sm transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeftIcon className="w-4 h-4 mr-1" />
                        Back to Screening Details
                    </Link>
                </motion.div>

                {/* Header */}
                <motion.div className="flex flex-col mb-8 md:flex-row md:items-center md:justify-between" variants={itemVariants}>
                    <div className="flex items-center">
                        <div className="flex items-center justify-center w-10 h-10 mr-3 rounded-lg bg-primary/10">
                            <CalendarIcon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="mb-1 text-2xl font-bold text-foreground">Edit Screening</h1>
                            <p className="text-sm text-muted-foreground">Update screening information and details</p>
                        </div>
                    </div>
                </motion.div>

                {/* Main form */}
                <motion.div className="overflow-hidden border rounded-lg shadow-sm border-border bg-card" variants={itemVariants}>
                    <div className="px-6 py-4 border-b border-border bg-muted/30">
                        <h2 className="flex items-center text-lg font-medium text-foreground">
                            <FilmIcon className="w-5 h-5 mr-2 text-primary" />
                            Screening Information
                        </h2>
                    </div>

                    <div className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Film Selection */}
                            <motion.div
                                className="p-5 border rounded-lg border-border bg-muted/20"
                                variants={itemVariants}
                                whileHover={{ y: -5, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                transition={{ duration: 0.3 }}
                            >
                                <h3 className="mb-4 font-medium text-md text-foreground">Film Selection</h3>
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
                                        className="p-3 mt-4 border rounded-md border-border bg-muted/10"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="flex items-center">
                                            <FilmIcon className="w-5 h-5 mr-2 text-primary" />
                                            <span className="font-medium text-foreground">{selectedFilm.title}</span>
                                        </div>
                                        <div className="flex items-center mt-2 text-muted-foreground">
                                            <ClockIcon className="w-4 h-4 mr-1" />
                                            <span className="text-sm">Duration: {selectedFilm.duration} minutes</span>
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>

                            {/* Time and Location */}
                            <motion.div
                                className="p-5 border rounded-lg border-border bg-muted/20"
                                variants={itemVariants}
                                whileHover={{ y: -5, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                transition={{ duration: 0.3 }}
                            >
                                <h3 className="mb-4 font-medium text-md text-foreground">Time and Location</h3>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div>
                                        <label htmlFor="screening_date" className="text-foreground mb-1.5 block text-sm font-medium">
                                            Screening Date <span className="text-destructive">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                <CalendarIcon className="w-5 h-5 text-muted-foreground" />
                                            </div>
                                            <input
                                                id="screening_date"
                                                type="date"
                                                value={selectedDate}
                                                onChange={(e) => setSelectedDate(e.target.value)}
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
                                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                <ClockIcon className="w-5 h-5 text-muted-foreground" />
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
                                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                <FilmIcon className="w-5 h-5 text-muted-foreground" />
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
                                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                <CurrencyDollarIcon className="w-5 h-5 text-muted-foreground" />
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

                                    <div className="flex items-center p-3 border rounded-md border-border bg-muted/10">
                                        <input
                                            type="checkbox"
                                            id="is_active"
                                            checked={data.is_active}
                                            onChange={(e) => setData('is_active', e.target.checked)}
                                            className="w-5 h-5 rounded border-input focus:ring-primary/30 text-primary"
                                        />
                                        <label htmlFor="is_active" className="ml-2 text-sm text-foreground">
                                            Active (visible to customers)
                                        </label>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Seating Information (Read-only) */}
                            <motion.div className="p-5 border rounded-lg border-border bg-muted/20" variants={itemVariants}>
                                <h3 className="mb-4 font-medium text-md text-foreground">Seating Information</h3>
                                <div className="p-4 text-sm border rounded-md bg-muted/10 border-border">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-muted-foreground">Total Seats:</span>
                                        <span className="font-medium text-foreground">{screening.total_seats}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        The seating configuration cannot be modified after creation. To change the seating layout, you would need to
                                        create a new screening.
                                    </p>
                                </div>
                            </motion.div>

                            <motion.div className="p-5 border-t" variants={itemVariants}>
                                <p className="mb-6 text-sm text-muted-foreground">
                                    <strong>Note:</strong> Editing a screening will not affect existing reservations. You cannot modify the seating
                                    layout after creation.
                                </p>

                                <div className="flex justify-end space-x-3">
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Link
                                            href={route('admin.screenings.show', { screening: screening.id })}
                                            className="inline-flex items-center px-4 py-2 text-sm font-medium transition border rounded-md border-border text-foreground hover:bg-muted"
                                        >
                                            Cancel
                                        </Link>
                                    </motion.div>
                                    <motion.button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white transition rounded-md shadow-sm bg-primary hover:bg-primary/90 focus:ring-primary/30 focus:ring-2 focus:outline-none disabled:opacity-50"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {processing ? 'Saving...' : 'Save Changes'}
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
