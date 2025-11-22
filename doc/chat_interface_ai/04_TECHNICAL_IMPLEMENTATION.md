# Technical Implementation Guide

## 🎯 Mục Đích

Hướng dẫn chi tiết về **cách implement** các components, integration với WebSocket, animations, và performance optimization.

---

## 🏗️ Project Structure

```
frontend/
├── components/
│   ├── atoms/
│   │   ├── ConfidenceMeter.tsx ⭐ NEW
│   │   └── StatusBadge.tsx (existing)
│   ├── molecules/
│   │   ├── ThoughtBubble.tsx ⭐ NEW
│   │   ├── ToolExecutionCard.tsx ⭐ NEW
│   │   ├── ObservationPanel.tsx ⭐ NEW
│   │   └── ChatInput.tsx (existing)
│   └── organisms/
│       ├── ReActFlowContainer.tsx ⭐ NEW
│       ├── ReActTimeline.tsx ⭐ NEW
│       ├── CVInsightViewer.tsx ⭐ NEW
│       ├── RedFlagAlert.tsx ⭐ NEW
│       └── ChatWindow.tsx (existing - to be enhanced)
├── hooks/
│   ├── useReActFlow.ts ⭐ NEW
│   ├── useToolExecution.ts ⭐ NEW
│   ├── useWebSocket.ts ⭐ NEW
│   └── useChat.ts (existing)
├── stores/
│   └── reactFlowStore.ts ⭐ NEW (Zustand)
├── lib/
│   ├── websocket-client.ts ⭐ NEW
│   └── react-flow-utils.ts ⭐ NEW
└── types/
    └── react-flow.ts ⭐ NEW
```

---

## 📡 WebSocket Integration

### 1. WebSocket Client

```typescript
// lib/websocket-client.ts
export class MedagenWebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageHandlers: Map<string, (data: any) => void> = new Map();

  constructor(
    private url: string,
    private sessionId: string
  ) {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const wsUrl = `${this.url}?session=${this.sessionId}`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('✅ WebSocket connected');
        this.reconnectAttempts = 0;
        resolve();
      };

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        reject(error);
      };

      this.ws.onclose = () => {
        console.log('📡 WebSocket closed');
        this.attemptReconnect();
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(event);
      };
    });
  }

  private handleMessage(event: MessageEvent) {
    try {
      const data = JSON.parse(event.data);
      const handler = this.messageHandlers.get(data.type);
      
      if (handler) {
        handler(data);
      } else {
        console.warn('⚠️ No handler for message type:', data.type);
      }
    } catch (error) {
      console.error('❌ Failed to parse message:', error);
    }
  }

  on(messageType: string, handler: (data: any) => void) {
    this.messageHandlers.set(messageType, handler);
  }

  off(messageType: string) {
    this.messageHandlers.delete(messageType);
  }

  send(message: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('❌ WebSocket not connected');
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect().catch(console.error);
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('❌ Max reconnect attempts reached');
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
```

### 2. useWebSocket Hook

```typescript
// hooks/useWebSocket.ts
import { useEffect, useRef, useState } from 'react';
import { MedagenWebSocketClient } from '@/lib/websocket-client';

export function useWebSocket(url: string, sessionId: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const clientRef = useRef<MedagenWebSocketClient | null>(null);

  useEffect(() => {
    const client = new MedagenWebSocketClient(url, sessionId);
    clientRef.current = client;

    client
      .connect()
      .then(() => setIsConnected(true))
      .catch((err) => {
        setError(err);
        setIsConnected(false);
      });

    return () => {
      client.disconnect();
    };
  }, [url, sessionId]);

  const on = (messageType: string, handler: (data: any) => void) => {
    clientRef.current?.on(messageType, handler);
  };

  const send = (message: any) => {
    clientRef.current?.send(message);
  };

  return {
    isConnected,
    error,
    on,
    send,
    client: clientRef.current
  };
}
```

### 3. useReActFlow Hook

```typescript
// hooks/useReActFlow.ts
import { useEffect } from 'react';
import { useWebSocket } from './useWebSocket';
import { useReActFlowStore } from '@/stores/reactFlowStore';

export function useReActFlow(sessionId: string, userId: string) {
  const { isConnected, error, on } = useWebSocket(
    process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws/chat',
    sessionId
  );

  const {
    addThoughtStep,
    addActionStep,
    updateActionStep,
    addObservationStep,
    setFinalResult,
    steps,
    isProcessing,
    finalResult
  } = useReActFlowStore();

  useEffect(() => {
    if (!isConnected) return;

    // Register message handlers
    on('thought', (data) => {
      addThoughtStep(data.content, data.timestamp);
    });

    on('action_start', (data) => {
      addActionStep(data.tool_name, data.tool_display_name);
    });

    on('action_complete', (data) => {
      updateActionStep(data.tool_name, 'complete', data.results);
    });

    on('action_error', (data) => {
      updateActionStep(data.tool_name, 'error', data.error);
    });

    on('observation', (data) => {
      addObservationStep(data.tool_name, data.findings);
    });

    on('final_answer', (data) => {
      setFinalResult(data.result);
    });

  }, [isConnected, on]);

  return {
    steps,
    isProcessing,
    finalResult,
    isConnected,
    error
  };
}
```

---

## 🎨 Animation Implementation

### 1. Framer Motion Variants

```typescript
// lib/react-flow-utils.ts
export const animationVariants = {
  thought: {
    hidden: { opacity: 0, x: -20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      x: 0, 
      scale: 1,
      transition: { 
        duration: 0.3, 
        ease: 'easeOut' 
      }
    },
    exit: {
      opacity: 0,
      x: 20,
      transition: { duration: 0.2 }
    }
  },

  tool: {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { 
        duration: 0.4, 
        ease: 'backOut',
        delay: 0.1 
      }
    }
  },

  observation: {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.3, 
        staggerChildren: 0.1 
      }
    }
  },

  redFlag: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.5, 
        type: 'spring',
        bounce: 0.4 
      }
    }
  }
};
```

### 2. CSS Animations

```css
/* app/globals.css */

/* Pulse glow for running tools */
@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
  }
  50% {
    box-shadow: 0 0 10px 5px rgba(59, 130, 246, 0.3);
  }
}

.tool-running {
  animation: pulse-glow 2s infinite;
}

/* Red flag pulse */
@keyframes red-flag-pulse {
  0%, 100% {
    background-color: rgba(239, 68, 68, 0.1);
    border-color: rgb(239, 68, 68);
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
  }
  50% {
    background-color: rgba(239, 68, 68, 0.2);
    border-color: rgb(220, 38, 38);
    box-shadow: 0 0 15px 5px rgba(239, 68, 68, 0.4);
  }
}

.red-flag-alert {
  animation: red-flag-pulse 2s infinite;
}

/* Shimmer loading */
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.skeleton-shimmer {
  background: linear-gradient(
    90deg,
    hsl(var(--muted)) 0px,
    hsl(var(--accent)) 50%,
    hsl(var(--muted)) 100%
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite linear;
}

/* Success checkmark */
@keyframes checkmark-pop {
  0% {
    transform: scale(0) rotate(45deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.2) rotate(45deg);
    opacity: 1;
  }
  100% {
    transform: scale(1) rotate(45deg);
    opacity: 1;
  }
}

.checkmark-animation {
  animation: checkmark-pop 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

---

## 🚀 Performance Optimization

### 1. Virtualized Lists (For Long Conversations)

```typescript
// components/organisms/ReActTimeline.tsx
import { useVirtualizer } from '@tanstack/react-virtual';

export function ReActTimeline({ steps }: { steps: ReActStep[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: steps.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 150, // Estimated height per step
    overscan: 5 // Render 5 extra items above/below viewport
  });

  return (
    <div 
      ref={parentRef} 
      className="h-[600px] overflow-y-auto"
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative'
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const step = steps[virtualRow.index];
          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`
              }}
            >
              <ReActStepRenderer step={step} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

### 2. Memoization

```typescript
// Use React.memo for expensive components
export const ThoughtBubble = memo(function ThoughtBubble({
  thought,
  timestamp,
  stepNumber,
  variant
}: ThoughtBubbleProps) {
  // Component implementation
}, (prevProps, nextProps) => {
  // Custom comparison
  return prevProps.thought === nextProps.thought &&
         prevProps.timestamp === nextProps.timestamp;
});

// Use useMemo for expensive calculations
const sortedPredictions = useMemo(() => {
  return results.predictions.sort((a, b) => b.confidence - a.confidence);
}, [results.predictions]);

// Use useCallback for event handlers
const handleExpand = useCallback((expanded: boolean) => {
  onExpand?.(expanded);
}, [onExpand]);
```

### 3. Lazy Loading

```typescript
// Lazy load heavy components
const AnnotatedImageViewer = lazy(() => import('@/components/molecules/AnnotatedImageViewer'));
const WhyThisToolModal = lazy(() => import('@/components/organisms/WhyThisToolModal'));

// Usage with Suspense
<Suspense fallback={<Skeleton className="h-64 w-full" />}>
  <AnnotatedImageViewer imageUrl={imageUrl} annotations={annotations} />
</Suspense>
```

### 4. Debouncing

```typescript
// Debounce WebSocket reconnection
import { useDebouncedCallback } from 'use-debounce';

const debouncedReconnect = useDebouncedCallback(
  () => {
    client.connect();
  },
  1000,
  { maxWait: 5000 }
);
```

---

## 🧪 Testing Strategy

### 1. Unit Tests (Jest + React Testing Library)

```typescript
// __tests__/components/ThoughtBubble.test.tsx
import { render, screen } from '@testing-library/react';
import { ThoughtBubble } from '@/components/molecules/ThoughtBubble';

describe('ThoughtBubble', () => {
  it('renders thought content correctly', () => {
    render(
      <ThoughtBubble
        thought="User mentioned hand symptoms"
        timestamp="2024-11-22T10:30:00Z"
        stepNumber={1}
        variant="initial"
      />
    );

    expect(screen.getByText(/User mentioned hand symptoms/i)).toBeInTheDocument();
    expect(screen.getByText(/Thought #1/i)).toBeInTheDocument();
  });

  it('applies correct variant styling', () => {
    const { container } = render(
      <ThoughtBubble
        thought="Test"
        timestamp="2024-11-22T10:30:00Z"
        stepNumber={1}
        variant="initial"
      />
    );

    const card = container.querySelector('.border-l-blue-500');
    expect(card).toBeInTheDocument();
  });
});

### 2. Integration Tests

```typescript
// __tests__/hooks/useReActFlow.test.tsx
import { renderHook, waitFor } from '@testing-library/react';
import { useReActFlow } from '@/hooks/useReActFlow';
import WS from 'jest-websocket-mock';

describe('useReActFlow', () => {
  let server: WS;

  beforeEach(() => {
    server = new WS('ws://localhost:8000/ws/chat');
  });

  afterEach(() => {
    WS.clean();
  });

  it('receives and processes thought messages', async () => {
    const { result } = renderHook(() => 
      useReActFlow('session-123', 'user-456')
    );

    await server.connected;

    server.send(JSON.stringify({
      type: 'thought',
      content: 'Analyzing symptoms...',
      timestamp: '2024-11-22T10:30:00Z'
    }));

    await waitFor(() => {
      expect(result.current.steps).toHaveLength(1);
      expect(result.current.steps[0].type).toBe('thought');
    });
  });
});
```

### 3. E2E Tests (Playwright)

```typescript
// e2e/chat-react-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('ReAct Flow Visualization', () => {
  test('displays thought-action-observation sequence', async ({ page }) => {
    await page.goto('/chat?session=test-123');

    // Wait for thought bubble
    await expect(page.locator('[data-testid="thought-bubble"]').first())
      .toBeVisible();

    // Check for tool execution card
    await expect(page.locator('[data-testid="tool-execution-card"]').first())
      .toBeVisible();

    // Verify observation panel
    await expect(page.locator('[data-testid="observation-panel"]').first())
      .toBeVisible();
  });

  test('expands tool execution on click', async ({ page }) => {
    await page.goto('/chat?session=test-123');

    const toolCard = page.locator('[data-testid="tool-execution-card"]').first();
    await toolCard.click();

    // Check if details are visible
    await expect(page.locator('[data-testid="tool-details"]'))
      .toBeVisible();
  });
});
```

---

## 🔧 Environment Variables

```bash
# .env.local
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws/chat
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_ENABLE_REACT_FLOW=true
NEXT_PUBLIC_MAX_RECONNECT_ATTEMPTS=5
```

---

## 📦 Dependencies to Install

```bash
# Core dependencies
npm install zustand@latest
npm install framer-motion@latest
npm install @tanstack/react-virtual@latest

# WebSocket
npm install ws@latest
npm install @types/ws@latest --save-dev

# Testing
npm install --save-dev jest-websocket-mock
npm install --save-dev @testing-library/react
npm install --save-dev @playwright/test

# Utils
npm install use-debounce@latest
npm install date-fns@latest (may already exist)
```

---

## 🚀 Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Set up WebSocket client
- [ ] Create useWebSocket hook
- [ ] Set up Zustand store for ReAct flow
- [ ] Implement basic ThoughtBubble component

### Phase 2: Core Components (Week 2)
- [ ] Implement ToolExecutionCard
- [ ] Implement ObservationPanel
- [ ] Implement ConfidenceMeter
- [ ] Add expand/collapse functionality

### Phase 3: Advanced Features (Week 3)
- [ ] Implement CVInsightViewer
- [ ] Add RedFlagAlert with animations
- [ ] Implement WhyThisToolModal
- [ ] Add all micro-interactions

### Phase 4: Integration (Week 4)
- [ ] Integrate with existing ChatWindow
- [ ] WebSocket integration with backend
- [ ] Performance optimization
- [ ] Testing and bug fixes

### Phase 5: Polish (Week 5)
- [ ] Accessibility improvements
- [ ] Mobile responsiveness
- [ ] Documentation
- [ ] User testing and feedback

---

## ✅ Checklist

- [ ] WebSocket client implemented
- [ ] All hooks created and tested
- [ ] Zustand store configured
- [ ] All components implemented
- [ ] Animations working smoothly
- [ ] Performance optimization done
- [ ] Unit tests written
- [ ] Integration tests written
- [ ] E2E tests written
- [ ] Accessibility tested
- [ ] Mobile responsive
- [ ] Documentation complete

---

**Next**: [05_INTEGRATION_STRATEGY.md](./05_INTEGRATION_STRATEGY.md) - Tích hợp với hệ thống hiện tại
