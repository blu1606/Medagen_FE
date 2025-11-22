# Phase 1: API Client Setup

## 🎯 Goal
Configure a centralized HTTP client for communicating with the FastAPI backend, including authentication, error handling, and type safety.

## 📋 Prerequisites
- Backend API running at `http://localhost:8000` (or env-configured URL)
- Supabase authentication configured in frontend
- Environment variables set: `NEXT_PUBLIC_API_URL`

## 🛠️ Implementation Steps

### 1. Install Dependencies
**Action**: Add HTTP client library
**Command**:
```bash
pnpm add axios
pnpm add -D @types/axios
```
**Validation**: Check `package.json` for axios entry

### 2. Create API Client Configuration
**Action**: Set up axios instance with interceptors
**File**: `lib/api/client.ts`
**Instructions for AI**:
```typescript
// Create axios instance with:
// - baseURL from env variable (NEXT_PUBLIC_API_URL)
// - timeout: 30000ms (30 seconds for streaming)
// - headers: { 'Content-Type': 'application/json' }

// Add request interceptor:
// - Get Supabase session token
// - Inject Authorization header if token exists
// - Log request for debugging (dev only)

// Add response interceptor:
// - Handle 401: Clear session, redirect to /login
// - Handle 500: Show error toast, log to console
// - Handle network errors: Retry with exponential backoff (max 3 retries)
// - Return response.data for successful requests
```

### 3. Define Backend Endpoints
**Action**: Create typed endpoint constants
**File**: `lib/api/endpoints.ts`
**Instructions for AI**:
```typescript
// Export const ENDPOINTS = {
//   SESSIONS: {
//     CREATE: '/api/sessions',
//     GET: (id: string) => `/api/sessions/${id}`,
//     LIST: '/api/sessions',
//     UPDATE: (id: string) => `/api/sessions/${id}`,
//     DELETE: (id: string) => `/api/sessions/${id}`,
//   },
//   PATIENTS: {
//     CREATE: '/api/patients',
//     GET: (id: string) => `/api/patients/${id}`,
//     LIST: '/api/patients',
//     SEARCH: '/api/patients/search',
//   },
//   CONVERSATIONS: {
//     MESSAGES: (sessionId: string) => `/api/sessions/${sessionId}/messages`,
//     SEND: (sessionId: string) => `/api/sessions/${sessionId}/send`,
//     STREAM: (sessionId: string) => `/api/sessions/${sessionId}/stream`,
//   },
//   AGENTS: {
//     STATUS: (sessionId: string) => `/api/sessions/${sessionId}/agent/status`,
//     SPAWN: (sessionId: string) => `/api/sessions/${sessionId}/agent/spawn`,
//   }
// }
```

### 4. Define TypeScript Types
**Action**: Create API request/response types matching backend schemas
**File**: `lib/api/types.ts`
**Instructions for AI**:
```typescript
// Mirror backend Pydantic models:
// - PatientCreate, PatientResponse
// - SessionCreate, SessionResponse
// - MessageCreate, MessageResponse
// - AgentStatus enum
// - ApiError type

// Example:
// export interface SessionCreate {
//   patient_id?: string;
//   patient_data?: {
//     name: string;
//     age: number;
//     chiefComplaint: string;
//     bodyParts?: string[];
//     painLevel?: number;
//     duration?: string;
//     triageLevel?: 'emergency' | 'urgent' | 'routine';
//   };
// }
```

### 5. Create Utility Functions
**Action**: Helper functions for common patterns
**File**: `lib/api/utils.ts`
**Instructions for AI**:
```typescript
// - buildQueryString(params: Record<string, any>): string
// - handleApiError(error: AxiosError): ApiError
// - retryRequest(fn: () => Promise<any>, maxRetries: number): Promise<any>
// - isNetworkError(error: any): boolean
```

## 🔍 Success Criteria
- [ ] Axios client exports a configured instance
- [ ] Request interceptor injects Supabase token
- [ ] Response interceptor handles 401 by redirecting
- [ ] All backend endpoints defined as typed constants
- [ ] TypeScript types match backend schemas (verify with backend API docs)
- [ ] Error handling logs to console in dev mode
- [ ] No TypeScript errors in `lib/api/` folder

## 🧪 Testing Commands
```bash
# Type check
pnpm tsc --noEmit

# Test API client in isolation (create test file)
pnpm tsx lib/api/__tests__/client.test.ts
```

## 📝 Example Usage
```typescript
import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { SessionCreate, SessionResponse } from '@/lib/api/types';

async function createSession(data: SessionCreate): Promise<SessionResponse> {
  const response = await apiClient.post<SessionResponse>(
    ENDPOINTS.SESSIONS.CREATE,
    data
  );
  return response.data;
}
```

## 🚀 Next Phase
Proceed to [Phase 2: State Management](./02_STATE_MANAGEMENT.md) once API client is functional.
