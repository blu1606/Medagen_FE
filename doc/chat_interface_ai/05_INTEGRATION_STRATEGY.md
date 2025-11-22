# Integration Strategy - Tích Hợp Hệ Thống

## 🎯 Mục Đích

Hướng dẫn chi tiết về cách **tích hợp ReAct flow visualization** vào hệ thống chat hiện tại một cách an toàn, có thể rollback, và không ảnh hưởng đến người dùng đang sử dụng.

---

## 🗺️ Current State Analysis

### Existing Chat Implementation

```
Current Flow:
User Input → ChatWindow → useChat hook → API call → Response
                             ↓
                      Simple typing indicator
                             ↓
                      Message displayed
```

### Target State

```
Enhanced Flow:
User Input → ChatWindow → useReActFlow hook → WebSocket
                             ↓
                   ReActFlowContainer
                   ├─ ThoughtBubble (real-time)
                   ├─ ToolExecutionCard (real-time)
                   ├─ ObservationPanel (real-time)
                   └─ Final Answer
```

---

## 🔄 Migration Strategy

### Option 1: Feature Flag (RECOMMENDED ⭐)

**Concept**: Dùng feature flag để bật/tắt ReAct visualization.

#### Implementation

```typescript
// lib/feature-flags.ts
export const FEATURE_FLAGS = {
  ENABLE_REACT_FLOW: process.env.NEXT_PUBLIC_ENABLE_REACT_FLOW === 'true',
  ENABLE_WEBSOCKET: process.env.NEXT_PUBLIC_ENABLE_WEBSOCKET === 'true',
  ENABLE_CV_INSIGHTS: process.env.NEXT_PUBLIC_ENABLE_CV_INSIGHTS === 'true',
} as const;

export function isFeatureEnabled(flag: keyof typeof FEATURE_FLAGS): boolean {
  return FEATURE_FLAGS[flag];
}
```

```typescript
// components/organisms/ChatWindow.tsx (Enhanced)
import { isFeatureEnabled } from '@/lib/feature-flags';
import { ReActFlowContainer } from '@/components/organisms/ReActFlowContainer';

export function ChatWindow({ sessionId }: ChatWindowProps) {
  const enableReActFlow = isFeatureEnabled('ENABLE_REACT_FLOW');

  // Use legacy chat OR new ReAct flow based on feature flag
  if (enableReActFlow) {
    return (
      <div className="flex flex-col h-screen">
        <ChatHeader sessionId={sessionId} />
        <ReActFlowContainer sessionId={sessionId} userId={userId} />
        <ChatInput onSend={handleSend} />
      </div>
    );
  }

  // Legacy chat implementation (unchanged)
  return (
    <div className="flex flex-col h-screen">
      <ChatHeader sessionId={sessionId} />
      <MessagesContainer messages={messages} />
      <ChatInput onSend={handleSend} />
    </div>
  );
}
```

**Advantages**:
- ✅ Zero risk - can disable instantly
- ✅ A/B testing friendly
- ✅ Gradual rollout possible
- ✅ Easy to rollback

---

### Option 2: Side-by-Side (Dev Testing)

**Concept**: Hiển thị cả 2 versions cùng lúc để so sánh.

```typescript
export function ChatWindowComparison({ sessionId }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4 h-screen">
      {/* Legacy Version */}
      <div className="border-r">
        <h3 className="text-sm font-semibold p-2 bg-muted">Legacy Chat</h3>
        <LegacyChatWindow sessionId={sessionId} />
      </div>

      {/* New ReAct Flow Version */}
      <div>
        <h3 className="text-sm font-semibold p-2 bg-muted">ReAct Flow (New)</h3>
        <EnhancedChatWindow sessionId={sessionId} />
      </div>
    </div>
  );
}
```

**Use case**: Internal testing only, not for production.

---

### Option 3: Phased Rollout

**Week 1-2**: Internal testing (Developers + Team)
```env
NEXT_PUBLIC_ENABLE_REACT_FLOW=true  # Only on dev/staging
```

**Week 3**: Beta users (10% traffic)
```typescript
// lib/rollout.ts
export function shouldEnableReActFlow(userId: string): boolean {
  // Hash user ID and enable for 10%
  const hash = simpleHash(userId);
  return hash % 100 < 10; // 10% of users
}
```

**Week 4**: Expand to 50% traffic

**Week 5**: 100% rollout
```env
NEXT_PUBLIC_ENABLE_REACT_FLOW=true  # Production
```

---

## 🔌 Backend Integration

### 1. WebSocket Endpoint Setup

Backend cần expose WebSocket endpoint:

```python
# src/api/websocket.py (FastAPI)
from fastapi import WebSocket, WebSocketDisconnect
import json

@app.websocket("/ws/chat")
async def websocket_chat(websocket: WebSocket, session: str):
    await websocket.accept()
    
    try:
        # Receive user message
        data = await websocket.receive_text()
        message = json.loads(data)
        
        # Process with agent
        async for step in agent.process_stream(message):
            # Send each ReAct step to frontend
            await websocket.send_text(json.dumps(step))
            
    except WebSocketDisconnect:
        print(f"Client disconnected: {session}")
```

### 2. LangChain Agent Modifications

Cần expose intermediate steps:

```python
# src/agent/agent-executor.py
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler

class ReActStreamingCallback(BaseCallbackHandler):
    def __init__(self, websocket):
        self.websocket = websocket
    
    async def on_llm_start(self, prompt, **kwargs):
        # Send thought
        await self.websocket.send_text(json.dumps({
            'type': 'thought',
            'content': extract_thought(prompt),
            'timestamp': datetime.now().isoformat()
        }))
    
    async def on_tool_start(self, tool_name, input, **kwargs):
        # Send action start
        await self.websocket.send_text(json.dumps({
            'type': 'action_start',
            'tool_name': tool_name,
            'tool_display_name': TOOL_DISPLAY_NAMES[tool_name],
            'timestamp': datetime.now().isoformat()
        }))
    
    async def on_tool_end(self, output, **kwargs):
        # Send action complete
        await self.websocket.send_text(json.dumps({
            'type': 'action_complete',
            'tool_name': kwargs['tool_name'],
            'results': output,
            'duration_ms': kwargs['duration_ms'],
            'timestamp': datetime.now().isoformat()
        }))

# Usage
agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    callbacks=[ReActStreamingCallback(websocket)],
    verbose=True
)
```

---

## 🔀 Data Migration

### Current Database Schema

```sql
-- Existing conversation_history table
CREATE TABLE conversation_history (
  id UUID PRIMARY KEY,
  session_id UUID NOT NULL,
  user_id UUID NOT NULL,
  role TEXT NOT NULL,  -- 'user' | 'assistant'
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Enhanced Schema (Backward Compatible)

```sql
-- Add new columns (nullable for backward compatibility)
ALTER TABLE conversation_history
ADD COLUMN message_type TEXT DEFAULT 'simple',  -- 'simple' | 'react_flow'
ADD COLUMN react_steps JSONB,  -- Store ReAct steps
ADD COLUMN tool_executions JSONB,  -- Store tool execution details
ADD COLUMN metadata JSONB;  -- Extra metadata

-- Index for performance
CREATE INDEX idx_conversation_react_steps 
ON conversation_history USING GIN (react_steps);
```

---

## 📊 Analytics & Monitoring

### 1. Track User Engagement

```typescript
// lib/analytics.ts
export function trackReActInteraction(event: string, data: any) {
  if (typeof window !== 'undefined') {
    // Google Analytics
    window.gtag?.('event', event, {
      category: 'ReAct Flow',
      ...data
    });

    // Custom analytics
    fetch('/api/analytics', {
      method: 'POST',
      body: JSON.stringify({ event, data })
    });
  }
}

// Usage in components
const handleToolExpand = (toolName: string, expanded: boolean) => {
  trackReActInteraction('tool_expanded', {
    tool_name: toolName,
    expanded
  });
  setExpanded(expanded);
};

const handleWhyThisClick = (toolName: string) => {
  trackReActInteraction('why_this_clicked', {
    tool_name: toolName
  });
  setShowWhyModal(true);
};
```

### 2. Monitor Performance

```typescript
// lib/monitoring.ts
export function monitorReActPerformance(sessionId: string) {
  const startTime = performance.now();
  
  return {
    recordThought: () => {
      const duration = performance.now() - startTime;
      sendMetric('react_thought_duration', duration);
    },
    
    recordToolExecution: (toolName: string, duration: number) => {
      sendMetric('react_tool_duration', duration, { tool: toolName });
    },
    
    recordComplete: () => {
      const totalDuration = performance.now() - startTime;
      sendMetric('react_flow_complete', totalDuration);
    }
  };
}
```

### 3. Error Tracking

```typescript
// lib/error-tracking.ts
import * as Sentry from '@sentry/nextjs';

export function trackReActError(error: Error, context: any) {
  Sentry.captureException(error, {
    tags: {
      feature: 'react_flow',
    },
    extra: context
  });
  
  console.error('ReAct Flow Error:', error, context);
}

// Usage
try {
  await client.connect();
} catch (error) {
  trackReActError(error, {
    sessionId,
    userId,
    action: 'websocket_connect'
  });
}
```

---

## 🧪 A/B Testing Strategy

### Setup

```typescript
// lib/ab-testing.ts
export function getABTestVariant(userId: string, testName: string): 'A' | 'B' {
  // Consistent hashing based on user ID
  const hash = simpleHash(`${userId}-${testName}`);
  return hash % 2 === 0 ? 'A' : 'B';
}

// Usage
const variant = getABTestVariant(userId, 'react_flow_rollout');
const enableReActFlow = variant === 'B';
```

### Track Results

```typescript
// Track which variant user sees
trackReActInteraction('ab_test_assigned', {
  test_name: 'react_flow_rollout',
  variant: variant,
  user_id: userId
});

// Track outcome metrics
trackReActInteraction('chat_complete', {
  variant: variant,
  satisfaction: userRating,  // If collected
  time_to_complete: duration
});
```

---

## 🔐 Security Considerations

### 1. WebSocket Authentication

```typescript
// Backend
@app.websocket("/ws/chat")
async def websocket_chat(
    websocket: WebSocket, 
    session: str,
    token: str = Query(...)  # JWT token
):
    # Verify token
    user = verify_jwt_token(token)
    if not user:
        await websocket.close(code=403)
        return
    
    await websocket.accept()
    # ... rest of implementation
```

```typescript
// Frontend
const token = await getAuthToken();
const wsUrl = `${WS_URL}?session=${sessionId}&token=${token}`;
```

### 2. Rate Limiting

```python
# Backend
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.websocket("/ws/chat")
@limiter.limit("10/minute")  # Max 10 connections per minute
async def websocket_chat(websocket: WebSocket, session: str):
    # ...
```

### 3. Input Validation

```typescript
// Validate all WebSocket messages
function validateReActMessage(message: any): message is ReActMessage {
  const validTypes = ['thought', 'action_start', 'action_complete', 'observation', 'final_answer'];
  
  return (
    typeof message === 'object' &&
    'type' in message &&
    validTypes.includes(message.type) &&
    'timestamp' in message
  );
}

// Usage
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (!validateReActMessage(data)) {
    console.error('Invalid message format:', data);
    return;
  }
  
  handleMessage(data);
};
```

---

## 🚦 Rollback Plan

### Instant Rollback (Feature Flag)

```bash
# In case of critical issues
# Set environment variable to false
NEXT_PUBLIC_ENABLE_REACT_FLOW=false

# Redeploy or restart service
vercel --prod  # If using Vercel
# or
pm2 restart medagen-frontend
```

### Gradual Rollback

```typescript
// Reduce percentage gradually
export function shouldEnableReActFlow(userId: string): boolean {
  const rolloutPercentage = 50; // Reduce from 100 to 50
  const hash = simpleHash(userId);
  return hash % 100 < rolloutPercentage;
}
```

### Database Rollback (If Schema Changed)

```sql
-- If needed, revert schema changes
ALTER TABLE conversation_history
DROP COLUMN IF EXISTS react_steps,
DROP COLUMN IF EXISTS tool_executions,
DROP COLUMN IF EXISTS metadata;
```

---

## 📋 Pre-Launch Checklist

### Technical
- [ ] WebSocket endpoint tested and stable
- [ ] All components tested (unit + integration + E2E)
- [ ] Performance benchmarks met (< 100ms per step)
- [ ] Error handling covers all edge cases
- [ ] Graceful degradation works (falls back to simple chat)
- [ ] Mobile responsive on all screen sizes
- [ ] Accessibility tested (screen readers, keyboard nav)

### Infrastructure
- [ ] WebSocket server scaled for traffic
- [ ] CDN configured for static assets
- [ ] Monitoring dashboards set up
- [ ] Alerting configured for errors/downtime
- [ ] Backup/rollback plan tested

### User Experience
- [ ] Internal team testing complete
- [ ] Beta user feedback collected and addressed
- [ ] Documentation updated
- [ ] Support team trained
- [ ] User guide created (if needed)

### Legal/Compliance
- [ ] Privacy policy updated (WebSocket data handling)
- [ ] Terms of service reviewed
- [ ] GDPR compliance verified (if applicable)
- [ ] Security audit passed

---

## 📅 Launch Timeline

### Week -4: Preparation
- [ ] Complete all development
- [ ] Internal testing
- [ ] Performance optimization

### Week -3: Staging
- [ ] Deploy to staging
- [ ] QA testing
- [ ] Bug fixes

### Week -2: Beta
- [ ] 10% rollout to beta users
- [ ] Monitor metrics
- [ ] Collect feedback

### Week -1: Expand
- [ ] 50% rollout
- [ ] Continue monitoring
- [ ] Address any issues

### Week 0: Launch
- [ ] 100% rollout (if metrics look good)
- [ ] Announce feature
- [ ] Monitor closely for 48 hours

### Week +1: Post-Launch
- [ ] Analyze metrics
- [ ] Iterate based on feedback
- [ ] Optimize performance

---

## 📊 Success Metrics

### Engagement
- [ ] Tool expansion rate > 60%
- [ ] "Why this?" click rate > 30%
- [ ] Average time on page +40%

### Performance
- [ ] WebSocket connection success rate > 99%
- [ ] Average latency < 100ms per step
- [ ] Error rate < 0.5%

### User Satisfaction
- [ ] User surveys: "I understand AI reasoning" > 85%
- [ ] User surveys: "I trust the results" > 90%
- [ ] NPS score improvement

### Medical Safety
- [ ] Red flag detection visibility: 100%
- [ ] Emergency recommendation follow-through > 90%

---

## ✅ Final Checklist

- [ ] Feature flag system implemented
- [ ] WebSocket integration complete
- [ ] Backend modifications done
- [ ] Analytics tracking configured
- [ ] A/B testing framework ready
- [ ] Security measures in place
- [ ] Rollback plan tested
- [ ] Pre-launch checklist completed
- [ ] Launch timeline defined
- [ ] Success metrics tracked

---

**Kết Luận**: Với chiến lược tích hợp này, chúng ta có thể rollout ReAct flow visualization một cách an toàn, có kiểm soát, và có thể rollback nếu gặp vấn đề. Feature flags cho phép testing nội bộ trước, A/B testing cho phép đo lường impact, và monitoring đảm bảo chúng ta có thể phát hiện và fix issues nhanh chóng.

---

**Previous**: [04_TECHNICAL_IMPLEMENTATION.md](./04_TECHNICAL_IMPLEMENTATION.md)
