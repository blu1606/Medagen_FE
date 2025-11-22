# Backend Integration Master Plan

## Overview
This document orchestrates the integration of FastAPI backend logic into the Next.js frontend. The goal is to create a seamless data flow from user input → backend processing → AI response → frontend display.

## 🎯 Objectives
1. **API Communication**: Establish robust HTTP client for backend endpoints
2. **State Synchronization**: Manage session, patient, and conversation state across frontend/backend
3. **Real-time Updates**: Handle streaming responses from AI agents and Supabase real-time subscriptions
4. **Error Handling**: Graceful degradation and user feedback for failures
5. **Type Safety**: End-to-end TypeScript types matching backend schemas
6. **Direct Database Access**: Supabase client integration for optimized queries and real-time sync

## 🗺️ Integration Roadmap

### [Phase 1: API Client Setup](./01_API_CLIENT_SETUP.md)
- **Goal**: Configure HTTP client with proper auth, base URLs, interceptors
- **Output**: Centralized API service layer (`lib/api/`)
- **Dependencies**: None
- **Estimated Complexity**: Low

### [Phase 2: State Management](./02_STATE_MANAGEMENT.md)
- **Goal**: Connect Zustand stores to backend APIs
- **Output**: Synced stores for sessions, patients, conversations
- **Dependencies**: Phase 1
- **Estimated Complexity**: Medium

### [Phase 3: Service Layer](./03_SERVICE_LAYER.md)
- **Goal**: Build service functions wrapping API calls (CRUD for patients, sessions, messages)
- **Output**: Type-safe service modules (`services/`)
- **Dependencies**: Phase 1, Phase 2
- **Estimated Complexity**: Medium-High

### [Phase 4: UI Integration](./04_UI_INTEGRATION.md)
- **Goal**: Wire up components to use services and state
- **Output**: Functional intake flow, chat interface, patient dashboard
- **Dependencies**: Phase 1-3
- **Estimated Complexity**: High

### [Phase 5: Testing & Validation](./05_TESTING_VALIDATION.md)
- **Goal**: E2E tests, API contract tests, error scenario validation
- **Output**: Test suite covering critical user flows
- **Dependencies**: Phase 1-4
- **Estimated Complexity**: Medium

### [Phase 6: Supabase Integration](./06_SUPABASE_INTEGRATION.md)
- **Goal**: Direct Supabase integration for real-time data sync and direct database queries
- **Output**: Real-time subscriptions, direct DB queries, optimized data flow
- **Dependencies**: Phase 1-2 (can run in parallel with Phase 3-4)
- **Estimated Complexity**: Medium-High
- **Note**: This phase adds Supabase client-side integration for real-time features and can complement the backend API approach

## 📂 Expected Directory Structure
```
frontend/
├── lib/
│   ├── api/
│   │   ├── client.ts          # Axios/Fetch client config
│   │   ├── endpoints.ts       # Typed endpoint definitions
│   │   └── types.ts           # API request/response types
│   └── services/
│       ├── patient.service.ts
│       ├── session.service.ts
│       ├── agent.service.ts
│       └── conversation.service.ts
├── store/
│   ├── sessionStore.ts        # Enhanced with API sync
│   ├── patientStore.ts        # New: patient data management
│   └── conversationStore.ts   # New: message history
└── doc/
    └── integration/           # THIS FOLDER
        ├── 00_MASTER_PLAN.md
        ├── 01_API_CLIENT_SETUP.md
        ├── 02_STATE_MANAGEMENT.md
        ├── 03_SERVICE_LAYER.md
        ├── 04_UI_INTEGRATION.md
        ├── 05_TESTING_VALIDATION.md
        └── 06_SUPABASE_INTEGRATION.md
```

## 🔄 Data Flow Example
```
User Input (WizardIntake)
    ↓
sessionStore.createSession(patientData)
    ↓
POST /api/sessions (via sessionService)
    ↓
Backend creates session + spawns AI agent
    ↓
Response: { session_id, agent_status }
    ↓
sessionStore updates state
    ↓
Navigate to /chat?session={id}
    ↓
ChatWindow loads conversation history
    ↓
GET /api/sessions/{id}/messages
    ↓
Display messages + handle streaming AI responses (SSE/WebSocket)
```

## 🚨 Critical Decision Points

### 1. Real-time Communication Method
**Options**:
- **Server-Sent Events (SSE)**: Best for one-way streaming (AI → Frontend)
- **Supabase Realtime**: PostgreSQL change notifications via WebSocket
- **WebSocket**: Full duplex, overkill for this use case
- **Polling**: Simple but inefficient

**Recommendation**: 
- SSE for AI agent streaming responses
- Supabase Realtime for conversation history and session updates
- REST for CRUD operations

### 2. Authentication Strategy
**Current**: Supabase Auth (JWT tokens)
**Integration**: Include `Authorization: Bearer {token}` in all backend requests
**Action**: Create axios interceptor to inject token

### 3. Error Boundary Strategy
**Requirements**:
- Network failures → Retry with exponential backoff
- 401 Unauthorized → Redirect to login
- 500 Server Error → Show error toast, log to Sentry
- Validation errors → Display inline field errors

## 📝 AI Agent Instructions Format
Each phase file follows this structure:
```markdown
# Phase X: [Name]

## 🎯 Goal
[One-sentence objective]

## 📋 Prerequisites
- [Dependencies from previous phases]

## 🛠️ Implementation Steps
1. **[Step Name]**
   - **Action**: [What to do]
   - **File**: [Where to write code]
   - **Validation**: [How to verify]

## 🔍 Success Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## 🧪 Testing Commands
```bash
[Commands to run]
```

## 🚀 Next Phase
[Link to next phase]
```

## 🏁 Definition of Done
- [ ] All API endpoints have corresponding frontend service functions
- [ ] Session management fully synced between frontend/backend
- [ ] Chat interface receives and displays streaming AI responses
- [ ] Supabase real-time subscriptions working for conversations
- [ ] Patient data persists correctly across page reloads
- [ ] Error states handled gracefully with user feedback
- [ ] No TypeScript errors in integration layer
- [ ] E2E test covering full patient intake → chat flow passes
- [ ] Real-time message updates work without page refresh
