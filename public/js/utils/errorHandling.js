// Error handling and reporting utilities
export class AppError extends Error {
    constructor(message, code, context = {}) {
        super(message);
        this.name = 'AppError';
        this.code = code;
        this.context = context;
        this.timestamp = new Date().toISOString();
    }
}

export function handleError(error, context = '') {
    console.error(`[${context}]:`, error);
    
    // Show user-friendly error message
    const message = getUserFriendlyMessage(error);
    showToast(message, 'error');
    
    // Log error for analytics
    logError(error, context);
}

function getUserFriendlyMessage(error) {
    if (error instanceof AppError) {
        return error.message;
    }
    
    // Map common errors to user-friendly messages
    const errorMap = {
        'permission-denied': 'You don\'t have permission to perform this action.',
        'not-found': 'The requested item could not be found.',
        'network-error': 'Please check your internet connection and try again.',
        'invalid-argument': 'There was an issue with the provided information.',
        'default': 'Something went wrong. Please try again later.'
    };
    
    return errorMap[error.code] || errorMap.default;
}

function logError(error, context) {
    // In a production environment, this would send the error to your analytics service
    const errorLog = {
        message: error.message,
        code: error.code,
        context: error.context || {},
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        location: window.location.href
    };
    
    // For now, just log to console
    console.warn('Error logged:', errorLog);
}
