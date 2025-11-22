/**
 * Loading Skeletons for Various Components
 * Provides shimmer effects during data fetching
 */

import React from 'react';

/**
 * Skeleton for session list items
 */
export function SessionListSkeleton() {
    return (
        <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
                <div
                    key={i}
                    className="animate-pulse bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                >
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            {/* Title skeleton */}
                            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                            {/* Last message skeleton */}
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                        </div>
                        {/* Timestamp skeleton */}
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 ml-4"></div>
                    </div>
                </div>
            ))}
        </div>
    );
}

/**
 * Skeleton for chat messages
 */
export function ChatMessageSkeleton() {
    return (
        <div className="space-y-4">
            {[1, 2, 3].map((i) => (
                <div
                    key={i}
                    className={`animate-pulse flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}
                >
                    <div
                        className={`max-w-[70%] rounded-lg p-4 ${i % 2 === 0
                                ? 'bg-blue-100 dark:bg-blue-900'
                                : 'bg-gray-100 dark:bg-gray-800'
                            }`}
                    >
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
                            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-4/5"></div>
                            {i === 1 && (
                                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/5"></div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

/**
 * Skeleton for patient cards
 */
export function PatientCardSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                    key={i}
                    className="animate-pulse bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
                >
                    {/* Avatar skeleton */}
                    <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                        <div className="ml-4 flex-1">
                            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                        </div>
                    </div>
                    {/* Details skeleton */}
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                    </div>
                </div>
            ))}
        </div>
    );
}

/**
 * Generic loading spinner
 */
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
    };

    return (
        <div className="flex items-center justify-center">
            <div
                className={`${sizeClasses[size]} border-4 border-gray-200 dark:border-gray-700 border-t-blue-600 rounded-full animate-spin`}
            ></div>
        </div>
    );
}

/**
 * Full page loading state
 */
export function PageLoading({ message = 'Loading...' }: { message?: string }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">{message}</p>
        </div>
    );
}

/**
 * Typing indicator for chat
 */
export function TypingIndicator() {
    return (
        <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-4 max-w-[100px]">
            <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce"></div>
                <div
                    className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce"
                    style={{ animationDelay: '0.1s' }}
                ></div>
                <div
                    className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                ></div>
            </div>
        </div>
    );
}
