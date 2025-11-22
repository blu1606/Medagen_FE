# Phase 2: State Management Integration

## 🎯 Goal
Enhance existing Zustand stores to sync with backend APIs, maintaining client-side state consistency with server data.

## 📋 Prerequisites
- Phase 1 completed (API client configured)
- Existing `store/sessionStore.ts` reviewed
- Understanding of backend session/patient models

## 🛠️ Implementation Steps

### 1. Enhance Session Store
**Action**: Add API integration to sessionStore
**File**: `store/sessionStore.ts`
**Instructions for AI**:
```typescript
// Current sessionStore has:
// - sessions: ConversationSession[]
// - createSession(data)
// - updateSession(id, updates)

// Enhance with:
// 1. Add loading/error states:
//    - isLoading: boolean
//    - error: string | null
//
// 2. Replace createSession to call backend:
//    createSession: async (patientData) => {
//      set({ isLoading: true, error: null });
//      try {
//        const response = await sessionService.create(patientData);
//        // Add to sessions array
//        // Return session ID for navigation
//      } catch (error) {
//        set({ error: error.message, isLoading: false });
//      }
//    }
//
// 3. Add fetchSession(id) to load from backend
// 4. Add syncSessions() to refresh all sessions from backend
// 5. Add deleteSession(id) with backend call
```

### 2. Create Patient Store
**Action**: New store for patient data management
**File**: `store/patientStore.ts`
**Instructions for AI**:
```typescript
// Create Zustand store with:
// State:
// - patients: Patient[]
// - selectedPatient: Patient | null
// - isLoading: boolean
// - error: string | null

// Actions:
// - fetchPatients: async () => GET /api/patients
// - searchPatients: async (query: string) => GET /api/patients/search?q=
// - createPatient: async (data: PatientCreate) => POST /api/patients
// - updatePatient: async (id, data) => PUT /api/patients/{id}
// - selectPatient: (patient: Patient) => set selectedPatient
// - clearSelected: () => set selectedPatient = null
```

### 3. Create Conversation Store
**Action**: Manage message history and streaming state
**File**: `store/conversationStore.ts`
**Instructions for AI**:
```typescript
// Create Zustand store with:
// State:
// - messagesBySession: Record<string, Message[]>
//   // Key: session_id, Value: array of messages
// - streamingMessage: string | null
//   // Current AI message being streamed
// - isStreaming: boolean
// - error: string | null

// Actions:
// - loadMessages: async (sessionId: string) =>
//     GET /api/sessions/{sessionId}/messages
//     Store in messagesBySession[sessionId]
//
// - sendMessage: async (sessionId: string, content: string) =>
//     POST /api/sessions/{sessionId}/send
//     Add user message immediately to UI (optimistic update)
//     Wait for AI response
//
// - handleStreamChunk: (sessionId: string, chunk: string) =>
//     Append to streamingMessage
//     When stream ends, add complete message to messagesBySession
//
// - clearMessages: (sessionId: string) =>
//     Delete messagesBySession[sessionId]
```

### 4. Add Store Persistence
**Action**: Persist critical state to localStorage
**File**: Update stores with Zustand middleware
**Instructions for AI**:
```typescript
// Wrap stores with persist middleware:
// import { persist } from 'zustand/middleware';

// For sessionStore:
// - Persist sessions array (exclude isLoading, error)
// - Storage key: 'medagen-sessions'

// For patientStore:
// - Persist selectedPatient only
// - Storage key: 'medagen-patient'

// For conversationStore:
// - DO NOT persist (messages are too large)
// - Always fetch from backend on load
```

### 5. Create Store Hooks
**Action**: Custom hooks for common patterns
**File**: `hooks/useStores.ts`
**Instructions for AI**:
```typescript
// Export hooks:
// - useActiveSession(): Get current session from URL param
// - useSessionMessages(sessionId): Auto-load messages on mount
// - useCreateSession(): Hook with loading state and navigation
// - usePatientSearch(query): Debounced search hook

// Example:
// export function useActiveSession() {
//   const { id } = useParams();
//   const session = useSessionStore(s =>
//     s.sessions.find(sess => sess.id === id)
//   );
//   const fetchSession = useSessionStore(s => s.fetchSession);
//
//   useEffect(() => {
//     if (id && !session) fetchSession(id);
//   }, [id]);
//
//   return session;
// }
```

## 🔍 Success Criteria
- [ ] sessionStore.createSession calls backend and returns session ID
- [ ] patientStore can fetch, search, and create patients via API
- [ ] conversationStore loads messages from backend on mount
- [ ] All stores have proper loading/error states
- [ ] Session and patient stores persist to localStorage
- [ ] Custom hooks simplify component logic
- [ ] No race conditions in async actions (use abort controllers if needed)

## 🧪 Testing Commands
```bash
# Type check
pnpm tsc --noEmit

# Test store in isolation (create test)
pnpm vitest run store/__tests__/sessionStore.test.ts
```

## 📝 Example Usage in Component
```typescript
'use client';
import { useSessionStore } from '@/store/sessionStore';
import { useEffect } from 'react';

export default function SessionPage({ params }: { params: { id: string } }) {
  const session = useSessionStore(s =>
    s.sessions.find(sess => sess.id === params.id)
  );
  const fetchSession = useSessionStore(s => s.fetchSession);
  const isLoading = useSessionStore(s => s.isLoading);

  useEffect(() => {
    if (!session && !isLoading) {
      fetchSession(params.id);
    }
  }, [params.id, session, isLoading]);

  if (isLoading) return <Loading />;
  if (!session) return <NotFound />;

  return <ChatWindow session={session} />;
}
```

## 🚀 Next Phase
Proceed to [Phase 3: Service Layer](./03_SERVICE_LAYER.md) to build type-safe service functions.
