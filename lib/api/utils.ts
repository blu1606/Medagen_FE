import { AxiosError } from 'axios';
import { ApiError } from './types';

/**
 * Build query string from params object
 * @param params - Object with key-value pairs
 * @returns Query string (e.g., "?key1=value1&key2=value2")
 */
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, String(item)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Handle API error and transform to ApiError type
 * @param error - Axios error
 * @returns Structured API error
 */
export function handleApiError(error: AxiosError): ApiError {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;

    // Extract error message from response
    const errorData = data as any;
    const message =
      errorData?.error?.message ||
      errorData?.message ||
      errorData?.detail ||
      error.message ||
      'An unknown error occurred';

    return {
      code: errorData?.error?.code || `HTTP_${status}`,
      message,
      details: errorData?.error?.details || errorData,
      statusCode: status,
    };
  } else if (error.request) {
    // Request made but no response received
    return {
      code: 'NETWORK_ERROR',
      message: 'No response from server. Please check your internet connection.',
      details: { originalError: error.message },
    };
  } else {
    // Error in request setup
    return {
      code: 'REQUEST_ERROR',
      message: error.message || 'Failed to make request',
      details: { originalError: error.message },
    };
  }
}

/**
 * Retry a request with exponential backoff
 * @param fn - Function that returns a promise
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @returns Promise resolving to function result
 */
export async function retryRequest<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Don't retry on client errors (4xx)
      if (error instanceof AxiosError && error.response?.status && error.response.status < 500) {
        throw error;
      }

      // Exponential backoff: 1s, 2s, 4s
      const delayMs = Math.pow(2, attempt) * 1000;

      console.log(`[retryRequest] Attempt ${attempt + 1} failed, retrying in ${delayMs}ms...`);

      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
}

/**
 * Check if error is a network error
 * @param error - Any error object
 * @returns True if network error
 */
export function isNetworkError(error: any): boolean {
  if (error instanceof AxiosError) {
    return (
      error.code === 'ECONNABORTED' ||
      error.code === 'ERR_NETWORK' ||
      error.code === 'ETIMEDOUT' ||
      !error.response
    );
  }
  return false;
}

/**
 * Check if error is an authentication error
 * @param error - Any error object
 * @returns True if 401 Unauthorized
 */
export function isAuthError(error: any): boolean {
  if (error instanceof AxiosError) {
    return error.response?.status === 401;
  }
  return false;
}

/**
 * Check if error is a server error
 * @param error - Any error object
 * @returns True if 5xx error
 */
export function isServerError(error: any): boolean {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    return status ? status >= 500 && status < 600 : false;
  }
  return false;
}

/**
 * Format error message for user display
 * @param error - Any error object
 * @returns User-friendly error message
 */
export function formatErrorMessage(error: any): string {
  if (error instanceof AxiosError) {
    const apiError = handleApiError(error);
    return apiError.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}
