import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client for auth
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Create axios instance with base configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  timeout: 30000, // 30 seconds for streaming
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Inject auth token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      // Get current session from Supabase
      const { data: { session } } = await supabase.auth.getSession();

      // Inject Authorization header if token exists
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }

      // Log request in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
          params: config.params,
          data: config.data,
        });
      }
    } catch (error) {
      console.error('[API Client] Failed to get session:', error);
    }

    return config;
  },
  (error: AxiosError) => {
    console.error('[API Client] Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor: Handle errors and responses
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Response] ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[API Error]', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
      });
    }

    // Handle 401 Unauthorized: Clear session and redirect to login
    if (error.response?.status === 401) {
      console.warn('[API Client] Unauthorized - clearing session');
      await supabase.auth.signOut();

      // Only redirect if in browser environment
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }

      return Promise.reject(error);
    }

    // Handle 500 Server Error
    if (error.response?.status === 500) {
      console.error('[API Client] Server error:', error.response.data);
      // Note: Toast notifications should be handled by the calling code
      return Promise.reject(error);
    }

    // Handle network errors with retry (exponential backoff)
    if (
      error.code === 'ECONNABORTED' ||
      error.code === 'ERR_NETWORK' ||
      !error.response
    ) {
      const retryCount = (originalRequest._retry as any) || 0;
      const maxRetries = 3;

      if (retryCount < maxRetries) {
        originalRequest._retry = retryCount + 1;

        // Exponential backoff: 1s, 2s, 4s
        const delayMs = Math.pow(2, retryCount) * 1000;

        console.log(`[API Client] Retrying request (attempt ${retryCount + 1}/${maxRetries}) after ${delayMs}ms`);

        await new Promise(resolve => setTimeout(resolve, delayMs));

        return apiClient(originalRequest);
      }

      console.error('[API Client] Max retries reached');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
