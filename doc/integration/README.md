# Backend Integration Documentation

## 📚 Overview
This folder contains phased instructions for integrating the FastAPI backend with the Next.js frontend. Each phase builds upon the previous, creating a complete data flow from user input to AI-powered responses.

## 🗂️ Document Structure

### Master Plan
- **[00_MASTER_PLAN.md](./00_MASTER_PLAN.md)** - Orchestrator document
  - High-level integration strategy
  - Data flow architecture
  - Critical decision points
  - Complete roadmap overview

### Implementation Phases

1. **[01_API_CLIENT_SETUP.md](./01_API_CLIENT_SETUP.md)**
   - Configure HTTP client (axios)
   - Setup auth interceptors
   - Define typed endpoints
   - Error handling utilities
   - **Complexity**: Low
   - **Dependencies**: None

2. **[02_STATE_MANAGEMENT.md](./02_STATE_MANAGEMENT.md)**
   - Enhance Zustand stores with API sync
   - Create patient and conversation stores
   - Implement persistence layer
   - Build custom hooks
   - **Complexity**: Medium
   - **Dependencies**: Phase 1

3. **[03_SERVICE_LAYER.md](./03_SERVICE_LAYER.md)**
   - Build type-safe service modules
   - Implement CRUD operations
   - Handle streaming responses (SSE)
   - Create mock services for testing
   - **Complexity**: Medium-High
   - **Dependencies**: Phase 1, 2

4. **[04_UI_INTEGRATION.md](./04_UI_INTEGRATION.md)**
   - Wire components to services
   - Implement streaming chat interface
   - Add loading states & skeletons
   - Create error boundaries
   - Real-time status updates
   - **Complexity**: High
   - **Dependencies**: Phase 1-3

5. **[05_TESTING_VALIDATION.md](./05_TESTING_VALIDATION.md)**
   - Unit tests for services
   - Integration tests for stores
   - E2E tests with Playwright
   - API contract validation
   - Performance benchmarks
   - **Complexity**: Medium
   - **Dependencies**: Phase 1-4

6. **[06_SUPABASE_INTEGRATION.md](./06_SUPABASE_INTEGRATION.md)**
   - Supabase schema overview
   - Data synchronization patterns
   - Real-time subscriptions setup
   - Direct database queries (bypassing backend API)
   - RLS security considerations
   - **Complexity**: Medium-High
   - **Dependencies**: Phase 1-2 (can be done in parallel with Phase 3-4)

## 🎯 How to Use These Documents

### For AI Agents
Each phase document follows a consistent structure optimized for AI execution:

```markdown
## 🎯 Goal
[Clear, single-sentence objective]

## 📋 Prerequisites
[What must be completed first]

## 🛠️ Implementation Steps
[Numbered steps with specific files and instructions]

## 🔍 Success Criteria
[Checklist to verify completion]

## 🧪 Testing Commands
[Commands to validate implementation]
```

AI agents should:
1. Read the Master Plan first to understand context
2. Execute phases sequentially (don't skip phases)
3. Verify success criteria before moving to next phase
4. Run testing commands after each implementation step

### For Developers
Use these documents as:
- **Onboarding guide**: Understand the integration architecture
- **Implementation checklist**: Track progress through phases
- **Reference documentation**: Look up specific patterns (e.g., "How do we handle streaming?")
- **Code review guide**: Ensure implementations follow documented patterns

## 📊 Progress Tracking

### Phase Status
- [x] Phase 1: API Client Setup ✅
- [x] Phase 2: State Management ✅
- [x] Phase 3: Service Layer ✅
- [x] Phase 4: UI Integration ✅
- [ ] Phase 5: Testing & Validation ⏳
- [x] Phase 6: Supabase Integration ✅

### Completion Criteria
Integration is complete when:
- ✅ All 6 phases have green checkmarks
- ✅ All tests pass (`pnpm test:all`)
- ✅ Coverage >70%
- ✅ E2E test (intake → chat) works end-to-end
- ✅ Real-time subscriptions working (Supabase)
- ✅ No console errors during normal usage

## 🔄 Iteration Strategy

If you encounter blockers:

1. **Missing Backend Endpoint**
   - Document the required endpoint in `backend/docs/API.md`
   - Create a GitHub issue
   - Use mock service in the meantime

2. **TypeScript Type Mismatch**
   - Update `lib/api/types.ts` to match backend schemas
   - Run `pnpm tsc --noEmit` to verify
   - Consider generating types from OpenAPI spec

3. **Performance Issues**
   - Profile with React DevTools Profiler
   - Check network waterfall in DevTools
   - Implement debouncing/throttling where needed

4. **Flaky Tests**
   - Add `waitFor` for async operations
   - Mock time-dependent logic
   - Increase timeouts for E2E tests

## 🛠️ Quick Reference

### Key Files Created
```
frontend/
├── lib/
│   ├── api/
│   │   ├── client.ts          # Axios instance
│   │   ├── endpoints.ts       # API routes
│   │   └── types.ts           # Request/response types
│   └── services/
│       ├── session.service.ts
│       ├── patient.service.ts
│       ├── conversation.service.ts
│       └── agent.service.ts
├── store/
│   ├── sessionStore.ts        # Enhanced with API
│   ├── patientStore.ts        # New
│   └── conversationStore.ts   # New
└── tests/
    ├── integration/
    ├── e2e/
    └── a11y/
```

### Common Commands
```bash
# Start development
pnpm dev

# Run all tests
pnpm test:all

# Check types
pnpm tsc --noEmit

# Run specific phase tests
pnpm test lib/api          # Phase 1
pnpm test store            # Phase 2
pnpm test lib/services     # Phase 3
pnpm test:e2e             # Phase 4
pnpm test:coverage        # Phase 5
```

### Environment Variables
```env
# Required for integration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 🔗 Related Documentation
- [Architecture Overview](../ARCHITECTURE.md)
- [API Reference](../API_REFERENCE.md)
- [Development Guide](../DEVELOPMENT.md)
- [Backend API Docs](../../../backend/docs/)

## 📝 Document Format Convention

These integration docs use a specific format:
- **Instructions for AI**: Written in code block comments with clear directives
- **Not production code**: These are guides, not copy-paste implementations
- **Focused on "what" and "why"**: Leave implementation details to AI judgment
- **Testable criteria**: Every step has verification commands

## 🤝 Contributing
When updating these docs:
1. Keep instructions concise and actionable
2. Maintain the established structure (Goal, Prerequisites, Steps, Criteria)
3. Update the Master Plan if adding new phases
4. Test instructions with a fresh checkout before committing

---

**Last Updated**: 2025-11-22
**Status**: Ready for implementation
**Maintainer**: AI Development Team
