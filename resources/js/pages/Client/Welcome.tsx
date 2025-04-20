import ClientLayout from '@/layouts/ClientLayout';
import { Head, Link } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';

interface Film {
    id: number;
    title: string;
    description: string;
    poster_image: string | null;
    genre: string | null;
    duration: number;
    director: string | null;
}

interface WelcomeProps {
    featuredFilms: Film[];
    latestFilms: Film[];
}

export default function Welcome({ featuredFilms, latestFilms }: WelcomeProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [scrollY, setScrollY] = useState(0);

    // Parallax effect
    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Auto-rotate featured films with pause on hover
    useEffect(() => {
        if (featuredFilms.length <= 1) return;

        const interval = setInterval(() => {
            if (!isVideoPlaying) {
                setCurrentIndex((prevIndex) => (prevIndex === featuredFilms.length - 1 ? 0 : prevIndex + 1));
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [featuredFilms, isVideoPlaying]);

    // Custom hooks for section animations
    const [heroRef, heroInView] = useInView({
        triggerOnce: false,
        threshold: 0.1,
    });

    const [featuredRef, featuredInView] = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    // Video background control
    const playVideo = () => {
        if (videoRef.current) {
            videoRef.current.play();
            setIsVideoPlaying(true);
        }
    };

    // Cinematic animated text effect
    const textVariants = {
        hidden: { opacity: 0 },
        visible: (i: number) => ({
            opacity: 1,
            transition: { delay: i * 0.1, duration: 0.8 },
        }),
    };

    // Film cards hover animation
    const cardVariants = {
        initial: { scale: 1 },
        hover: { scale: 1.05, transition: { duration: 0.3 } },
    };

    return (
        <ClientLayout>
            <Head title="CineVerse - Immersive Movie Experience" />

            {/* Dramatic Hero Section with Video Background */}
            <section ref={heroRef} className="relative h-screen overflow-hidden" style={{ perspective: '1000px' }}>
                {/* Cinema video backdrop */}
                <div className="absolute inset-0 z-0">
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        loop
                        playsInline
                        onCanPlay={playVideo}
                        className="object-cover w-full h-full"
                        poster="/storage/images/cinema-hero.jpg"
                    >
                        <source src="/storage/videos/cinema-background.mp4" type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/50" />
                </div>

                {/* Cinematic Text Reveal */}
                <div
                    className="relative z-10 flex flex-col items-start justify-center h-full px-4 mx-auto max-w-7xl sm:px-6 lg:px-8"
                    style={{
                        transform: `translateY(${scrollY * 0.2}px)`,
                    }}
                >
                    <motion.div initial="hidden" animate={heroInView ? 'visible' : 'hidden'} className="max-w-3xl">
                        <div className="flex items-center mb-4">
                            <motion.div custom={0} variants={textVariants} className="w-10 h-1 mr-4 rounded-full bg-primary" />
                            <motion.span custom={1} variants={textVariants} className="text-primary text-sm font-medium tracking-[0.2em] uppercase">
                                Welcome to CineVerse
                            </motion.span>
                        </div>

                        <motion.h1
                            custom={2}
                            variants={textVariants}
                            className="text-5xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl"
                        >
                            Where Stories
                            <span className="relative inline-block ml-2">
                                <span className="relative z-10">Come Alive</span>
                                <motion.span
                                    className="absolute left-0 w-full h-4 bg-primary/30 -bottom-2 -z-10"
                                    initial={{ width: 0 }}
                                    animate={{ width: '100%' }}
                                    transition={{ delay: 0.8, duration: 0.8 }}
                                />
                            </span>
                        </motion.h1>

                        <motion.p custom={3} variants={textVariants} className="max-w-2xl mt-6 text-lg font-light text-white/80 md:text-xl">
                            Immerse yourself in extraordinary worlds where imagination meets reality. Experience cinema like never before with our
                            premium viewing experience, luxurious seating, and immersive sound technology.
                        </motion.p>

                        <motion.div custom={4} variants={textVariants} className="flex flex-wrap gap-6 mt-10">
                            <Link
                                href="/films"
                                className="relative px-8 py-4 overflow-hidden text-base font-medium text-white transition-all rounded-md shadow-lg group bg-primary hover:bg-primary/90 focus:ring-primary focus:ring-2 focus:ring-offset-2 focus:outline-none"
                            >
                                <span className="relative z-10 flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                                        />
                                    </svg>
                                    Browse Movies
                                </span>
                                <motion.span
                                    className="absolute inset-0 -z-10 bg-white/20"
                                    initial={{ x: '-100%', opacity: 0 }}
                                    whileHover={{ x: '100%', opacity: 0.3 }}
                                    transition={{ duration: 0.5 }}
                                />
                            </Link>

                            <Link
                                href="#featured"
                                className="relative px-8 py-4 overflow-hidden text-base font-medium transition-all border rounded-md shadow-lg group text-primary focus:ring-primary border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20 focus:ring-2 focus:ring-offset-2 focus:outline-none"
                            >
                                <span className="relative z-10 flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                                        />
                                    </svg>
                                    Recommended Films
                                </span>
                                <motion.span
                                    className="absolute inset-0 -z-10 bg-white/10"
                                    initial={{ scale: 0, opacity: 0 }}
                                    whileHover={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.4 }}
                                />
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Dynamic scroll indicator */}
                <motion.div
                    animate={{
                        y: [0, 10, 0],
                        opacity: [0.8, 0.4, 0.8],
                    }}
                    transition={{
                        repeat: Infinity,
                        duration: 2,
                    }}
                    className="absolute z-10 transform -translate-x-1/2 bottom-10 left-1/2"
                >
                    <div className="flex flex-col items-center">
                        <span className="mb-2 text-sm font-light tracking-wider text-white/80">Discover More</span>
                        <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13l-7 7-7-7m14-8l-7 7-7-7" />
                        </svg>
                    </div>
                </motion.div>
            </section>
            <div style={{
            background: 'linear-gradient(to bottom, #000203, #01080c)',
        }}>
            {/* Premium Recommended Film Carousel */}
            <section
                id="featured"
                ref={featuredRef}
                className="relative py-24 overflow-hidden"

            >
                {/* Abstract Film Strip Background */}
                <div className="absolute inset-0 overflow-hidden opacity-5">
                    <div className="absolute top-0 left-0 right-0 h-40 from-primary/10 bg-gradient-to-b to-transparent" />
                    <div className="flex h-full">
                        {[...Array(20)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="flex-1 h-full border-r border-white/20"
                                initial={{ height: '0%' }}
                                animate={{ height: '100%' }}
                                transition={{
                                    duration: 1.5,
                                    delay: i * 0.1,
                                    ease: 'easeOut',
                                }}
                            />
                        ))}
                    </div>
                </div>

                <div className="relative z-10 px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Section Header with Animation */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={featuredInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                        transition={{ duration: 0.8 }}
                        className="mb-20 text-center"
                    >
                        <div className="inline-flex items-center justify-center">
                            <span className="bg-primary/70 h-[1px] w-8"></span>
                            <span className="text-primary/80 mx-3 text-sm font-medium tracking-[0.2em] uppercase">Spotlight</span>
                            <span className="bg-primary/70 h-[1px] w-8"></span>
                        </div>
                        <h2 className="mt-4 text-4xl font-bold tracking-tight text-transparent bg-gradient-to-r from-white to-white/80 bg-clip-text">
                            Film Recommendations
                        </h2>
                        <div className="flex justify-center mt-4">
                            <motion.div
                                className="w-24 h-1 rounded-full from-primary to-primary/50 bg-gradient-to-r"
                                initial={{ width: 0 }}
                                animate={featuredInView ? { width: '6rem' } : { width: 0 }}
                                transition={{ delay: 0.3, duration: 0.8 }}
                            />
                        </div>
                        <p className="max-w-2xl mx-auto mt-6 text-lg text-gray-300/80">
                            Discover our curated selection of films from around the world that we think you'll love
                        </p>
                    </motion.div>

                    {/* Enhanced Recommended Film Carousel */}
                    <div className="relative">
                        {/* Custom Navigation Controls */}
                        <div className="absolute z-10 flex items-center justify-between w-full px-4 transform -translate-y-1/2 top-1/2">
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setCurrentIndex((prev) => (prev === 0 ? featuredFilms.length - 1 : prev - 1))}
                                className="flex items-center justify-center w-12 h-12 text-white transition-all duration-300 border rounded-full hover:bg-primary/70 border-white/10 bg-black/50 backdrop-blur-sm focus:outline-none"
                                aria-label="Previous film"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setCurrentIndex((prev) => (prev === featuredFilms.length - 1 ? 0 : prev + 1))}
                                className="flex items-center justify-center w-12 h-12 text-white transition-all duration-300 border rounded-full hover:bg-primary/70 border-white/10 bg-black/50 backdrop-blur-sm focus:outline-none"
                                aria-label="Next film"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </motion.button>
                        </div>

                        {featuredFilms.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                animate={featuredInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="relative h-[600px] overflow-hidden rounded-3xl shadow-2xl"
                            >
                                <div className="absolute inset-0 overflow-hidden rounded-3xl border border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.3)]">
                                    <AnimatePresence>
                                        {featuredFilms.map((film, index) => (
                                            <motion.div
                                                key={film.id}
                                                initial={{ opacity: 0 }}
                                                animate={{
                                                    opacity: currentIndex === index ? 1 : 0,
                                                    zIndex: currentIndex === index ? 1 : 0,
                                                }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.7 }}
                                                className="absolute inset-0 flex w-full h-full"
                                                onMouseEnter={() => setIsVideoPlaying(true)}
                                                onMouseLeave={() => setIsVideoPlaying(false)}
                                            >
                                                <div className="relative w-1/2">
                                                    <div
                                                        className="absolute inset-0"
                                                        style={{
                                                            background: 'linear-gradient(to right, rgba(0,0,0,0.95) 40%, transparent)',
                                                        }}
                                                    />
                                                    <div className="relative z-10 flex flex-col justify-center h-full p-12">
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: 0.3, duration: 0.5 }}
                                                        >
                                                            <div className="flex items-center mb-6">
                                                                <span className="flex items-center px-4 py-1 text-sm font-medium text-white rounded-full bg-primary/80 backdrop-blur-sm">
                                                                    <svg
                                                                        className="w-4 h-4 mr-1"
                                                                        viewBox="0 0 24 24"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth={2}
                                                                            d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                                                                        />
                                                                    </svg>
                                                                    {film.genre || 'Recommended'}
                                                                </span>

                                                                {index === currentIndex && (
                                                                    <div className="flex items-center ml-4 space-x-1">
                                                                        {[...Array(5)].map((_, i) => (
                                                                            <motion.div
                                                                                key={i}
                                                                                className="bg-primary/80 h-1.5 w-1.5 rounded-full"
                                                                                animate={{
                                                                                    scale: [1, 1.5, 1],
                                                                                    opacity: [0.7, 1, 0.7],
                                                                                }}
                                                                                transition={{
                                                                                    duration: 1,
                                                                                    delay: i * 0.15,
                                                                                    repeat: Infinity,
                                                                                    repeatDelay: 0.5,
                                                                                }}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </motion.div>

                                                        <motion.h3
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: 0.4, duration: 0.5 }}
                                                            className="text-5xl font-bold leading-tight text-white"
                                                        >
                                                            {film.title}
                                                        </motion.h3>

                                                        <motion.div
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: 0.5, duration: 0.5 }}
                                                            className="flex items-center mt-4 space-x-4 text-white/70"
                                                        >
                                                            <span className="flex items-center">
                                                                <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={2}
                                                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                                    />
                                                                </svg>
                                                                {film.duration} min
                                                            </span>
                                                            {film.director && (
                                                                <>
                                                                    <span>•</span>
                                                                    <span className="flex items-center">
                                                                        <svg
                                                                            className="w-4 h-4 mr-1"
                                                                            viewBox="0 0 24 24"
                                                                            fill="none"
                                                                            stroke="currentColor"
                                                                        >
                                                                            <path
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                strokeWidth={2}
                                                                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                                                            />
                                                                        </svg>
                                                                        {film.director}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </motion.div>

                                                        <motion.p
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: 0.6, duration: 0.5 }}
                                                            className="mt-6 text-lg font-light line-clamp-4 text-white/80"
                                                        >
                                                            {film.description}
                                                        </motion.p>

                                                        <motion.div
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: 0.7, duration: 0.5 }}
                                                            className="mt-8"
                                                        >
                                                            <Link
                                                                href={`/films/${film.id}`}
                                                                className="relative inline-flex items-center px-8 py-3 overflow-hidden font-medium text-white transition-all duration-300 rounded-full group"
                                                            >
                                                                <span className="absolute inset-0 z-0 rounded-full from-primary to-primary/80 bg-gradient-to-r"></span>
                                                                <span className="relative z-10 flex items-center">
                                                                    Book Tickets
                                                                    <svg
                                                                        className="w-5 h-5 ml-2 transition-transform duration-300 transform group-hover:translate-x-1"
                                                                        fill="none"
                                                                        viewBox="0 0 24 24"
                                                                        stroke="currentColor"
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth={2}
                                                                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                                                                        />
                                                                    </svg>
                                                                </span>
                                                                <motion.span
                                                                    className="absolute inset-0 rounded-full -z-10 bg-white/20"
                                                                    whileHover={{ scale: 1.5, opacity: 0.3 }}
                                                                    transition={{ duration: 0.4 }}
                                                                />
                                                            </Link>
                                                        </motion.div>
                                                    </div>
                                                </div>
                                                <div className="relative w-1/2 overflow-hidden">
                                                    {film.poster_image ? (
                                                        <motion.img
                                                            src={
                                                                film.poster_image.startsWith('http')
                                                                    ? film.poster_image
                                                                    : `/storage/${film.poster_image}`
                                                            }
                                                            alt={film.title}
                                                            className="object-cover w-full h-full"
                                                            initial={{ scale: 1.1 }}
                                                            animate={{ scale: 1 }}
                                                            transition={{ duration: 0.8 }}
                                                        />
                                                    ) : (
                                                        <div className="flex items-center justify-center w-full h-full bg-gray-800">
                                                            <span className="text-white/50">No image available</span>
                                                        </div>
                                                    )}

                                                    {/* Creative overlay with film details */}
                                                    <div className="absolute inset-0 bg-gradient-to-l from-black/30 to-transparent" />

                                                    {/* Film strip border design */}
                                                    <div className="absolute top-0 left-0 right-0 flex h-8 overflow-hidden">
                                                        {[...Array(20)].map((_, i) => (
                                                            <div key={i} className="w-8 h-full bg-black border border-white/20" />
                                                        ))}
                                                    </div>
                                                    <div className="absolute bottom-0 left-0 right-0 flex h-8 overflow-hidden">
                                                        {[...Array(20)].map((_, i) => (
                                                            <div key={i} className="w-8 h-full bg-black border border-white/20" />
                                                        ))}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        )}

                        {/* Interactive Carousel Indicators */}
                        <div className="flex justify-center mt-8 space-x-3">
                            {featuredFilms.map((_, index) => (
                                <motion.button
                                    key={index}
                                    onClick={() => setCurrentIndex(index)}
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.9 }}
                                    className={`relative h-3 rounded-full transition-all duration-300 ${
                                        currentIndex === index ? 'bg-primary w-8' : 'w-3 bg-gray-400/30'
                                    }`}
                                    aria-label={`Go to slide ${index + 1}`}
                                >
                                    {currentIndex === index && (
                                        <motion.span
                                            className="absolute inset-0 rounded-full bg-primary/50"
                                            initial={{ scale: 1 }}
                                            animate={{ scale: 1.5, opacity: 0 }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                        />
                                    )}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Now Showing with 3D Perspective Cards */}
            <section
                className="relative py-24 overflow-hidden"

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
                        className="absolute w-40 h-40 rounded-full bg-primary/5 -top-20 -right-20 blur-3xl"
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
                        className="absolute rounded-full bg-primary/5 bottom-40 -left-20 h-60 w-60 blur-3xl"
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

                <div className="relative z-10 px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
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
                        <h2 className="mt-4 text-4xl font-bold tracking-tight text-transparent bg-gradient-to-r from-white to-white/80 bg-clip-text">
                            Latest Releases
                        </h2>
                        <div className="flex justify-center mt-4">
                            <motion.div
                                className="w-24 h-1 rounded-full from-primary to-primary/50 bg-gradient-to-r"
                                initial={{ width: 0 }}
                                whileInView={{ width: '6rem' }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3, duration: 0.8 }}
                            />
                        </div>
                        <p className="max-w-2xl mx-auto mt-6 text-lg text-gray-300/80">
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
                                                    className="object-cover w-full h-full"
                                                    whileHover={{
                                                        scale: 1.1,
                                                        transition: { duration: 0.5 },
                                                    }}
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full bg-gray-800 text-white/50">
                                                    No image available
                                                </div>
                                            )}

                                            {/* Film Genre Badge */}
                                            <div className="absolute top-4 right-4">
                                                <span className="px-3 py-1 text-xs font-medium text-white border rounded-full border-white/10 bg-black/50 backdrop-blur-sm">
                                                    {film.genre || 'Drama'}
                                                </span>
                                            </div>

                                            {/* Hover Overlay with Play Button */}
                                            <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 opacity-0 bg-gradient-to-t from-black via-black/50 to-transparent group-hover:opacity-100">
                                                <motion.div
                                                    className="p-3 rounded-full bg-primary/90"
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-xl font-bold text-white">{film.title}</h3>
                                                <span className="px-2 py-1 text-xs font-medium rounded-md bg-primary/20 text-primary">
                                                    {film.duration} min
                                                </span>
                                            </div>
                                            <p className="mb-4 text-sm line-clamp-2 text-white/70">{film.description}</p>

                                            {/* Book Now Button */}
                                            <div className="group/button">
                                                <motion.div
                                                    className="flex items-center justify-between p-3 overflow-hidden text-white transition-colors duration-300 border rounded-lg bg-primary/10 border-primary/20 group-hover/button:bg-primary/20 backdrop-blur-sm"
                                                    whileTap={{ scale: 0.98 }}
                                                >
                                                    <span className="text-sm font-medium">Book Now</span>
                                                    <motion.svg
                                                        className="w-5 h-5"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                        initial={{ x: 0 }}
                                                        whileHover={{ x: 3 }}
                                                        transition={{ type: 'spring', stiffness: 400 }}
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                                                        />
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
                        className="flex justify-center mt-16"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <Link
                            href="/films"
                            className="relative px-8 py-3 overflow-hidden text-lg font-medium text-white transition-all rounded-full group"
                        >
                            <span className="absolute inset-0 z-0 rounded-full from-primary/80 to-primary bg-gradient-to-r"></span>
                            <span className="relative z-10 flex items-center">
                                View All Films
                                <svg
                                    className="w-5 h-5 ml-2 transition-transform duration-300 transform group-hover:translate-x-1"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </span>
                            <motion.span
                                className="absolute inset-0 rounded-full -z-10 bg-white/20"
                                whileHover={{ scale: 1.5, opacity: 0.3 }}
                                transition={{ duration: 0.4 }}
                            />
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Cinema Experience Showcase */}
            <section
                className="relative py-24 overflow-hidden"

            >
                <div className="absolute inset-0 opacity-10">
                    {/* Abstract cinema-themed background pattern */}
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse">
                            <path d="M 8 0 L 0 0 0 8" fill="none" stroke="currentColor" strokeWidth="0.5" />
                        </pattern>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                </div>

                <div className="relative z-10 px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
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
                            <span className="text-primary/80 mx-3 text-sm font-medium tracking-[0.2em] uppercase">Premium</span>
                            <span className="bg-primary/70 h-[1px] w-8"></span>
                        </div>
                        <h2 className="mt-4 text-4xl font-bold tracking-tight text-transparent bg-gradient-to-r from-white to-white/80 bg-clip-text">
                            The Ultimate Cinema Experience
                        </h2>
                        <div className="flex justify-center mt-4">
                            <motion.div
                                className="w-24 h-1 rounded-full from-primary to-primary/50 bg-gradient-to-r"
                                initial={{ width: 0 }}
                                whileInView={{ width: '6rem' }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3, duration: 0.8 }}
                            />
                        </div>
                        <p className="max-w-2xl mx-auto mt-6 text-lg text-gray-300/80">Every detail designed for your comfort and enjoyment</p>
                    </motion.div>

                    {/* Experience Features */}
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        {[
                            {
                                icon: (
                                    <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                                        />
                                    </svg>
                                ),
                                title: 'Cutting-Edge Screens',
                                description: 'Experience movies on our state-of-the-art 4K digital projection systems with crystal clear images.',
                            },
                            {
                                icon: (
                                    <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 01-.707-7.07m-2.122 9.9a9 9 0 010-12.728"
                                        />
                                    </svg>
                                ),
                                title: 'Immersive Sound',
                                description: 'Dolby Atmos® surround sound technology places you at the center of the action.',
                            },
                            {
                                icon: (
                                    <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                                        />
                                    </svg>
                                ),
                                title: 'Luxury Seating',
                                description: 'Sink into our premium reclining seats with extra legroom and personal space for ultimate comfort.',
                            },
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.2 }}
                                className="p-8 transition-colors duration-300 border rounded-3xl border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10"
                            >
                                <div className="flex items-center justify-center w-16 h-16 mb-6 bg-primary/20 rounded-2xl">{feature.icon}</div>
                                <h3 className="mb-4 text-2xl font-bold text-white">{feature.title}</h3>
                                <p className="text-white/70">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
                </div>
            {/* Call to Action */}
            <section className="relative py-24 from-primary/90 to-primary bg-gradient-to-r">
                <div className="absolute inset-0 overflow-hidden opacity-20">
                    {/* Abstract cinema pattern */}
                    <div className="absolute inset-0 flex flex-col">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="flex flex-1 border-b border-white/10">
                                {[...Array(20)].map((_, j) => (
                                    <div key={j} className="flex-1 border-r border-white/10" />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative z-10 px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center justify-between md:flex-row">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="max-w-2xl mb-10 md:mb-0"
                        >
                            <h2 className="text-4xl font-bold leading-tight text-white">
                                Ready for the Ultimate <br />
                                Cinema Experience?
                            </h2>
                            <p className="mt-4 text-lg text-white/80">
                                Join us for an unforgettable journey through sound and vision. Book your tickets now.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <Link
                                href="/films"
                                className="relative inline-flex items-center px-8 py-4 overflow-hidden text-lg font-medium transition-all bg-white rounded-full shadow-xl group text-primary hover:bg-white/90 focus:ring-2 focus:ring-white/20 focus:outline-none"
                            >
                                Browse All Films
                                <svg
                                    className="w-5 h-5 ml-2 transition-transform duration-300 transform group-hover:translate-x-1"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                                <motion.span
                                    className="absolute inset-0 rounded-full -z-10 bg-white/20"
                                    whileHover={{ scale: 1.5, opacity: 0.3 }}
                                    transition={{ duration: 0.4 }}
                                />
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </section>
        </ClientLayout>
    );
}
