# Phase 5: Testing & Validation

## 🎯 Goal
Ensure robust integration between frontend and backend through comprehensive testing, including unit tests, integration tests, and E2E scenarios.

## 📋 Prerequisites
- Phase 1-4 completed (Full integration implemented)
- Backend API running and accessible
- Test environment configured

## 🛠️ Implementation Steps

### 1. Setup Testing Infrastructure
**Action**: Install and configure testing tools
**Commands**:
```bash
# Install testing dependencies
pnpm add -D vitest @testing-library/react @testing-library/user-event
pnpm add -D @playwright/test
pnpm add -D msw # Mock Service Worker for API mocking
```

**File**: `vitest.config.ts`
**Instructions for AI**:
```typescript
// Configure Vitest:
// - alias: @ → src/
// - environment: jsdom
// - setupFiles: ['./tests/setup.ts']
// - coverage: { provider: 'v8', reporter: ['text', 'html'] }
```

### 2. Unit Tests for Services
**Action**: Test service layer in isolation
**File**: `lib/services/__tests__/session.service.test.ts`
**Instructions for AI**:
```typescript
// Test sessionService:
//
// describe('sessionService.create', () => {
//   it('should create session with valid data', async () => {
//     // Mock API response
//     const mockResponse = { id: 'sess-123', ... };
//     vi.spyOn(apiClient, 'post').mockResolvedValue({ data: mockResponse });
//
//     // Call service
//     const result = await sessionService.create({ patient_data: {...} });
//
//     // Assertions
//     expect(apiClient.post).toHaveBeenCalledWith(
//       ENDPOINTS.SESSIONS.CREATE,
//       expect.objectContaining({ patient_data: expect.any(Object) })
//     );
//     expect(result).toEqual(mockResponse);
//   });
//
//   it('should throw ValidationError on invalid data', async () => {
//     // Test error handling
//   });
// });
//
// Repeat for:
// - conversationService.sendMessage
// - patientService.search
// - agentService.getStatus
```

### 3. Integration Tests for Stores
**Action**: Test store + service integration
**File**: `store/__tests__/sessionStore.test.ts`
**Instructions for AI**:
```typescript
// Test sessionStore with mocked services:
//
// describe('sessionStore.createSession', () => {
//   it('should create session and update state', async () => {
//     // Setup
//     const { createSession } = useSessionStore.getState();
//
//     // Execute
//     await createSession({ patient_data: {...} });
//
//     // Verify state updated
//     const { sessions, isLoading } = useSessionStore.getState();
//     expect(sessions).toHaveLength(1);
//     expect(isLoading).toBe(false);
//   });
//
//   it('should set error state on API failure', async () => {
//     // Mock API error
//     vi.spyOn(sessionService, 'create').mockRejectedValue(new Error('Network error'));
//
//     // Execute
//     await createSession({ patient_data: {...} });
//
//     // Verify error state
//     const { error } = useSessionStore.getState();
//     expect(error).toBe('Network error');
//   });
// });
```

### 4. Component Integration Tests
**Action**: Test UI components with stores
**File**: `components/__tests__/WizardIntake.test.tsx`
**Instructions for AI**:
```typescript
// Test WizardIntake component:
//
// import { render, screen, waitFor, userEvent } from '@testing-library/react';
//
// describe('WizardIntake', () => {
//   it('should submit form and navigate to chat', async () => {
//     // Setup router mock
//     const mockPush = vi.fn();
//     vi.mock('next/navigation', () => ({
//       useRouter: () => ({ push: mockPush })
//     }));
//
//     // Render component
//     render(<WizardIntake />);
//
//     // Fill form
//     await userEvent.type(screen.getByLabelText('Chief Complaint'), 'Headache');
//     await userEvent.click(screen.getByText('Next'));
//     // ... more steps
//
//     // Submit
//     await userEvent.click(screen.getByText('Start Assessment'));
//
//     // Verify session created
//     await waitFor(() => {
//       expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/chat/'));
//     });
//   });
//
//   it('should show error toast on API failure', async () => {
//     // Mock API error
//     // Verify toast appears
//   });
// });
```

### 5. API Contract Tests
**Action**: Verify frontend types match backend responses
**File**: `tests/integration/api-contract.test.ts`
**Instructions for AI**:
```typescript
// Test actual backend responses:
//
// describe('API Contract Tests', () => {
//   it('POST /api/sessions returns SessionResponse', async () => {
//     const response = await sessionService.create({
//       patient_data: { name: 'Test', age: 30, chiefComplaint: 'Test' }
//     });
//
//     // Validate response shape
//     expect(response).toMatchObject({
//       id: expect.any(String),
//       created_at: expect.any(String),
//       agent_status: expect.stringMatching(/idle|running|completed/),
//       patient_data: expect.objectContaining({
//         name: 'Test',
//         age: 30
//       })
//     });
//   });
//
//   // Repeat for all critical endpoints
// });
```

### 6. E2E Tests with Playwright
**Action**: Full user flow testing
**File**: `tests/e2e/intake-to-chat.spec.ts`
**Instructions for AI**:
```typescript
// Full flow E2E test:
//
// import { test, expect } from '@playwright/test';
//
// test('complete intake and start chat', async ({ page }) => {
//   // Navigate to intake
//   await page.goto('http://localhost:3000/intake');
//
//   // Fill triage
//   await page.click('text=Routine');
//   await page.click('text=Next');
//
//   // Fill chief complaint
//   await page.fill('textarea[name="chiefComplaint"]', 'Severe headache');
//   await page.click('text=Next');
//
//   // Select body parts
//   await page.click('[data-body-part="head"]');
//   await page.fill('input[type="range"]', '7'); // Pain level
//   await page.click('text=Today');
//   await page.click('text=Start Assessment');
//
//   // Verify navigation to chat
//   await expect(page).toHaveURL(/\/chat\/.+/);
//
//   // Verify chat loads
//   await expect(page.locator('text=How can I help you today?')).toBeVisible();
//
//   // Send message
//   await page.fill('textarea[placeholder*="Type"]', 'I have a headache');
//   await page.click('button[type="submit"]');
//
//   // Verify AI response appears
//   await expect(page.locator('.message-bubble.assistant')).toBeVisible({
//     timeout: 10000
//   });
// });
```

### 7. Error Scenario Tests
**Action**: Test failure modes
**File**: `tests/integration/error-handling.test.ts`
**Instructions for AI**:
```typescript
// Test error scenarios:
//
// describe('Error Handling', () => {
//   it('should retry on network timeout', async () => {
//     // Mock timeout on first call, success on retry
//     // Verify retry logic works
//   });
//
//   it('should redirect to login on 401', async () => {
//     // Mock 401 response
//     // Verify redirect to /login
//   });
//
//   it('should show error boundary on uncaught error', async () => {
//     // Throw error in component
//     // Verify error boundary catches and displays fallback
//   });
//
//   it('should handle stream interruption gracefully', async () => {
//     // Start streaming response
//     // Abort stream
//     // Verify partial message saved
//   });
// });
```

### 8. Performance Tests
**Action**: Verify acceptable performance
**File**: `tests/performance/load-time.test.ts`
**Instructions for AI**:
```typescript
// Performance benchmarks:
//
// test('chat page loads within 2 seconds', async ({ page }) => {
//   const startTime = Date.now();
//   await page.goto('http://localhost:3000/chat/test-session');
//   await page.waitForLoadState('networkidle');
//   const loadTime = Date.now() - startTime;
//
//   expect(loadTime).toBeLessThan(2000);
// });
//
// test('message rendering is smooth', async () => {
//   // Render 100 messages
//   // Measure frame rate
//   // Expect > 30 FPS
// });
```

### 9. Accessibility Tests
**Action**: Ensure a11y compliance
**File**: `tests/a11y/intake.test.tsx`
**Instructions for AI**:
```typescript
// Install: pnpm add -D @axe-core/playwright
//
// import { test, expect } from '@playwright/test';
// import AxeBuilder from '@axe-core/playwright';
//
// test('intake page has no a11y violations', async ({ page }) => {
//   await page.goto('http://localhost:3000/intake');
//
//   const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
//
//   expect(accessibilityScanResults.violations).toEqual([]);
// });
```

### 10. Test Coverage Report
**Action**: Generate coverage metrics
**Commands**:
```bash
# Run all tests with coverage
pnpm test:coverage

# View coverage report
pnpm coverage:report
```

**File**: `package.json` scripts
**Instructions for AI**:
```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run --coverage",
    "test:integration": "vitest run tests/integration",
    "test:e2e": "playwright test",
    "test:all": "pnpm test:unit && pnpm test:e2e",
    "test:coverage": "vitest run --coverage && playwright test",
    "coverage:report": "open coverage/index.html"
  }
}
```

## 🔍 Success Criteria
- [ ] All service methods have unit tests (>80% coverage)
- [ ] All stores have integration tests
- [ ] Critical UI components have tests (WizardIntake, ChatWindow)
- [ ] API contract tests pass with real backend
- [ ] E2E test covers full intake → chat flow
- [ ] Error scenarios tested (network failure, 401, 500, validation)
- [ ] Performance benchmarks met (page load <2s, FPS >30)
- [ ] No accessibility violations in critical flows
- [ ] Total test coverage >70%
- [ ] All tests pass in CI/CD pipeline

## 🧪 Test Execution Matrix

| Test Type | Tool | Files | Command | When to Run |
|-----------|------|-------|---------|-------------|
| Unit | Vitest | `**/*.test.ts` | `pnpm test:unit` | On every commit |
| Integration | Vitest | `tests/integration` | `pnpm test:integration` | Before merge |
| E2E | Playwright | `tests/e2e` | `pnpm test:e2e` | Before deploy |
| A11y | axe-core | `tests/a11y` | `pnpm test:a11y` | Weekly |
| Performance | Playwright | `tests/performance` | `pnpm test:perf` | Before release |

## 📝 CI/CD Integration
```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm test:unit
      - run: pnpm test:integration
      - run: pnpm test:e2e
      - run: pnpm test:coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

## 🏁 Definition of Done
- [ ] All test suites pass locally
- [ ] CI pipeline green on main branch
- [ ] Coverage report shows >70% total coverage
- [ ] Critical paths have >90% coverage
- [ ] No flaky tests (all tests pass 10 times in a row)
- [ ] E2E tests run in <5 minutes
- [ ] Test documentation written for complex scenarios
- [ ] Mock services available for development

## 🚀 Post-Integration Validation
After completing all phases, run this checklist:

```bash
# 1. Start backend
cd ../backend && python -m medagen.main

# 2. Start frontend
cd frontend && pnpm dev

# 3. Manual validation:
- Navigate to /intake ✓
- Complete intake form ✓
- Verify session created in backend logs ✓
- Send message in chat ✓
- Verify AI response streams ✓
- Check patient dashboard ✓
- Check session history ✓

# 4. Run full test suite
pnpm test:all

# 5. Check test coverage
pnpm test:coverage

# 6. Verify no console errors
# Open DevTools, navigate app, check console

# 7. Check network requests
# Open DevTools Network tab, verify:
# - API requests have auth headers
# - Response codes are 200/201
# - No CORS errors
```

## 🎉 Completion Milestone
Once all phases are complete and tests pass, the frontend-backend integration is considered production-ready!
