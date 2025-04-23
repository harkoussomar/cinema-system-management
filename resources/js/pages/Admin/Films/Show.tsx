import AdminLayout from '@/layouts/AdminLayout';
import { CalendarIcon, ClockIcon, FilmIcon, PencilIcon, UserIcon } from '@heroicons/react/24/outline';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { formatDate } from '../../../utils/dateUtils';

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
    description: string;
    duration: number;
    poster_image: string;
    genre: string;
    release_date: string;
    director: string;
    is_featured: boolean;
    screenings_count: number;
    future_screenings_count: number;
    created_at: string;
    updated_at: string;
}

interface Props {
    film: Film;
}

export default function Show({ film }: Props) {
    return (
        <AdminLayout title={film.title} subtitle="Film Details">
            <Head title={`Film: ${film.title}`} />

            <motion.div className="container mx-auto px-4 py-6" variants={containerVariants} initial="hidden" animate="visible">
                {/* Header with back and edit buttons */}
                <motion.div className="mb-6 flex items-center justify-between" variants={itemVariants}>
                    <div className="flex items-center">
                        <motion.div
                            className="bg-primary/10 mr-3 flex h-10 w-10 items-center justify-center rounded-lg"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ type: 'spring', stiffness: 400 }}
                        >
                            <FilmIcon className="text-primary h-6 w-6" />
                        </motion.div>
                        <div>
                            <h1 className="text-foreground text-2xl font-bold">{film.title}</h1>
                            <p className="text-muted-foreground text-sm">Film ID: {film.id}</p>
                        </div>
                    </div>
                    <div className="flex space-x-3">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link
                                href={route('admin.films.index')}
                                className="border-border text-foreground hover:bg-muted flex items-center rounded-md border px-4 py-2 text-sm font-medium transition"
                            >
                                Back to Films
                            </Link>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link
                                href={route('admin.films.edit', { film: film.id })}
                                className="bg-primary hover:bg-primary/90 flex items-center rounded-md px-4 py-2 text-sm font-medium text-white transition"
                            >
                                <PencilIcon className="mr-2 h-4 w-4" />
                                Edit Film
                            </Link>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Film details */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Poster and basic info */}
                    <motion.div
                        className="border-border bg-card col-span-1 overflow-hidden rounded-lg border shadow-sm"
                        variants={itemVariants}
                        whileHover={{ y: -5 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="p-6">
                            <div className="mb-4 flex flex-col items-center space-y-4">
                                <motion.div
                                    className="border-border h-auto w-full max-w-[250px] overflow-hidden rounded-lg border shadow-md"
                                    whileHover={{ scale: 1.02 }}
                                    transition={{ type: 'spring', stiffness: 300 }}
                                >
                                    <img
                                        src={
                                            film.poster_image
                                                ? film.poster_image.startsWith('http')
                                                    ? film.poster_image
                                                    : `/storage/${film.poster_image}`
                                                : '/images/placeholder.png'
                                        }
                                        alt={film.title}
                                        className="h-full w-full object-cover"
                                    />
                                </motion.div>

                                {film.is_featured && (
                                    <motion.span
                                        className="bg-success/20 text-success inline-flex rounded-full px-3 py-1 text-sm font-medium"
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.5, type: 'spring' }}
                                    >
                                        Featured Film
                                    </motion.span>
                                )}
                            </div>

                            <div className="border-border border-t pt-4">
                                <h3 className="text-foreground mb-4 text-lg font-medium">Quick Info</h3>
                                <ul className="space-y-3">
                                    <motion.li className="flex items-center" whileHover={{ x: 5 }} transition={{ type: 'spring', stiffness: 300 }}>
                                        <UserIcon className="text-muted-foreground mr-2 h-4 w-4" />
                                        <span className="text-muted-foreground text-sm">Director: </span>
                                        <span className="text-foreground ml-1 text-sm font-medium">{film.director}</span>
                                    </motion.li>
                                    <motion.li className="flex items-center" whileHover={{ x: 5 }} transition={{ type: 'spring', stiffness: 300 }}>
                                        <CalendarIcon className="text-muted-foreground mr-2 h-4 w-4" />
                                        <span className="text-muted-foreground text-sm">Released: </span>
                                        <span className="text-foreground ml-1 text-sm font-medium">{formatDate(film.release_date)}</span>
                                    </motion.li>
                                    <motion.li className="flex items-center" whileHover={{ x: 5 }} transition={{ type: 'spring', stiffness: 300 }}>
                                        <ClockIcon className="text-muted-foreground mr-2 h-4 w-4" />
                                        <span className="text-muted-foreground text-sm">Duration: </span>
                                        <span className="text-foreground ml-1 text-sm font-medium">{film.duration} minutes</span>
                                    </motion.li>
                                    <motion.li className="flex items-center" whileHover={{ x: 5 }} transition={{ type: 'spring', stiffness: 300 }}>
                                        <FilmIcon className="text-muted-foreground mr-2 h-4 w-4" />
                                        <span className="text-muted-foreground text-sm">Genre: </span>
                                        <motion.span
                                            className="bg-primary/10 text-primary ml-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium"
                                            whileHover={{ scale: 1.1 }}
                                        >
                                            {film.genre}
                                        </motion.span>
                                    </motion.li>
                                </ul>
                            </div>
                        </div>
                    </motion.div>

                    {/* Details and screenings */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Description */}
                        <motion.div
                            className="border-border bg-card overflow-hidden rounded-lg border shadow-sm"
                            variants={itemVariants}
                            whileHover={{ y: -5 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="border-border border-b p-4">
                                <h3 className="text-foreground font-medium">Description</h3>
                            </div>
                            <div className="p-6">
                                <p className="text-foreground text-sm leading-relaxed whitespace-pre-line">{film.description}</p>
                            </div>
                        </motion.div>

                        {/* Screenings stats */}
                        <motion.div
                            className="border-border bg-card overflow-hidden rounded-lg border shadow-sm"
                            variants={itemVariants}
                            whileHover={{ y: -5 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="border-border border-b p-4">
                                <h3 className="text-foreground font-medium">Screenings Information</h3>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <motion.div
                                        className="bg-muted/30 border-border rounded-lg border p-4"
                                        whileHover={{ scale: 1.03 }}
                                        transition={{ type: 'spring', stiffness: 300 }}
                                    >
                                        <div className="text-muted-foreground mb-1 text-sm">Total Screenings</div>
                                        <div className="text-foreground text-2xl font-bold">{film.screenings_count}</div>
                                    </motion.div>
                                    <motion.div
                                        className="bg-primary/10 border-border rounded-lg border p-4"
                                        whileHover={{ scale: 1.03 }}
                                        transition={{ type: 'spring', stiffness: 300 }}
                                    >
                                        <div className="text-muted-foreground mb-1 text-sm">Upcoming Screenings</div>
                                        <div className="text-primary text-2xl font-bold">{film.future_screenings_count}</div>
                                    </motion.div>
                                </div>

                                <div className="mt-4">
                                    <motion.div whileHover={{ x: 5 }} transition={{ type: 'spring', stiffness: 300 }}>
                                        <Link
                                            href={route('admin.screenings.index', { film_id: film.id })}
                                            className="text-primary hover:text-primary/90 inline-flex items-center text-sm"
                                        >
                                            <CalendarIcon className="mr-1 h-4 w-4" />
                                            View all screenings for this film
                                        </Link>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Metadata */}
                        <motion.div
                            className="border-border bg-card overflow-hidden rounded-lg border shadow-sm"
                            variants={itemVariants}
                            whileHover={{ y: -5 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="border-border border-b p-4">
                                <h3 className="text-foreground font-medium">Metadata</h3>
                            </div>
                            <div className="divide-border divide-y">
                                <motion.div className="grid grid-cols-2 p-4" whileHover={{ backgroundColor: 'rgba(var(--primary), 0.05)' }}>
                                    <div className="text-muted-foreground text-sm">Created</div>
                                    <div className="text-foreground text-sm">{formatDate(film.created_at)}</div>
                                </motion.div>
                                <motion.div className="grid grid-cols-2 p-4" whileHover={{ backgroundColor: 'rgba(var(--primary), 0.05)' }}>
                                    <div className="text-muted-foreground text-sm">Last Updated</div>
                                    <div className="text-foreground text-sm">{formatDate(film.updated_at)}</div>
                                </motion.div>
                                <motion.div className="grid grid-cols-2 p-4" whileHover={{ backgroundColor: 'rgba(var(--primary), 0.05)' }}>
                                    <div className="text-muted-foreground text-sm">Film ID</div>
                                    <div className="text-foreground text-sm">{film.id}</div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </AdminLayout>
    );
}
