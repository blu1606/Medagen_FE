import { AxiosError } from 'axios';

/**
 * Base service error class
 */
export class ServiceError extends Error {
    code: string;
    statusCode?: number;
    details?: any;

    constructor(message: string, code: string, statusCode?: number, details?: any) {
        super(message);
        this.name = 'ServiceError';
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ServiceError);
        }
    }
}

/**
 * 404 Not Found errors
 */
export class NotFoundError extends ServiceError {
    constructor(message: string = 'Resource not found', details?: any) {
        super(message, 'NOT_FOUND', 404, details);
        this.name = 'NotFoundError';
    }
}

/**
 * 400 Bad Request / Validation errors
 */
export class ValidationError extends ServiceError {
    constructor(message: string = 'Validation failed', details?: any) {
        super(message, 'VALIDATION_ERROR', 400, details);
        this.name = 'ValidationError';
    }
}

/**
 * 401 Unauthorized errors
 */
export class UnauthorizedError extends ServiceError {
    constructor(message: string = 'Unauthorized', details?: any) {
        super(message, 'UNAUTHORIZED', 401, details);
        this.name = 'UnauthorizedError';
    }
}

/**
 * 500 Server errors
 */
export class ServerError extends ServiceError {
    constructor(message: string = 'Internal server error', details?: any) {
        super(message, 'SERVER_ERROR', 500, details);
        this.name = 'ServerError';
    }
}

/**
 * Network/Connection errors
 */
export class NetworkError extends ServiceError {
    constructor(message: string = 'Network error', details?: any) {
        super(message, 'NETWORK_ERROR', undefined, details);
        this.name = 'NetworkError';
    }
}

/**
 * Transform Axios error to ServiceError
 * Maps HTTP status codes to appropriate error types
 */
export function transformApiError(error: AxiosError): ServiceError {
    // Extract error details from response
    const responseData = error.response?.data as any;
    const status = error.response?.status;

    // Build error message
    const message =
        responseData?.error?.message ||
        responseData?.message ||
        responseData?.detail ||
        error.message ||
        'An unexpected error occurred';

    // Build details object
    const details = {
        url: error.config?.url,
        method: error.config?.method,
        status,
        responseData,
        originalError: error.message,
    };

    // Map status codes to error types
    if (!error.response) {
        // Network error (no response)
        return new NetworkError(
            'Unable to connect to server. Please check your internet connection.',
            details
        );
    }

    switch (status) {
        case 400:
            return new ValidationError(message, details);

        case 401:
            return new UnauthorizedError(message, details);

        case 404:
            return new NotFoundError(message, details);

        case 500:
        case 502:
        case 503:
        case 504:
            return new ServerError(message, details);

        default:
            return new ServiceError(
                message,
                `HTTP_${status}`,
                status,
                details
            );
    }
}

/**
 * Type guard to check if error is a ServiceError
 */
export function isServiceError(error: any): error is ServiceError {
    return error instanceof ServiceError;
}

/**
 * Type guard to check if error is a specific ServiceError type
 */
export function isNotFoundError(error: any): error is NotFoundError {
    return error instanceof NotFoundError;
}

export function isValidationError(error: any): error is ValidationError {
    return error instanceof ValidationError;
}

export function isUnauthorizedError(error: any): error is UnauthorizedError {
    return error instanceof UnauthorizedError;
}

export function isServerError(error: any): error is ServerError {
    return error instanceof ServerError;
}

export function isNetworkError(error: any): error is NetworkError {
    return error instanceof NetworkError;
}
