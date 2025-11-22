# Phase 4: UI Integration

## 🎯 Goal
Connect all UI components to backend services and state stores, implementing the full user flow from intake to conversation.

## 📋 Prerequisites
- Phase 1-3 completed (API client, stores, services ready)
- UI components exist: WizardIntake, ChatWindow, PatientIntakeForm
- Routing configured for /intake, /chat/:sessionId

## 🛠️ Implementation Steps

### 1. Wizard Intake Integration
**Action**: Connect intake form to session creation
**File**: `app/intake/page.tsx` & `components/organisms/WizardIntake.tsx`
**Instructions for AI**:
```typescript
// In WizardIntake component:
//
// 1. Import useSessionStore
// 2. On final step submission:
//    const createSession = useSessionStore(s => s.createSession);
//    const isLoading = useSessionStore(s => s.isLoading);
//
//    async function handleSubmit() {
//      const sessionId = await createSession({
//        patient_data: {
//          name: data.name || 'Anonymous',
//          age: data.age || 0,
//          chiefComplaint: data.chiefComplaint,
//          bodyParts: data.bodyParts,
//          painLevel: data.painLevel,
//          duration: data.duration,
//          triageLevel: data.triageLevel
//        }
//      });
//
//      if (sessionId) {
//        router.push(`/chat/${sessionId}`);
//      }
//    }
//
// 3. Show loading state during session creation
// 4. Handle errors with toast notification
// 5. Disable submit button while loading
```

### 2. Chat Window Integration
**Action**: Load session, display messages, handle streaming
**File**: `components/organisms/ChatWindow.tsx`
**Instructions for AI**:
```typescript
// In ChatWindow component:
//
// 1. Load session and messages on mount:
//    const session = useActiveSession(); // Custom hook from Phase 2
//    const messages = useConversationStore(s =>
//      s.messagesBySession[session.id] || []
//    );
//    const loadMessages = useConversationStore(s => s.loadMessages);
//
//    useEffect(() => {
//      if (session?.id) loadMessages(session.id);
//    }, [session?.id]);
//
// 2. Handle message sending:
//    const sendMessage = useConversationStore(s => s.sendMessage);
//    const streamingMessage = useConversationStore(s => s.streamingMessage);
//    const isStreaming = useConversationStore(s => s.isStreaming);
//
//    async function handleSend(content: string) {
//      await sendMessage(session.id, content);
//      // Scroll to bottom
//      // Clear input
//    }
//
// 3. Display streaming indicator:
//    {isStreaming && (
//      <MessageBubble
//        role="assistant"
//        content={streamingMessage}
//        isStreaming
//      />
//    )}
//
// 4. Auto-scroll to bottom when new messages arrive
// 5. Show typing indicator while AI is thinking
// 6. Allow cancelling stream (abort button)
```

### 3. Patient Dashboard Integration
**Action**: List and manage patient records
**File**: `app/patients/page.tsx`
**Instructions for AI**:
```typescript
// Create patient dashboard page:
//
// 1. Import usePatientStore
// 2. Load patients on mount:
//    const patients = usePatientStore(s => s.patients);
//    const fetchPatients = usePatientStore(s => s.fetchPatients);
//    const isLoading = usePatientStore(s => s.isLoading);
//
//    useEffect(() => {
//      fetchPatients();
//    }, []);
//
// 3. Implement search:
//    const searchPatients = usePatientStore(s => s.searchPatients);
//    const [query, setQuery] = useState('');
//
//    useDebouncedEffect(() => {
//      if (query) searchPatients(query);
//      else fetchPatients();
//    }, [query], 300);
//
// 4. Display patient list with:
//    - Name, age, last visit
//    - Click to view patient details
//    - Button to create new patient
//
// 5. Handle patient selection:
//    const selectPatient = usePatientStore(s => s.selectPatient);
//    onClick={() => selectPatient(patient)}
```

### 4. Session History Integration
**Action**: Display past sessions, allow resuming
**File**: `components/organisms/SessionHistory.tsx`
**Instructions for AI**:
```typescript
// Create session history component:
//
// 1. Load sessions from store:
//    const sessions = useSessionStore(s => s.sessions);
//    const syncSessions = useSessionStore(s => s.syncSessions);
//
//    useEffect(() => {
//      syncSessions();
//    }, []);
//
// 2. Display sessions grouped by date:
//    - Today
//    - Yesterday
//    - This Week
//    - Older
//
// 3. Show session preview:
//    - Patient name
//    - Chief complaint (first 50 chars)
//    - Timestamp
//    - Status (active, completed)
//
// 4. Click to resume:
//    onClick={() => router.push(`/chat/${session.id}`)}
//
// 5. Delete session with confirmation:
//    const deleteSession = useSessionStore(s => s.deleteSession);
```

### 5. Loading States & Skeletons
**Action**: Improve UX during data fetching
**File**: `components/molecules/LoadingStates.tsx`
**Instructions for AI**:
```typescript
// Create loading components:
//
// - <SessionListSkeleton />: Shimmer effect for session list
// - <ChatMessageSkeleton />: Placeholder for loading messages
// - <PatientCardSkeleton />: Loading card in patient list
//
// Use in components:
// {isLoading ? <SessionListSkeleton /> : <SessionList data={sessions} />}
```

### 6. Error Boundaries
**Action**: Graceful error handling for API failures
**File**: `components/ErrorBoundary.tsx`
**Instructions for AI**:
```typescript
// Create error boundary component:
//
// 1. Catch React errors
// 2. Display user-friendly error message
// 3. Offer retry button
// 4. Log error to console (dev) or Sentry (prod)
//
// Wrap critical sections:
// <ErrorBoundary fallback={<ErrorDisplay />}>
//   <ChatWindow />
// </ErrorBoundary>
```

### 7. Real-time Status Updates
**Action**: Poll agent status during conversation
**File**: `hooks/useAgentStatus.ts`
**Instructions for AI**:
```typescript
// Create custom hook:
//
// export function useAgentStatus(sessionId: string) {
//   const [status, setStatus] = useState<AgentStatus>('idle');
//
//   useEffect(() => {
//     // Poll agent status every 2 seconds
//     const interval = setInterval(async () => {
//       const response = await agentService.getStatus(sessionId);
//       setStatus(response.status);
//     }, 2000);
//
//     return () => clearInterval(interval);
//   }, [sessionId]);
//
//   return status;
// }
//
// Use in ChatWindow to show:
// - "AI is thinking..."
// - "AI is analyzing your symptoms..."
// - Progress indicator
```

### 8. Optimistic Updates
**Action**: Instant UI feedback before API response
**File**: Update conversation store
**Instructions for AI**:
```typescript
// In conversationStore.sendMessage:
//
// 1. Immediately add user message to UI:
//    const tempMessage = {
//      id: `temp-${Date.now()}`,
//      role: 'user',
//      content,
//      timestamp: new Date()
//    };
//    set(state => ({
//      messagesBySession: {
//        ...state.messagesBySession,
//        [sessionId]: [...(state.messagesBySession[sessionId] || []), tempMessage]
//      }
//    }));
//
// 2. Send to backend
// 3. Replace temp message with real message (has real ID)
// 4. If API fails, remove temp message and show error
```

## 🔍 Success Criteria
- [ ] WizardIntake creates session and navigates to chat
- [ ] ChatWindow loads messages and displays them
- [ ] Message sending triggers streaming AI response
- [ ] Patient dashboard lists all patients with search
- [ ] Session history shows past conversations
- [ ] Loading skeletons appear during data fetching
- [ ] Error boundaries catch and display API errors gracefully
- [ ] Agent status updates in real-time during conversation
- [ ] Optimistic updates provide instant feedback
- [ ] No console errors during happy path flow

## 🧪 Testing Checklist
```bash
# Manual testing flow:
1. Navigate to /intake
2. Fill out form with body parts selection
3. Submit and verify navigation to /chat/{id}
4. Send a message
5. Verify streaming AI response appears
6. Navigate to /patients
7. Search for patient by name
8. Navigate to /sessions
9. Click on past session
10. Verify messages load correctly

# Automated E2E test:
pnpm playwright test integration/full-flow.spec.ts
```

## 📝 Example Complete Flow
```typescript
// User journey:
// 1. User fills intake form
// 2. Clicks "Start Assessment"
// 3. Backend creates session + spawns AI agent
// 4. User redirected to /chat/{session_id}
// 5. Messages auto-load
// 6. User sends first message
// 7. AI responds with streaming text
// 8. Conversation continues
// 9. User can view past sessions in sidebar
```

## 🚀 Next Phase
Proceed to [Phase 5: Testing & Validation](./05_TESTING_VALIDATION.md) for comprehensive testing.
