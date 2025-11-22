/**
 * API Endpoints
 *
 * Centralized definition of all backend API endpoints.
 * Backend Base URL: https://medagen-backend.hf.space
 * Use typed functions for dynamic routes to ensure type safety.
 */

export const ENDPOINTS = {
  // Triage / Session Management (Main endpoint)
  SESSIONS: {
    CREATE: '/api/health-check', // POST - Main triage endpoint
    GET: (id: string) => `/api/sessions/${id}`, // GET - Get session by ID
    LIST: '/api/sessions', // Not available in backend
    UPDATE: (id: string) => `/api/sessions/${id}`, // Not available in backend
    DELETE: (id: string) => `/api/sessions/${id}`, // Not available in backend
  },

  // Conversation & Messages
  CONVERSATIONS: {
    MESSAGES: (sessionId: string) => `/api/conversations/${sessionId}`, // GET - Get conversation history
    SEND: (sessionId: string) => `/api/health-check`, // POST - Send message via health-check
    STREAM: (sessionId: string) => `/api/sessions/${sessionId}/stream`, // Not available - use WebSocket instead
    DELETE_MESSAGE: (sessionId: string, messageId: string) =>
      `/api/conversations/${sessionId}/messages/${messageId}`, // Not available in backend
    USER_SESSIONS: (userId: string) => `/api/conversations/user/${userId}`, // GET - Get user sessions
  },

  // Computer Vision Endpoints
  CV: {
    DERM: '/api/cv/derm', // POST - Dermatology CV analysis
    EYE: '/api/cv/eye', // POST - Eye CV analysis
    WOUND: '/api/cv/wound', // POST - Wound CV analysis
  },

  // RAG (Retrieval-Augmented Generation)
  RAG: {
    SEARCH: '/api/rag/search', // POST - Search medical guidelines
  },

  // Triage Rules
  TRIAGE: {
    RULES: '/api/triage/rules', // POST - Evaluate triage rules
  },

  // Maps Service
  MAPS: {
    CLINIC: '/api/maps/clinic', // GET - Find nearest clinic
  },

  // AI Agent Management (Not available in current backend)
  AGENTS: {
    STATUS: (sessionId: string) => `/api/sessions/${sessionId}/agent/status`, // Not available
    SPAWN: (sessionId: string) => `/api/sessions/${sessionId}/agent/spawn`, // Not available
    INTERRUPT: (sessionId: string) => `/api/sessions/${sessionId}/agent/interrupt`, // Not available
    LOGS: (sessionId: string) => `/api/sessions/${sessionId}/agent/logs`, // Not available
  },

  // Patient Management (Not available in current backend)
  PATIENTS: {
    CREATE: '/api/patients', // Not available
    GET: (id: string) => `/api/patients/${id}`, // Not available
    LIST: '/api/patients', // Not available
    SEARCH: '/api/patients/search', // Not available
    UPDATE: (id: string) => `/api/patients/${id}`, // Not available
    DELETE: (id: string) => `/api/patients/${id}`, // Not available
  },

  // Health Check
  HEALTH: '/health', // GET - Health check endpoint
} as const;

// Type helper for endpoint functions
export type Endpoint = string | ((id: string) => string);
