import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

interface Film {
    id: number;
    title: string;
    description: string;
    poster_image: string | null;
    genre: string | null;
    duration: number;
    director: string | null;
}

interface LatestFilmsSectionProps {
    latestFilms: Film[];
}

const LatestFilmsSection = ({ latestFilms }: LatestFilmsSectionProps) => {
    // Film cards hover animation
    const cardVariants = {
        initial: { scale: 1 },
        hover: { scale: 1.05, transition: { duration: 0.3 } },
    };

    return (
        <section
            className="relative overflow-hidden py-24"
            style={{
                background: 'linear-gradient(to bottom, #000203, #01080c)',
            }}
        >
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden opacity-5">
                {/* Abstract film strips */}
                <div className="grid h-full grid-cols-12">
                    {[...Array(12)].map((_, i) => (
                        <div key={i} className="h-full border-r border-white/10" />
                    ))}
                </div>

                {/* Floating cinema elements */}
                <motion.div
                    className="bg-primary/5 absolute -top-20 -right-20 h-40 w-40 rounded-full blur-3xl"
                    animate={{
                        x: [0, 30, 0],
                        y: [0, -30, 0],
                        opacity: [0.5, 0.7, 0.5],
                    }}
                    transition={{
                        repeat: Infinity,
                        duration: 15,
                        ease: 'easeInOut',
                    }}
                />

                <motion.div
                    className="bg-primary/5 absolute bottom-40 -left-20 h-60 w-60 rounded-full blur-3xl"
                    animate={{
                        x: [0, -20, 0],
                        y: [0, 40, 0],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        repeat: Infinity,
                        duration: 20,
                        ease: 'easeInOut',
                    }}
                />
            </div>

            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="mb-20 text-center"
                >
                    <div className="inline-flex items-center justify-center">
                        <span className="bg-primary/70 h-[1px] w-8"></span>
                        <span className="text-primary/80 mx-3 text-sm font-medium tracking-[0.2em] uppercase">Now Playing</span>
                        <span className="bg-primary/70 h-[1px] w-8"></span>
                    </div>
                    <h2 className="mt-4 bg-gradient-to-r from-white to-white/80 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
                        Latest Releases
                    </h2>
                    <div className="mt-4 flex justify-center">
                        <motion.div
                            className="from-primary to-primary/50 h-1 w-24 rounded-full bg-gradient-to-r"
                            initial={{ width: 0 }}
                            whileInView={{ width: '6rem' }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                        />
                    </div>
                    <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-300/80">
                        Don't miss these exciting new films showing now in our premium theaters
                    </p>
                </motion.div>

                {/* 3D Perspective Film Cards Grid */}
                <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
                    {latestFilms.map((film, index) => (
                        <motion.div
                            key={film.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{
                                z: 10,
                                transition: { duration: 0.2 },
                            }}
                        >
                            <Link href={`/films/${film.id}`}>
                                <motion.div
                                    className="group relative h-[460px] overflow-hidden rounded-2xl border border-white/5 bg-black/20 shadow-lg backdrop-blur-sm"
                                    variants={cardVariants}
                                    initial="initial"
                                    whileHover="hover"
                                    style={{
                                        perspective: '1000px',
                                        transformStyle: 'preserve-3d',
                                    }}
                                >
                                    {/* Card Image with Parallax Effect */}
                                    <div className="relative h-[280px] overflow-hidden">
                                        {film.poster_image ? (
                                            <motion.img
                                                src={film.poster_image.startsWith('http') ? film.poster_image : `/storage/${film.poster_image}`}
                                                alt={film.title}
                                                className="h-full w-full object-cover"
                                                whileHover={{
                                                    scale: 1.1,
                                                    transition: { duration: 0.5 },
                                                }}
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center bg-gray-800 text-white/50">
                                                No image available
                                            </div>
                                        )}

                                        {/* Film Genre Badge */}
                                        <div className="absolute top-4 right-4">
                                            <span className="rounded-full border border-white/10 bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                                                {film.genre || 'Drama'}
                                            </span>
                                        </div>

                                        {/* Hover Overlay with Play Button */}
                                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                            <motion.div
                                                className="bg-primary/90 rounded-full p-3"
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                                                    />
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                    />
                                                </svg>
                                            </motion.div>
                                        </div>
                                    </div>

                                    {/* Film Info */}
                                    <div className="p-6">
                                        <div className="mb-2 flex items-center justify-between">
                                            <h3 className="text-xl font-bold text-white">{film.title}</h3>
                                            <span className="bg-primary/20 text-primary rounded-md px-2 py-1 text-xs font-medium">
                                                {film.duration} min
                                            </span>
                                        </div>
                                        <p className="mb-4 line-clamp-2 text-sm text-white/70">{film.description}</p>

                                        {/* Book Now Button */}
                                        <div className="group/button">
                                            <motion.div
                                                className="bg-primary/10 border-primary/20 group-hover/button:bg-primary/20 flex items-center justify-between overflow-hidden rounded-lg border p-3 text-white backdrop-blur-sm transition-colors duration-300"
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <span className="text-sm font-medium">Book Now</span>
                                                <motion.svg
                                                    className="h-5 w-5"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    initial={{ x: 0 }}
                                                    whileHover={{ x: 3 }}
                                                    transition={{ type: 'spring', stiffness: 400 }}
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                </motion.svg>
                                            </motion.div>
                                        </div>
                                    </div>
                                </motion.div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* View All Films Button */}
                <motion.div
                    className="mt-16 flex justify-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Link
                        href="/films"
                        className="group relative overflow-hidden rounded-full px-8 py-3 text-lg font-medium text-white transition-all"
                    >
                        <span className="from-primary/80 to-primary absolute inset-0 z-0 rounded-full bg-gradient-to-r"></span>
                        <span className="relative z-10 flex items-center">
                            View All Films
                            <svg
                                className="ml-2 h-5 w-5 transform transition-transform duration-300 group-hover:translate-x-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </span>
                        <motion.span
                            className="absolute inset-0 -z-10 rounded-full bg-white/20"
                            whileHover={{ scale: 1.5, opacity: 0.3 }}
                            transition={{ duration: 0.4 }}
                        />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
};

export default LatestFilmsSection;
