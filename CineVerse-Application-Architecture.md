# CineVerse: Cinema System Management Application Architecture

This document provides a comprehensive overview of the CineVerse cinema management system, built with Laravel, Inertia.js, React, and TypeScript.

## Table of Contents

1. [Overview of the Stack](#overview-of-the-stack)
2. [Application Architecture](#application-architecture)
3. [Request Lifecycle](#request-lifecycle)
4. [Authentication Flow](#authentication-flow)
5. [Frontend Organization](#frontend-organization)
6. [Core System Components](#core-system-components)
7. [Data Flow Patterns](#data-flow-patterns)
8. [Development Patterns](#development-patterns)
9. [Configuration](#configuration)
10. [Deployment Considerations](#deployment-considerations)

## Overview of the Stack

CineVerse uses a modern full-stack architecture:

- **Laravel 12**: Backend PHP framework handling business logic, database operations, authentication, and server-side validation
- **Inertia.js**: Middleware layer connecting Laravel with React without requiring a traditional API, allowing for server-side routing with client-side rendering
- **React 18 with TypeScript**: Frontend library with static typing for building dynamic, type-safe UI components with proper state management
- **SQLite**: Database stored at a custom location (`C:/Users/Formulapp/Desktop/new_db.sqlite`), configured for development with easy migration to production databases
- **Apache**: Web server handling HTTP requests with custom rewrites configured in `.htaccess`
- **TailwindCSS**: Utility-first CSS framework for responsive UI design
- **Framer Motion**: Animation library for enhanced user experience
- **Heroicons**: SVG icon library for consistent UI elements

## Application Architecture

### Client/Admin Separation

The application is organized into distinct client and admin sections with clear separation of concerns:

- **Client Area**:

    - Public-facing movie browsing and filtering
    - Seat selection and reservation system
    - Payment processing integration
    - Ticket generation and delivery
    - User account management

- **Admin Area**:
    - Dashboard with key performance metrics
    - Film management with OMDB API integration
    - Screening scheduling with seat configuration
    - Reservation oversight and status management
    - Comprehensive reporting system

These sections are separated at both the routing and middleware level, with specific guards ensuring proper access control through dedicated middleware classes: `EnsureUserIsClient` and `EnsureUserIsAdmin`.

### Routes Organization

The routing structure enforces the client/admin separation pattern:

```php
// Client-facing routes with client role middleware
Route::middleware(['web', \App\Http\Middleware\EnsureUserIsClient::class])->group(function () {
    // Public Routes
    Route::get('/', [FilmController::class, 'home'])->name('home');
    Route::get('/films', [FilmController::class, 'index'])->name('films.index');
    Route::get('/films/{film}', [FilmController::class, 'show'])->name('films.show');

    // Reservation Process Routes
    Route::get('/screenings/{screening}/seats', [ReservationController::class, 'seatSelection'])
        ->name('reservations.seat-selection');
    Route::post('/screenings/{screening}/reservations', [ReservationController::class, 'store'])
        ->name('reservations.store');
    Route::get('/reservations/{reservation}/payment', [ReservationController::class, 'payment'])
        ->name('reservations.payment');

    // Authenticated Client Routes
    Route::middleware(['auth:web', 'verified'])->group(function () {
        // Account management routes
        // User-specific reservation routes
    });
});

// Admin routes with admin authentication and role middleware
Route::prefix('admin')->name('admin.')->middleware(['auth:admin', \App\Http\Middleware\EnsureUserIsAdmin::class])->group(function () {
    // Film management
    Route::resource('films', AdminFilmController::class);

    // OMDB API integration routes
    Route::post('/films/omdb/search', [AdminFilmController::class, 'searchOmdb']);
    Route::get('/films/omdb/{imdb_id}/details', [AdminFilmController::class, 'getOmdbFilmDetails']);

    // Screening management
    Route::resource('screenings', ScreeningController::class);

    // Reservation oversight
    Route::get('/reservations', [AdminReservationController::class, 'index']);
    Route::put('/reservations/{reservation}/status', [AdminReservationController::class, 'updateStatus']);

    // Reporting routes
    Route::get('/reports/films', [ReportController::class, 'films']);
    Route::get('/reports/revenue', [ReportController::class, 'revenue']);
});
```

### Directory Structure

The application follows a well-organized structure with clear separation between client and admin components:

- **Backend (Laravel)**

    - `app/Http/Controllers/` - Base controllers for client-facing features
    - `app/Http/Controllers/Admin/` - Controllers specific to admin functionality
    - `app/Models/` - Eloquent models with relationships and business logic
    - `app/Services/` - Service classes for external APIs and business logic
    - `app/Notifications/` - Email notification classes
    - `app/Http/Middleware/` - Custom middleware including role verification
    - `routes/web.php` - Web routes for both client and admin areas
    - `routes/api.php` - API endpoints for AJAX operations and external services

- **Frontend (React/TypeScript)**
    - `/resources/js/pages/Client/` - Client-facing page components
        - `/Films/` - Film browsing and details pages
        - `/Reservations/` - Reservation process components
        - `/Account/` - User account management
    - `/resources/js/pages/Admin/` - Admin dashboard and management interfaces
        - `/Dashboard/` - Analytics and statistics
        - `/Films/` - Film CRUD operations
        - `/Screenings/` - Screening management
        - `/Reservations/` - Reservation oversight
    - `/resources/js/components/` - Reusable UI components and design system
    - `/resources/js/layouts/` - Layout templates (AdminLayout, ClientLayout)
    - `/resources/js/types/` - TypeScript interface definitions

## Request Lifecycle

### 1. Initial Request Flow

When a user visits the CineVerse application:

1. **HTTP Request**: Apache processes the incoming request and applies `.htaccess` rules
2. **Bootstrap**: `public/index.php` bootstraps the Laravel application and initializes the service container
3. **Middleware**: Request passes through global middleware stack:
    - `PreventRequestsDuringMaintenance`
    - `HandleCors`
    - `TrimStrings`
    - `ValidateCsrfToken`
    - Role-specific middleware (`EnsureUserIsClient` or `EnsureUserIsAdmin`)
    - `HandleInertiaRequests`
4. **Routing**: The request is matched to a route in `routes/web.php`
5. **Controller**: The corresponding controller action is executed
6. **Response**: The controller returns an Inertia response with props: `Inertia::render('PageName', $props)`
7. **Inertia Middleware**: Adds shared data (auth status, user info, flash messages)
8. **HTML Response**: Full HTML document is returned with initial data embedded as JSON

### 2. Inertia.js Integration

The `HandleInertiaRequests` middleware provides shared data to all pages and handles role verification:

```php
public function share(Request $request): array
{
    // Fetches inspiring quotes for UI
    [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

    $user = $request->user();
    $isAdminPath = $request->is('admin*');

    // Advanced role verification and automatic logout for mismatched roles
    if ($user && (($isAdminPath && $user->role !== 'admin') || (!$isAdminPath && $user->role === 'admin'))) {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        $user = null;
    }

    // Make user data fully visible for the frontend
    if ($user) {
        $user->makeVisible(['id', 'name', 'email', 'role', 'created_at', 'updated_at']);
    }

    return [
        'name' => config('app.name'),
        'quote' => ['message' => trim($message), 'author' => trim($author)],
        'auth' => [
            'user' => $user,
        ],
        'ziggy' => fn (): array => [
            ...(new Ziggy)->toArray(),
            'location' => $request->url(),
        ],
        'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
    ];
}
```

### 3. Frontend Rendering

The frontend application entry point `/resources/js/app.tsx` initializes Inertia and React with theme support:

```tsx
import '../css/app.css';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});

// Initialize light/dark mode theme
initializeTheme();
```

## Authentication Flow

CineVerse implements a sophisticated dual authentication system with role-based access control:

### 1. Client Authentication

- **Guard**: Standard web guard (`auth:web`)
- **Features**:
    - Email verification
    - Password reset capabilities
    - Remember me functionality
    - Session-based authentication with CSRF protection
- **Access Control**: `EnsureUserIsClient` middleware validates the user role
- **User Experience**: Automatic redirection to login page for protected routes
- **Session Management**: 120-minute session lifetime with secure cookie storage

### 2. Admin Authentication

- **Guard**: Custom admin guard (`auth:admin`)
- **Features**:
    - Separate login credentials and sessions from client users
    - Enhanced security with additional verification steps
    - Restricted access to admin dashboard and management interfaces
- **Access Control**: `EnsureUserIsAdmin` middleware enforces admin role requirements
- **Security**: Fresh user data validation on each request in admin routes:

```php
// Extra verification for admin routes
if ($isAdminPath) {
    try {
        // Try to get fresh user data for admin routes
        $freshUser = User::find($user->id);
        if ($freshUser) {
            $freshUser->makeVisible(['id', 'name', 'email', 'role', 'created_at', 'updated_at']);
            $user = $freshUser;
        }
    } catch (\Exception $e) {
        Log::error('Error refreshing user', [
            'error' => $e->getMessage(),
            'user_id' => $user->id
        ]);
    }
}
```

### 3. Role-Based Redirection

The Inertia middleware automatically handles role-specific redirects and logs out users attempting to access incorrect areas:

```php
// Check if we need to force logout due to role mismatch
if ($user && (($isAdminPath && $user->role !== 'admin') || (!$isAdminPath && $user->role === 'admin'))) {
    Auth::logout();
    $request->session()->invalidate();
    $request->session()->regenerateToken();
    $user = null;
}
```

## Core System Components

### 1. Film Management System

- **Models**: `Film` model with relationships to screenings and reservations
- **Admin Functions**:
    - CRUD operations with validation
    - OMDB API integration for importing film details
    - Poster image management with local/remote storage options
    - Featured film designation for homepage promotion
- **Public Features**:
    - Film browsing with search and filtering
    - Detailed film information with upcoming screenings
    - Responsive grid layout with animation effects

### 2. Screening Management

- **Models**: `Screening` and `Seat` for managing theater sessions
- **Key Features**:
    - Configurable room layouts with different seating arrangements
    - Automatic seat generation for new screenings
    - Screening time validation to prevent overlaps
    - Status management (active/inactive)
    - Price configuration per screening

### 3. Reservation System

- **Models**: `Reservation`, `ReservationSeat`, and `Payment`
- **Reservation Flow**:

    1. **Seat Selection**: Interactive seat map with real-time availability
    2. **Temporary Reservation**: Seats are temporarily held during checkout
    3. **Customer Details**: Capture of guest information or use of account data
    4. **Payment Processing**: Integration with payment gateways
    5. **Confirmation**: Reservation confirmation with email delivery
    6. **Ticket Generation**: PDF ticket with QR code for validation

- **Data Structure**:

```php
// Reservation model with relationships
class Reservation extends Model
{
    protected $fillable = [
        'screening_id',
        'user_id',
        'guest_name',
        'guest_email',
        'guest_phone',
        'status',
        'reservation_code',
        'confirmation_code',
    ];

    // Auto-generate unique codes on creation
    protected static function booted(): void
    {
        static::creating(function ($reservation) {
            $reservation->reservation_code = Str::random(10);
            $reservation->confirmation_code = 'CONF-' . strtoupper(Str::random(8));
        });
    }

    // Relationships
    public function screening(): BelongsTo
    {
        return $this->belongsTo(Screening::class);
    }

    public function reservationSeats(): HasMany
    {
        return $this->hasMany(ReservationSeat::class);
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }
}
```

### 4. Payment Processing

- **Payment Flow**:

    - Seamless integration with popular payment gateways
    - Secure transaction handling
    - Webhook support for asynchronous confirmations
    - Receipt generation

- **Status Tracking**:
    - Pending
    - Processing
    - Completed
    - Failed
    - Refunded

### 5. Email Notification System

- **Notification Types**:

    - Ticket confirmation with attached PDF
    - Reservation reminders
    - Account verification
    - Payment receipts

- **Implementation**:
    - Laravel Notification system
    - SMTP configuration with Gmail for reliable delivery
    - HTML templates with inline styling for email clients

## Frontend Organization

### Component Architecture

The React frontend employs a hierarchical component structure:

- **Layout Components**: Define the overall page structure

    - `AdminLayout`: Admin dashboard with sidebar, header, and content area
    - `ClientLayout`: Public-facing layout with navigation, content, and footer

- **Page Components**: React components corresponding to routes

    - Film browsing and details pages
    - Reservation workflow pages (seat selection, payment, confirmation)
    - Admin dashboard and management interfaces

- **UI Components**: Reusable interface elements
    - `Button`, `Card`, `Modal`, `Pagination`, etc.
    - Form elements with validation integration
    - Data display components (tables, charts, statistics cards)

### TypeScript Integration

All components use TypeScript interfaces for type safety:

```tsx
// Film interface example
interface Film {
    id: number;
    title: string;
    description: string;
    duration: number;
    poster_image: string | null;
    genre: string;
    release_date: string;
    director: string;
    is_featured: boolean;
}

// Reservation interface example
interface Reservation {
    id: number;
    screening: {
        id: number;
        start_time: string;
        room: string;
        price: number;
        film: {
            id: number;
            title: string;
            poster_image: string;
            duration: number;
        };
    };
    reservationSeats: ReservationSeat[];
    total_price: number | string;
    user_id?: number;
    guest_name?: string;
    guest_email?: string;
    guest_phone?: string;
    status: 'pending' | 'confirmed' | 'cancelled';
}
```

### Animation and User Experience

The frontend uses Framer Motion for smooth transitions and animations:

```tsx
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

// Component implementation
return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {films.map((film) => (
            <motion.div key={film.id} variants={itemVariants}>
                <FilmCard film={film} />
            </motion.div>
        ))}
    </motion.div>
);
```

## Data Flow Patterns

### 1. Server to Client Data Flow

Data flows from Laravel to React through several mechanisms:

- **Initial Page Props**: Data passed from controller to page component

    ```php
    // Controller
    return Inertia::render('Client/Films/Index', [
        'films' => $films,
        'genres' => $genres,
        'filters' => $request->only(['search', 'genre']),
    ]);
    ```

- **Shared Data**: Global data available to all components via Inertia middleware

    ```php
    // HandleInertiaRequests middleware
    return [
        'auth' => [
            'user' => $user,
        ],
        'flash' => [
            'message' => session('message'),
        ],
    ];
    ```

- **API Endpoints**: Real-time data fetching for dynamic components
    ```php
    // API routes
    Route::get('/screenings/{screening}/seats', [SeatController::class, 'getSeats']);
    Route::post('/seats/reserve', [SeatController::class, 'reserveTemporarily']);
    ```

### 2. Client to Server Data Flow

Inertia provides multiple methods for sending data to the server:

- **Form Submissions**: Using Inertia's `useForm` hook

    ```tsx
    const { data, setData, errors, post, processing } = useForm({
        seat_ids: [],
        guest_name: '',
        guest_email: '',
        guest_phone: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(route('reservations.store', screening.id));
    }
    ```

- **AJAX Calls**: For real-time operations using API endpoints

    ```tsx
    // Temporary seat reservation
    const reserveSeat = async (seatId: number) => {
        try {
            const response = await axios.post('/api/seats/reserve', {
                seat_id: seatId,
                screening_id: screening.id,
            });
            // Handle success
        } catch (error) {
            // Handle error
        }
    };
    ```

- **Page Navigation**: Using Inertia's router

    ```tsx
    import { router } from '@inertiajs/react';

    const viewFilm = (filmId: number) => {
        router.visit(route('films.show', filmId));
    };
    ```

## Development Patterns

### 1. API Integration

CineVerse integrates with external services through dedicated service classes:

- **OMDB API**: For importing film details

    ```php
    // OmdbApiService class
    public function searchByTitle(string $title, int $page = 1): array
    {
        $apiKey = config('services.omdb.key');
        $response = Http::get('http://www.omdbapi.com/', [
            'apikey' => $apiKey,
            's' => $title,
            'page' => $page,
            'type' => 'movie',
        ]);

        if ($response->successful() && $response->json('Response') === 'True') {
            return [
                'success' => true,
                'data' => $response->json(),
            ];
        }

        return [
            'success' => false,
            'message' => $response->json('Error') ?? 'Unable to search films',
        ];
    }
    ```

- **Payment Processing**: For handling ticket purchases

    ```php
    // PaymentController processing
    public function processPayment(Request $request, Reservation $reservation)
    {
        $validated = $request->validate([
            'payment_method' => 'required|string|in:credit_card,paypal',
            'card_number' => 'required_if:payment_method,credit_card|string',
            'expiry_date' => 'required_if:payment_method,credit_card|string',
            'cvv' => 'required_if:payment_method,credit_card|string',
        ]);

        // Process payment through payment gateway
        $paymentResult = $this->paymentService->processPayment($validated, $reservation);

        if ($paymentResult['success']) {
            // Update reservation status
            $reservation->update(['status' => 'confirmed']);

            // Create payment record
            Payment::create([
                'reservation_id' => $reservation->id,
                'amount' => $reservation->reservationSeats->sum('price'),
                'payment_method' => $validated['payment_method'],
                'transaction_id' => $paymentResult['transaction_id'],
                'status' => 'completed',
            ]);

            // Send confirmation email
            $this->sendTicketConfirmation($reservation);

            return redirect()->route('reservations.confirmation', $reservation);
        }

        return back()->with('error', $paymentResult['message']);
    }
    ```

### 2. Email Notifications

The system sends transactional emails through Laravel's notification system:

```php
// TicketConfirmationNotification class
public function toMail($notifiable): MailMessage
{
    $ticketUrl = route('reservations.download-ticket', $this->reservation);

    return (new MailMessage)
        ->subject('Your CineVerse Ticket Confirmation')
        ->greeting('Hello ' . ($this->reservation->user ? $this->reservation->user->name : $this->reservation->guest_name) . '!')
        ->line('Thank you for your reservation at CineVerse.')
        ->line('Film: ' . $this->reservation->screening->film->title)
        ->line('Date: ' . $this->reservation->screening->start_time->format('l, F j, Y'))
        ->line('Time: ' . $this->reservation->screening->start_time->format('g:i A'))
        ->line('Seats: ' . $this->getSeatsString())
        ->line('Confirmation Code: ' . $this->reservation->confirmation_code)
        ->action('Download Ticket', $ticketUrl)
        ->line('Please show this ticket at the cinema entrance.')
        ->attachData(
            $this->generateTicketPdf(),
            'ticket.pdf',
            ['mime' => 'application/pdf']
        );
}
```

### 3. Advanced Reporting

Admin dashboards provide insights through comprehensive reporting:

- **Film Performance**: Popularity metrics, screening attendance, revenue generation
- **Revenue Reports**: Daily, weekly, monthly breakdowns with charts
- **Occupancy Statistics**: Seat utilization and capacity planning data
- **User Engagement**: Booking patterns and customer retention metrics

## Configuration

The application uses Laravel's configuration system with environment-specific settings in `.env`:

```
# Database Configuration
DB_CONNECTION=sqlite
DB_DATABASE=C:/Users/Formulapp/Desktop/new_db.sqlite

# Email Configuration
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your.email@gmail.com
MAIL_PASSWORD="your-app-password"
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="tickets@cineverse.com"
MAIL_FROM_NAME="CineVerse Tickets"

# External API Integration
OMDB_API_KEY=your-omdb-api-key

# Application Settings
APP_NAME=CineVerse
APP_ENV=local
APP_DEBUG=true
PHP_MAX_EXECUTION_TIME=120
```

## Deployment Considerations

For production deployment, several optimizations should be implemented:

1. **Database Configuration**:

    - Migrate from SQLite to MySQL/PostgreSQL for improved performance and concurrency
    - Implement proper indexing on frequently queried columns
    - Configure database connection pooling

2. **Email Delivery**:

    - Set up a transactional email service (Mailgun, SendGrid, etc.)
    - Configure proper SPF and DKIM records for improved deliverability
    - Implement email queue processing for better performance

3. **Security Enhancements**:

    - Configure proper SSL certificates for HTTPS
    - Implement rate limiting on login attempts and API endpoints
    - Set up proper firewall rules and security headers
    - Enable CSRF protection and XSS prevention

4. **Performance Optimization**:

    - Enable Laravel's route and configuration caching
    - Optimize asset compilation with Vite for production
    - Implement Redis for session and cache storage
    - Configure proper opcache settings for PHP

5. **Monitoring and Maintenance**:
    - Set up application monitoring and error tracking
    - Configure automated backups for the database
    - Implement a CI/CD pipeline for seamless deployments
    - Set up health checks and performance monitoring
