/**
 * Supabase Utility Functions
 * Helper functions for Supabase operations
 */

import { createSupabaseClient } from './supabase';

/**
 * Safe Supabase query wrapper with error handling
 */
export async function safeSupabaseQuery<T>(
  query: Promise<{ data: T | null; error: any }> | any
): Promise<T | null> {
  try {
    // If query is a query builder, it will have a then method but we need to await it
    const { data, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      throw new Error(error.message || 'Database error');
    }

    return data;
  } catch (error) {
    console.error('Query failed:', error);
    throw error;
  }
}

/**
 * Get current authenticated user ID
 */
export async function getCurrentUserId(): Promise<string | null> {
  const supabase = createSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id || null;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const userId = await getCurrentUserId();
  return userId !== null;
}

/**
 * Get current user session
 */
export async function getCurrentSession() {
  const supabase = createSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

/**
 * Get access token for API requests
 */
export async function getAccessToken(): Promise<string | null> {
  const session = await getCurrentSession();
  return session?.access_token || null;
}

/**
 * Handle Supabase real-time channel errors
 */
export function handleChannelError(error: any) {
  console.error('Supabase channel error:', error);
  // TODO: Add error reporting (Sentry, etc.)
}

/**
 * Format Supabase timestamp to readable date
 */
export function formatSupabaseDate(timestamp: string | null): string {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Retry Supabase operation with exponential backoff
 */
export async function retrySupabaseOperation<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: any;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        const delay = delayMs * Math.pow(2, i);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}
