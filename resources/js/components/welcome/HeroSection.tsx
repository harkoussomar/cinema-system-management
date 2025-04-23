import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { memo, useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';

const HeroSection = memo(() => {
    const [scrollY, setScrollY] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Parallax effect with throttling
    useEffect(() => {
        let ticking = false;

        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    setScrollY(window.scrollY);
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Add smooth scroll behavior to document
    useEffect(() => {
        document.documentElement.style.scrollBehavior = 'smooth';
        return () => {
            document.documentElement.style.scrollBehavior = '';
        };
    }, []);

    // Handle scroll to next section
    const handleScrollToNextSection = () => {
        const featuredSection = document.getElementById('featured');
        if (featuredSection) {
            featuredSection.scrollIntoView();
        } else {
            const heroHeight = window.innerHeight;
            window.scrollTo({
                top: heroHeight,
                behavior: 'smooth',
            });
        }
    };

    // Custom hooks for section animations - use larger threshold for better performance
    const [heroRef, heroInView] = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    // Video background control
    const playVideo = () => {
        if (videoRef.current) {
            videoRef.current.play().catch((e) => console.log('Video autoplay prevented by browser'));
        }
    };

    // Simpler text animation variants
    const textVariants = {
        hidden: { opacity: 0 },
        visible: (i: number) => ({
            opacity: 1,
            transition: { delay: i * 0.1, duration: 0.5 },
        }),
    };

    return (
        <section ref={heroRef} className="relative h-screen overflow-hidden">
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
                    transform: `translateY(${scrollY * 0.1}px)`,
                }}
            >
                <motion.div initial="hidden" animate={heroInView ? 'visible' : 'hidden'} className="max-w-4xl">
                    <div className="flex items-center mb-4">
                        <motion.div custom={0} variants={textVariants} className="w-10 h-1 mr-4 rounded-full bg-primary" />
                        <motion.span custom={1} variants={textVariants} className="text-primary text-sm font-medium tracking-[0.2em] uppercase">
                            Welcome to CineVerse
                        </motion.span>
                    </div>

                    <motion.h1 custom={2} variants={textVariants} className="text-5xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl">
                        Where Stories
                        <span className="relative inline-block px-2 py-1 ml-2">
                            <span className="relative z-10">Come Alive</span>
                            <motion.span
                                className="absolute left-0 w-full h-full bg-primary/30 -bottom-0 -z-10"
                                initial={{ width: 0 }}
                                animate={{ width: '100%' }}
                                transition={{ delay: 0.5, duration: 0.5 }}
                            />
                        </span>
                    </motion.h1>

                    <motion.p custom={3} variants={textVariants} className="max-w-2xl mt-6 text-lg font-light text-white/80 md:text-xl">
                        Immerse yourself in extraordinary worlds where imagination meets reality. Experience cinema like never before with our premium
                        viewing experience, luxurious seating, and immersive sound technology.
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
                        </Link>
                    </motion.div>
                </motion.div>
            </div>

            {/* Simplified scroll indicator with reduced animation */}
            <button
                onClick={handleScrollToNextSection}
                className="absolute z-10 p-2 transform -translate-x-1/2 border-none outline-none cursor-pointer bottom-30 left-1/2 focus:border-0 focus:ring-0 focus:outline-none active:outline-none"
                aria-label="Scroll to next section"
                style={{ WebkitTapHighlightColor: 'transparent', outlineColor: 'transparent' }}
            >
                <div className="flex flex-col items-center">
                    <span className="mb-2 text-sm font-light tracking-wider text-white/80">Discover More</span>
                    <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13l-7 7-7-7m14-8l-7 7-7-7" />
                    </svg>
                </div>
            </button>
        </section>
    );
});

export default HeroSection;
