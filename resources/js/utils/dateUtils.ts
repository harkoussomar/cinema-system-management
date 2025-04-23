/**
 * Date and time utility functions
 */

/**
 * Format a date string to a friendly format (e.g., "Monday, January 1, 2023")
 * @param dateString ISO date string
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

/**
 * Format a date string to a short format (e.g., "Mon, Jan 1, 2023")
 * @param dateString ISO date string
 * @returns Formatted short date string
 */
export const formatShortDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

/**
 * Format a time string to 12-hour format (e.g., "2:30 PM")
 * @param timeString ISO date string
 * @returns Formatted time string
 */
export const formatTime = (timeString: string): string => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });
};

/**
 * Format a date-time string for datetime-local input
 * @param dateString ISO date string
 * @returns Formatted date-time string in the format "YYYY-MM-DDThh:mm"
 */
export const formatDateTimeLocal = (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Format currency amount (e.g., "$20.00")
 * @param amount Number to format as currency
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number | null | undefined): string => {
    // Make sure we have a valid number
    if (amount === null || amount === undefined || isNaN(amount)) {
        return '$0.00';
    }
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
};

// Format release date for display
export const formatReleaseDate = (dateString: string) => {
    try {
        const year = dateString.split('-')[0];
        return year;
    } catch {
        return 'Coming Soon';
    }
};
