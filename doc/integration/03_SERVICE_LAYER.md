# Phase 3: Service Layer Implementation

## 🎯 Goal
Create clean, type-safe service modules that encapsulate all backend API calls. Services are consumed by Zustand stores and components.

## 📋 Prerequisites
- Phase 1 completed (API client ready)
- Phase 2 completed (Stores defined)
- Backend API documentation reviewed

## 🛠️ Implementation Steps

### 1. Session Service
**Action**: CRUD operations for conversation sessions
**File**: `lib/services/session.service.ts`
**Instructions for AI**:
```typescript
// Import: apiClient, ENDPOINTS, types

// Export class or object with methods:
//
// create(data: SessionCreate): Promise<SessionResponse>
//   POST /api/sessions
//   Returns: session object with id, agent_status, created_at
//
// getById(id: string): Promise<SessionResponse>
//   GET /api/sessions/{id}
//   Throws: 404 if not found
//
// list(params?: { limit?: number, offset?: number }): Promise<SessionResponse[]>
//   GET /api/sessions?limit=X&offset=Y
//   Returns: array of sessions
//
// update(id: string, updates: Partial<SessionUpdate>): Promise<SessionResponse>
//   PUT /api/sessions/{id}
//   Updates session metadata (not messages)
//
// delete(id: string): Promise<void>
//   DELETE /api/sessions/{id}
//   Returns: void on success
//
// getAgentStatus(id: string): Promise<AgentStatusResponse>
//   GET /api/sessions/{id}/agent/status
//   Returns: { status: 'idle' | 'running' | 'completed', ... }
```

### 2. Patient Service
**Action**: Patient data management
**File**: `lib/services/patient.service.ts`
**Instructions for AI**:
```typescript
// Export methods:
//
// create(data: PatientCreate): Promise<PatientResponse>
//   POST /api/patients
//   Validates: age > 0, name not empty
//
// getById(id: string): Promise<PatientResponse>
//   GET /api/patients/{id}
//
// list(params?: ListParams): Promise<PatientResponse[]>
//   GET /api/patients
//   Supports: pagination, sorting
//
// search(query: string): Promise<PatientResponse[]>
//   GET /api/patients/search?q={query}
//   Debounced search by name, ID
//
// update(id: string, data: PatientUpdate): Promise<PatientResponse>
//   PUT /api/patients/{id}
//
// delete(id: string): Promise<void>
//   DELETE /api/patients/{id}
```

### 3. Conversation Service
**Action**: Message sending and streaming
**File**: `lib/services/conversation.service.ts`
**Instructions for AI**:
```typescript
// Export methods:
//
// getMessages(sessionId: string): Promise<Message[]>
//   GET /api/sessions/{sessionId}/messages
//   Returns: chronological message array
//
// sendMessage(sessionId: string, content: string): Promise<MessageResponse>
//   POST /api/sessions/{sessionId}/send
//   Body: { role: 'user', content }
//   Returns: user message + AI response (or stream token)
//
// streamResponse(
//   sessionId: string,
//   onChunk: (chunk: string) => void,
//   onComplete: () => void,
//   onError: (err: Error) => void
// ): AbortController
//   Connects to SSE endpoint: /api/sessions/{sessionId}/stream
//   Calls onChunk for each text delta
//   Calls onComplete when stream ends
//   Returns AbortController to allow cancellation
//
// deleteMessage(sessionId: string, messageId: string): Promise<void>
//   DELETE /api/sessions/{sessionId}/messages/{messageId}
```

### 4. Agent Service
**Action**: AI agent management
**File**: `lib/services/agent.service.ts`
**Instructions for AI**:
```typescript
// Export methods:
//
// getStatus(sessionId: string): Promise<AgentStatusResponse>
//   GET /api/sessions/{sessionId}/agent/status
//   Returns: { status, current_phase, progress }
//
// spawn(sessionId: string, config?: AgentConfig): Promise<void>
//   POST /api/sessions/{sessionId}/agent/spawn
//   Starts AI agent for session
//
// interrupt(sessionId: string): Promise<void>
//   POST /api/sessions/{sessionId}/agent/interrupt
//   Pauses agent execution
//
// getLogs(sessionId: string): Promise<AgentLog[]>
//   GET /api/sessions/{sessionId}/agent/logs
//   Returns: agent execution logs for debugging
```

### 5. Service Error Handling
**Action**: Unified error transformation
**File**: `lib/services/errors.ts`
**Instructions for AI**:
```typescript
// Define custom error classes:
//
// class ServiceError extends Error {
//   code: string;
//   statusCode: number;
//   details?: any;
// }
//
// class NotFoundError extends ServiceError { }
// class ValidationError extends ServiceError { }
// class UnauthorizedError extends ServiceError { }
// class ServerError extends ServiceError { }
//
// Export function:
// transformApiError(error: AxiosError): ServiceError {
//   // Map HTTP status codes to custom error types
//   // Extract error message from response body
//   // Add request context for debugging
// }
```

### 6. Service Testing Utilities
**Action**: Mock service for testing
**File**: `lib/services/__mocks__/index.ts`
**Instructions for AI**:
```typescript
// Export mock implementations of all services:
// - sessionService.mock.ts
// - patientService.mock.ts
// - conversationService.mock.ts
//
// Use for:
// - Unit tests (isolate component logic)
// - Storybook stories
// - Dev mode without backend
//
// Example:
// export const mockSessionService = {
//   create: vi.fn().mockResolvedValue({ id: 'mock-123', ... }),
//   getById: vi.fn().mockResolvedValue({ ... }),
//   ...
// };
```

## 🔍 Success Criteria
- [ ] All backend endpoints have corresponding service methods
- [ ] Services return properly typed responses
- [ ] Error handling transforms axios errors to ServiceError
- [ ] Streaming conversation service works with SSE
- [ ] AbortController allows cancelling requests
- [ ] Mock services available for testing
- [ ] JSDoc comments on all service methods
- [ ] No any types in service layer

## 🧪 Testing Commands
```bash
# Type check
pnpm tsc --noEmit

# Run service tests
pnpm vitest run lib/services

# Test with backend (integration test)
pnpm test:integration
```

## 📝 Example Usage
```typescript
// In a component or store:
import { sessionService } from '@/lib/services/session.service';
import { conversationService } from '@/lib/services/conversation.service';

async function handleSendMessage(sessionId: string, content: string) {
  try {
    // Send message
    await conversationService.sendMessage(sessionId, content);

    // Start streaming response
    const abortController = conversationService.streamResponse(
      sessionId,
      (chunk) => {
        // Update UI with chunk
        setStreamingText(prev => prev + chunk);
      },
      () => {
        // Stream complete
        setIsStreaming(false);
      },
      (error) => {
        // Handle error
        toast.error(error.message);
      }
    );

    // Store abort controller for cleanup
    setCurrentStream(abortController);
  } catch (error) {
    if (error instanceof ValidationError) {
      // Handle validation
    } else {
      // Generic error
      toast.error('Failed to send message');
    }
  }
}
```

## 🚀 Next Phase
Proceed to [Phase 4: UI Integration](./04_UI_INTEGRATION.md) to wire up components.
