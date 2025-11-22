'use client';

import React, { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

/**
 * Error Boundary Component
 * Catches React errors and displays a fallback UI
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
        };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log error to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('ErrorBoundary caught an error:', error, errorInfo);
        }

        // Call custom error handler if provided
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }

        // In production, you could log to Sentry or other error tracking service
        // Example: Sentry.captureException(error);
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
        });
    };

    render() {
        if (this.state.hasError) {
            // Use custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default fallback UI
            return (
                <ErrorDisplay
                    error={this.state.error}
                    onReset={this.handleReset}
                />
            );
        }

        return this.props.children;
    }
}

/**
 * Default Error Display Component
 */
interface ErrorDisplayProps {
    error: Error | null;
    onReset: () => void;
}

function ErrorDisplay({ error, onReset }: ErrorDisplayProps) {
    return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                <div className="flex items-start">
                    {/* Error Icon */}
                    <div className="flex-shrink-0">
                        <svg
                            className="h-6 w-6 text-red-600 dark:text-red-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>

                    {/* Error Content */}
                    <div className="ml-3 flex-1">
                        <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                            Something went wrong
                        </h3>
                        <div className="mt-2 text-sm text-red-700 dark:text-red-400">
                            <p>
                                {error?.message || 'An unexpected error occurred'}
                            </p>
                        </div>

                        {/* Error Details in Development */}
                        {process.env.NODE_ENV === 'development' && error?.stack && (
                            <details className="mt-4">
                                <summary className="text-xs text-red-600 dark:text-red-400 cursor-pointer hover:underline">
                                    View error details
                                </summary>
                                <pre className="mt-2 text-xs text-red-600 dark:text-red-400 overflow-auto max-h-40 bg-red-100 dark:bg-red-900/30 p-2 rounded">
                                    {error.stack}
                                </pre>
                            </details>
                        )}

                        {/* Retry Button */}
                        <div className="mt-4">
                            <button
                                onClick={onReset}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                            >
                                Try again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Custom Error Display for API Errors
 */
export function ApiErrorDisplay({
    message,
    onRetry,
}: {
    message: string;
    onRetry?: () => void;
}) {
    return (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex">
                <div className="flex-shrink-0">
                    <svg
                        className="h-5 w-5 text-yellow-600 dark:text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                        />
                    </svg>
                </div>
                <div className="ml-3 flex-1">
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        {message}
                    </p>
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className="mt-2 text-sm font-medium text-yellow-800 dark:text-yellow-200 hover:underline"
                        >
                            Retry
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ErrorBoundary;
