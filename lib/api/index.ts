/**
 * API Module
 *
 * Centralized exports for all API-related functionality
 */

// Export API client
export { default as apiClient } from './client';

// Export endpoints
export { ENDPOINTS } from './endpoints';
export type { Endpoint } from './endpoints';

// Export types
export type {
  // Patient types
  PatientData,
  PatientCreate,
  PatientResponse,
  PatientUpdate,

  // Session types
  SessionCreate,
  SessionResponse,
  SessionUpdate,

  // Message types
  MessageRole,
  MessageCreate,
  MessageResponse,

  // Agent types
  AgentStatus,
  AgentStatusResponse,
  AgentConfig,
  AgentLog,

  // Error types
  ApiError,
  ApiErrorResponse,

  // List/Pagination types
  ListParams,
  PaginatedResponse,

  // Search types
  SearchParams,

  // Streaming types
  StreamChunk,
  StreamEvent,
} from './types';

// Export utilities
export {
  buildQueryString,
  handleApiError,
  retryRequest,
  isNetworkError,
  isAuthError,
  isServerError,
  formatErrorMessage,
} from './utils';
