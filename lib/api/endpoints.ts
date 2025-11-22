/**
 * API Endpoints
 *
 * Centralized definition of all backend API endpoints.
 * Use typed functions for dynamic routes to ensure type safety.
 */

export const ENDPOINTS = {
  // Triage / Session Management (Backend uses health-check endpoint)
  SESSIONS: {
    CREATE: '/api/health-check', // Backend endpoint for triage/session creation
    GET: (id: string) => `/api/sessions/${id}`,
    LIST: '/api/sessions',
    UPDATE: (id: string) => `/api/sessions/${id}`,
    DELETE: (id: string) => `/api/sessions/${id}`,
  },

  // Patient Management
  PATIENTS: {
    CREATE: '/api/patients',
    GET: (id: string) => `/api/patients/${id}`,
    LIST: '/api/patients',
    SEARCH: '/api/patients/search',
    UPDATE: (id: string) => `/api/patients/${id}`,
    DELETE: (id: string) => `/api/patients/${id}`,
  },

  // Conversation & Messages
  CONVERSATIONS: {
    MESSAGES: (sessionId: string) => `/api/sessions/${sessionId}/messages`,
    SEND: (sessionId: string) => `/api/sessions/${sessionId}/send`,
    STREAM: (sessionId: string) => `/api/sessions/${sessionId}/stream`,
    DELETE_MESSAGE: (sessionId: string, messageId: string) =>
      `/api/sessions/${sessionId}/messages/${messageId}`,
  },

  // AI Agent Management
  AGENTS: {
    STATUS: (sessionId: string) => `/api/sessions/${sessionId}/agent/status`,
    SPAWN: (sessionId: string) => `/api/sessions/${sessionId}/agent/spawn`,
    INTERRUPT: (sessionId: string) => `/api/sessions/${sessionId}/agent/interrupt`,
    LOGS: (sessionId: string) => `/api/sessions/${sessionId}/agent/logs`,
  },

  // Health Check
  HEALTH: '/health',
} as const;

// Type helper for endpoint functions
export type Endpoint = string | ((id: string) => string);
