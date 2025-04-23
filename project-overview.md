# Cinema System Management - Project Overview

## Introduction

This document provides a high-level overview of the Cinema System Management application, a full-stack web application built using React/TypeScript, Inertia.js, and Laravel/PHP. The system allows users to browse films, make reservations, select seats, and process payments, while providing administrators with tools to manage screenings, films, and view reports.

## Technology Stack

### Backend

- **Laravel 12**: PHP framework that provides the foundation for the application
- **PHP 8.2+**: Modern PHP language features
- **MySQL/PostgreSQL**: Database for storing application data
- **Laravel Sanctum**: Authentication system for web and API
- **Inertia.js Server Adapter**: Bridge between Laravel backend and React frontend

### Frontend

- **React 19**: UI library for building interactive user interfaces
- **TypeScript**: Type-safe JavaScript for improved developer experience
- **Inertia.js**: Library that allows building single-page applications without building an API
- **Tailwind CSS 4**: Utility-first CSS framework for styling
- **Radix UI**: Headless component library for accessible UI components
- **Headless UI**: Unstyled, fully accessible UI components

## Project Architecture Overview

### How the Technologies Work Together

1. **Laravel (Backend)**

    - Handles business logic, database operations, and authentication
    - Defines routes, controllers, models, and middleware
    - Processes form submissions and data validation
    - Renders initial HTML response with data

2. **Inertia.js (Bridge)**

    - Connects Laravel and React without requiring a traditional API
    - Serializes server-side data and passes it to the frontend
    - Handles client-side routing while preserving server-side routing
    - Manages page transitions and form submissions

3. **React/TypeScript (Frontend)**
    - Receives data from the backend via Inertia.js
    - Renders UI components and manages local state
    - Handles user interactions and form validations
    - Provides type safety through TypeScript

## Basic Project Structure

```
├── app/                    # PHP backend code
│   ├── Http/               # HTTP layer (controllers, middleware, etc.)
│   ├── Models/             # Database models
│   ├── Providers/          # Service providers
│   └── Services/           # Business logic and services
├── resources/              # Frontend resources
│   ├── js/                 # JavaScript/TypeScript code
│   │   ├── components/     # Reusable React components
│   │   ├── layouts/        # Page layouts
│   │   ├── pages/          # Page components (Client, Admin)
│   │   └── app.tsx         # Main application entry point
│   └── css/                # CSS styles
├── routes/                 # Route definitions
│   ├── web.php             # Web routes
│   ├── api.php             # API routes
│   └── auth.php            # Authentication routes
└── database/               # Database migrations and seeds
```

## Data Flow

1. **User Request**:

    - User navigates to a URL or submits a form
    - Browser sends request to the Laravel application

2. **Backend Processing**:

    - Laravel routes the request to the appropriate controller
    - Controller processes the request, interacts with models/database
    - Controller prepares data to pass to the frontend

3. **Inertia Bridge**:

    - Laravel passes data to Inertia.js adapter
    - Inertia serializes data and embeds it in the initial HTML response
    - On subsequent requests, Inertia returns just the data as JSON

4. **Frontend Rendering**:

    - React receives the data via Inertia.js
    - React components render based on the received data
    - TypeScript ensures type safety during development

5. **User Interaction**:
    - User interacts with the React components
    - Inertia.js intercepts link clicks and form submissions
    - Sends AJAX requests to the server
    - Receives new data and updates the React components without a full page reload

## Authentication Flow

The application uses Laravel Sanctum for authentication, with separate flows for:

- Regular clients: Register, login, reset password
- Admin users: Login only (no self-registration)

Authentication state is maintained across the application and passed from Laravel to React via Inertia.js props.

## Key Features

1. **Client Features**:

    - Film browsing and search
    - Seat selection and reservation
    - Payment processing
    - Reservation history

2. **Admin Features**:
    - Film and screening management
    - User management
    - Revenue reporting
    - System configuration

This architecture creates a seamless single-page application experience while leveraging the robust backend capabilities of Laravel and the interactive UI capabilities of React.
