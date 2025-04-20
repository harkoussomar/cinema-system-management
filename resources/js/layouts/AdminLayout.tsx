import ArrowLeftOnRectangleIcon from '@heroicons/react/24/outline/ArrowLeftOnRectangleIcon.js';
import Bars3Icon from '@heroicons/react/24/outline/Bars3Icon.js';
import CalendarIcon from '@heroicons/react/24/outline/CalendarIcon.js';
import ChartBarIcon from '@heroicons/react/24/outline/ChartBarIcon.js';
import ChevronDownIcon from '@heroicons/react/24/outline/ChevronDownIcon.js';
import CogIcon from '@heroicons/react/24/outline/CogIcon.js';
import FilmIcon from '@heroicons/react/24/outline/FilmIcon.js';
import HomeIcon from '@heroicons/react/24/outline/HomeIcon.js';
import StarIcon from '@heroicons/react/24/outline/StarIcon.js';
import TicketIcon from '@heroicons/react/24/outline/TicketIcon.js';
import UserIcon from '@heroicons/react/24/outline/UserIcon.js';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon.js';
import { Link } from '@inertiajs/react';
import { PopcornIcon } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';

interface AdminLayoutProps {
    children: ReactNode;
    title?: string;
    subtitle?: string;
}

export default function AdminLayout({ children, title = 'Dashboard', subtitle }: AdminLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    // Always use dark mode
    useEffect(() => {
        document.documentElement.classList.add('dark');
        localStorage.setItem('darkMode', 'true');
    }, []);

    // Add scroll listener for header shadow
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Get current page for nav highlighting
    const currentPath = window.location.pathname;

    const navigationItems = [
        { name: 'Dashboard', href: '/admin', icon: HomeIcon },
        { name: 'Films', href: '/admin/films', icon: FilmIcon },
        { name: 'Screenings', href: '/admin/screenings', icon: CalendarIcon },
        { name: 'Reservations', href: '/admin/reservations', icon: TicketIcon },
        { name: 'Reports', href: '/admin/reports/films', icon: ChartBarIcon },
    ];

    // Function to generate breadcrumbs
    const generateBreadcrumbs = () => {
        const paths = currentPath.split('/').filter(Boolean);

        // Return nothing for root admin path
        if (paths.length <= 1) return null;

        return (
            <div className="text-muted-foreground mb-2 flex text-sm">
                <Link href="/admin" className="hover:text-primary transition-colors">
                    Admin
                </Link>
                {paths.slice(1).map((path, index) => (
                    <div key={path} className="flex items-center">
                        <span className="mx-2">/</span>
                        {index === paths.slice(1).length - 1 ? (
                            <span className="text-foreground font-medium capitalize">{path}</span>
                        ) : (
                            <Link href={`/admin/${paths.slice(1, index + 2).join('/')}`} className="hover:text-primary capitalize transition-colors">
                                {path}
                            </Link>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    const handleProfileClick = () => {
        setIsProfileOpen(!isProfileOpen);
    };

    return (
        <div className="bg-background text-foreground min-h-screen">
            {/* Mobile sidebar */}
            <div className={`fixed inset-0 z-50 flex md:hidden ${sidebarOpen ? '' : 'hidden'}`}>
                <div className="bg-opacity-60 fixed inset-0 bg-black backdrop-blur-sm" onClick={() => setSidebarOpen(false)} aria-hidden="true"></div>

                <div className="bg-sidebar relative flex w-full max-w-xs flex-1 transform flex-col pt-5 pb-4 shadow-xl transition-transform duration-200 ease-in-out">
                    <div className="absolute top-0 right-0 -mr-12 pt-2">
                        <button
                            className="bg-sidebar-accent focus:ring-primary ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:ring-2 focus:outline-none"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <span className="sr-only">Close sidebar</span>
                            <XMarkIcon className="text-sidebar-foreground h-6 w-6" aria-hidden="true" />
                        </button>
                    </div>

                    <div className="flex flex-shrink-0 items-center px-4">
                        <div className="flex items-center gap-2">
                            <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-md">
                                <img src="/logo.png" alt="Logo" className="h-5 w-5" />
                            </div>
                            <h1 className="text-sidebar-foreground text-xl font-bold">CinemaAdmin</h1>
                        </div>
                    </div>

                    <div className="mt-6 h-0 flex-1 overflow-y-auto">
                        <nav className="space-y-1 px-3">
                            {navigationItems.map((item) => {
                                const isActive = currentPath.startsWith(item.href);
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`group flex items-center rounded-md px-3 py-2.5 text-base font-medium transition-colors ${
                                            isActive
                                                ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                                                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                                        }`}
                                    >
                                        <item.icon
                                            className={`mr-4 h-5 w-5 flex-shrink-0 ${
                                                isActive
                                                    ? 'text-sidebar-primary-foreground'
                                                    : 'text-muted-foreground group-hover:text-sidebar-accent-foreground'
                                            }`}
                                            aria-hidden="true"
                                        />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Now Showing Section */}
                    <div className="bg-sidebar-accent mx-3 mt-8 rounded-lg p-3 shadow-inner">
                        <h3 className="text-muted-foreground mb-3 flex items-center text-xs font-semibold tracking-wider uppercase">
                            <StarIcon className="mr-1 h-3.5 w-3.5 text-yellow-500" />
                            Now Showing
                        </h3>
                        <div className="space-y-2">
                            <div className="flex items-center">
                                <div className="bg-success mr-2 h-2 w-2 rounded-full"></div>
                                <span className="text-sidebar-foreground text-xs">Oppenheimer</span>
                            </div>
                            <div className="flex items-center">
                                <div className="bg-success mr-2 h-2 w-2 rounded-full"></div>
                                <span className="text-sidebar-foreground text-xs">Dune 2</span>
                            </div>
                            <div className="flex items-center">
                                <div className="bg-destructive mr-2 h-2 w-2 rounded-full"></div>
                                <span className="text-sidebar-foreground text-xs">Inside Out 2</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Static sidebar for desktop */}
            <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
                <div className="bg-sidebar flex h-full flex-grow flex-col overflow-y-auto pt-5">
                    <div className="mb-8 flex flex-shrink-0 items-center px-6">
                        <div className="flex items-center gap-2">
                            <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-md">
                                <img src="/logo.png" alt="Logo" className="h-5 w-5" />
                            </div>
                            <h1 className="text-sidebar-foreground text-xl font-bold">CinemaAdmin</h1>
                        </div>
                    </div>

                    <div className="mb-2 px-4">
                        <h2 className="text-muted-foreground px-3 text-xs font-semibold tracking-wider uppercase">Main Menu</h2>
                    </div>

                    <div className="mt-2 flex flex-grow flex-col">
                        <nav className="flex-1 space-y-1 px-3 pb-4">
                            {navigationItems.map((item) => {
                                const isActive = currentPath.startsWith(item.href);
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-all ${
                                            isActive
                                                ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                                                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                                        }`}
                                    >
                                        <item.icon
                                            className={`mr-3 h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110 ${
                                                isActive
                                                    ? 'text-sidebar-primary-foreground'
                                                    : 'text-muted-foreground group-hover:text-sidebar-accent-foreground'
                                            }`}
                                            aria-hidden="true"
                                        />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Now Showing Section */}
                    <div className="bg-sidebar-accent mx-3 mt-auto mb-6 rounded-lg p-3 shadow-inner">
                        <h3 className="text-muted-foreground mb-3 flex items-center text-xs font-semibold tracking-wider uppercase">
                            <StarIcon className="mr-1 h-3.5 w-3.5 text-yellow-500" />
                            Now Showing
                        </h3>
                        <div className="space-y-2">
                            <div className="flex items-center">
                                <div className="bg-success mr-2 h-2 w-2 rounded-full"></div>
                                <span className="text-sidebar-foreground text-xs">Oppenheimer</span>
                            </div>
                            <div className="flex items-center">
                                <div className="bg-success mr-2 h-2 w-2 rounded-full"></div>
                                <span className="text-sidebar-foreground text-xs">Dune 2</span>
                            </div>
                            <div className="flex items-center">
                                <div className="bg-destructive mr-2 h-2 w-2 rounded-full"></div>
                                <span className="text-sidebar-foreground text-xs">Inside Out 2</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="flex flex-1 flex-col md:pl-64">
                <div
                    className={`sticky top-0 z-10 flex h-16 flex-shrink-0 ${isScrolled ? 'shadow-lg' : 'shadow-md'} bg-card transition-shadow duration-200`}
                >
                    <button
                        type="button"
                        className="border-border text-muted-foreground hover:text-foreground focus:ring-primary border-r px-4 focus:ring-2 focus:outline-none focus:ring-inset md:hidden"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <span className="sr-only">Open sidebar</span>
                        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                    </button>

                    <div className="flex flex-1 justify-between px-4">
                        <div className="flex flex-1 items-center">
                            {/* Page title for mobile */}
                            <h1 className="text-foreground text-lg font-medium md:hidden">{title}</h1>
                        </div>

                        <div className="ml-4 flex items-center gap-5 md:ml-6">
                            {/* User profile dropdown - improved styling */}
                            <div className="relative">
                                <button
                                    onClick={handleProfileClick}
                                    className="flex items-center gap-2 rounded-md text-sm transition-opacity hover:opacity-80 focus:outline-none"
                                    aria-expanded={isProfileOpen}
                                    aria-haspopup="true"
                                >
                                    <div className="bg-primary/10 border-primary flex h-8 w-8 items-center justify-center rounded-full border-1">
                                        <span className="text-foreground text-sm font-medium">A</span>
                                    </div>
                                    <span className="text-foreground hidden text-sm font-medium md:block">Admin User</span>
                                    <ChevronDownIcon
                                        className={`text-muted-foreground hidden h-4 w-4 transition-transform duration-200 md:block ${isProfileOpen ? 'rotate-180' : ''}`}
                                    />
                                </button>

                                {isProfileOpen && (
                                    <div className="border-border bg-popover absolute right-0 z-10 mt-2 w-48 origin-top-right transform overflow-hidden rounded-md border shadow-lg transition-all duration-200 ease-out">
                                        <div className="py-1">
                                            <Link
                                                href="/admin/profile"
                                                className="text-popover-foreground hover:bg-accent/80 flex items-center px-4 py-2 text-sm transition-colors"
                                            >
                                                <UserIcon className="text-muted-foreground mr-3 h-4 w-4" />
                                                Your Profile
                                            </Link>
                                            <Link
                                                href="/admin/settings"
                                                className="text-popover-foreground hover:bg-accent/80 flex items-center px-4 py-2 text-sm transition-colors"
                                            >
                                                <CogIcon className="text-muted-foreground mr-3 h-4 w-4" />
                                                Settings
                                            </Link>
                                            <div className="border-border my-1 border-t"></div>
                                            <Link
                                                href={route('admin.logout')}
                                                method="post"
                                                as="button"
                                                className="text-popover-foreground hover:bg-accent/80 flex w-full items-center px-4 py-2 text-sm transition-colors"
                                            >
                                                <ArrowLeftOnRectangleIcon className="text-muted-foreground mr-3 h-4 w-4" />
                                                Sign out
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <main className="bg-background flex-1 border">
                    {/* Page header with improved film strip design */}
                    <div className="bg-card relative m-1 overflow-hidden px-4 py-4 sm:px-6 md:px-8">
                        {generateBreadcrumbs()}
                        <div className="mt-1 flex items-center justify-between">
                            <div>
                                <h1 className="text-foreground flex items-center text-2xl font-bold tracking-tight">
                                    <PopcornIcon className="mr-2 h-6 w-6 text-yellow-200" />
                                    {title}
                                </h1>
                                {subtitle && <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="p-4 md:p-8">
                        {/* Content wrapper with improved shadow and rounded corners */}
                        <div className="bg-card rounded-lg px-4 py-6 shadow-lg ring-1 ring-black/5 sm:p-6 md:p-8">{children}</div>
                    </div>
                </main>
            </div>
        </div>
    );
}
