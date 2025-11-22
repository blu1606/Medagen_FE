# Backend WebSocket Specification for ReAct Flow

**Version**: 1.0  
**Last Updated**: 2025-11-22  
**Status**: Required for Phase 4 completion

---

## Overview

This document specifies the WebSocket API requirements for the backend to integrate with the frontend ReAct flow visualization system. The frontend is **fully implemented** and ready to receive real-time ReAct steps from the LangChain agent.

---

## WebSocket Endpoint

### Connection URL
```
ws://localhost:8000/ws/chat
```

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `session` | string | ✅ Yes | Session ID from frontend (UUID format) |

### Example Connection
```javascript
// Frontend automatically connects via useReActFlow hook
const ws = new WebSocket(`ws://localhost:8000/ws/chat?session=${sessionId}`);
```

---

## Authentication

### Recommended: JWT Token
```javascript
// Option 1: via query parameter
ws://localhost:8000/ws/chat?session={sessionId}&token={jwt_token}

// Option 2: via first message after connection
{
  "type": "auth",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Security Requirements
- ✅ Validate session ownership
- ✅ Rate limiting (max 100 messages/minute per session)
- ✅ Auto-disconnect after 30 minutes of inactivity
- ✅ SSL/TLS in production (`wss://`)

---

## Message Format

### Base Message Structure
All messages must be valid JSON with these fields:

```typescript
interface BaseMessage {
  type: string;           // Message type identifier
  timestamp: string;      // ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)
  session_id?: string;    // Optional, for logging/tracking
}
```

---

## Message Types

### 1. Thought Message
**Sent when**: AI is reasoning about the next step

```json
{
  "type": "thought",
  "content": "I need to analyze the uploaded image to identify the skin condition. Let me use the dermatology CV model.",
  "timestamp": "2025-11-22T13:00:00.123Z",
  "variant": "intermediate"
}
```

**TypeScript Interface**:
```typescript
interface ThoughtMessage {
  type: "thought";
  content: string;           // AI reasoning text
  timestamp: string;
  variant?: "initial" | "intermediate" | "final";  // Default: "intermediate"
}
```

**Variant Guide**:
- `initial` - First thought in the chain
- `intermediate` - Middle reasoning steps (default)
- `final` - Final conclusion before answer

---

### 2. Action Start Message
**Sent when**: AI begins executing a tool

```json
{
  "type": "action_start",
  "tool_name": "derm_cv",
  "tool_display_name": "Dermatology CV Analysis",
  "timestamp": "2025-11-22T13:00:01.456Z"
}
```

**TypeScript Interface**:
```typescript
interface ActionStartMessage {
  type: "action_start";
  tool_name: "derm_cv" | "eye_cv" | "wound_cv" | "triage_rules" | "guideline_retrieval";
  tool_display_name: string;  // Human-readable name
  timestamp: string;
}
```

**Tool Names Map**:
| `tool_name` | `tool_display_name` |
|-------------|---------------------|
| `derm_cv` | Dermatology CV Analysis |
| `eye_cv` | Eye Condition Analysis |
| `wound_cv` | Wound Assessment |
| `triage_rules` | Triage Classification |
| `guideline_retrieval` | Medical Guidelines |

---

### 3. Action Complete Message
**Sent when**: Tool execution finishes successfully

```json
{
  "type": "action_complete",
  "tool_name": "derm_cv",
  "duration_ms": 1542,
  "results": {
    "predictions": [
      {
        "condition": "Eczema",
        "confidence": 0.85
      },
      {
        "condition": "Psoriasis",
        "confidence": 0.10
      },
      {
        "condition": "Dermatitis",
        "confidence": 0.05
      }
    ],
    "visual_features": [
      "Redness and inflammation",
      "Dry, scaly patches",
      "No open wounds detected"
    ],
    "model_info": {
      "name": "DermNet-ResNet50",
      "accuracy": 0.92,
      "trained_on": 15000
    }
  },
  "timestamp": "2025-11-22T13:00:03.000Z"
}
```

**TypeScript Interface**:
```typescript
interface ActionCompleteMessage {
  type: "action_complete";
  tool_name: string;
  duration_ms: number;      // Execution time in milliseconds
  results: ToolResults;     // Tool-specific results (see below)
  timestamp: string;
}
```

---

### 4. Action Error Message
**Sent when**: Tool execution fails

```json
{
  "type": "action_error",
  "tool_name": "derm_cv",
  "error_code": "MODEL_ERROR",
  "error_message": "Failed to process image: Invalid format",
  "duration_ms": 234,
  "timestamp": "2025-11-22T13:00:03.000Z"
}
```

---

### 5. Observation Message
**Sent when**: AI observes/interprets tool results

```json
{
  "type": "observation",
  "tool_name": "derm_cv",
  "findings": {
    "predictions": [
      {"condition": "Eczema", "confidence": 0.85}
    ]
  },
  "confidence": 0.85,
  "timestamp": "2025-11-22T13:00:04.000Z"
}
```

---

### 6. Final Answer Message
**Sent when**: Agent completes the entire ReAct loop

```json
{
  "type": "final_answer",
  "result": {
    "triage_level": "urgent",
    "recommendation": {
      "action": "See a dermatologist",
      "timeframe": "within 24 hours",
      "home_care_advice": "Apply moisturizer, avoid hot water",
      "warning_signs": "Increased pain, spreading rash"
    },
    "red_flags": [
      {
        "symptom": "Severe itching at night",
        "risk": "May indicate infection",
        "severity": "medium"
      }
    ]
  },
  "timestamp": "2025-11-22T13:00:05.000Z"
}
```

---

## Tool-Specific Result Formats

### CV Tools (`derm_cv`, `eye_cv`, `wound_cv`)

```typescript
interface CVResults {
  predictions: Array<{
    condition: string;
    confidence: number;        // 0.0 to 1.0
  }>;
  visual_features?: string[];  // Optional
  annotations?: Array<{        // Optional bounding boxes
    bbox: [number, number, number, number];
    label: string;
    confidence: number;
  }>;
  model_info?: {
    name: string;
    accuracy: number;
    trained_on?: number;
  };
}
```

**Example**:
```json
{
  "predictions": [
    {"condition": "Eczema", "confidence": 0.85},
    {"condition": "Psoriasis", "confidence": 0.10}
  ],
  "visual_features": [
    "Redness and inflammation",
    "Dry, scaly patches"
  ],
  "model_info": {
    "name": "DermNet-ResNet50",
    "accuracy": 0.92
  }
}
```

---

### Triage Rules (`triage_rules`)

```typescript
interface TriageResults {
  level: "routine" | "urgent" | "emergency";
  reasoning: string;
  confidence: number;
  red_flags: RedFlag[];
  next_steps: string[];
}

interface RedFlag {
  symptom: string;
  risk: string;
  severity: "low" | "medium" | "high" | "critical";
}
```

**Example**:
```json
{
  "level": "urgent",
  "reasoning": "Multiple red flags indicate need for prompt medical attention",
  "confidence": 0.90,
  "red_flags": [
    {
      "symptom": "Severe pain lasting >3 days",
      "risk": "Possible infection or complication",
      "severity": "high"
    }
  ],
  "next_steps": [
    "See doctor within 24 hours",
    "Monitor for fever or worsening symptoms"
  ]
}
```

---

### Guideline Retrieval (`guideline_retrieval`)

```typescript
interface GuidelineResults {
  guidelines: Array<{
    title: string;
    content: string;
    source: string;
    relevance_score: number;
    url?: string;
  }>;
  query: string;
}
```

**Example**:
```json
{
  "query": "eczema treatment guidelines",
  "guidelines": [
    {
      "title": "Atopic Dermatitis Management",
      "content": "First-line treatment includes emollients and topical corticosteroids...",
      "source": "American Academy of Dermatology",
      "relevance_score": 0.95,
      "url": "https://www.aad.org/..."
    }
  ]
}
```

---

## Complete Message Flow Example

```javascript
// 1. Connection established
WebSocket opened: ws://localhost:8000/ws/chat?session=abc123

// 2. User sends message via frontend (handled by existing useChat hook)
// Frontend sends user message to REST API (existing flow)

// 3. Backend streams ReAct steps via WebSocket:

// Step 1: Initial thought
{
  "type": "thought",
  "content": "The user mentioned itchy skin with redness. I should analyze any uploaded images first.",
  "timestamp": "2025-11-22T13:00:00.000Z",
  "variant": "initial"
}

// Step 2: Tool execution starts
{
  "type": "action_start",
  "tool_name": "derm_cv",
  "tool_display_name": "Dermatology CV Analysis",
  "timestamp": "2025-11-22T13:00:01.000Z"
}

// Step 3: Tool completes
{
  "type": "action_complete",
  "tool_name": "derm_cv",
  "duration_ms": 1542,
  "results": {
    "predictions": [
      {"condition": "Eczema", "confidence": 0.85},
      {"condition": "Psoriasis", "confidence": 0.10}
    ],
    "visual_features": ["Redness", "Dry patches"],
    "model_info": {
      "name": "DermNet-ResNet50",
      "accuracy": 0.92
    }
  },
  "timestamp": "2025-11-22T13:00:03.000Z"
}

// Step 4: Observation
{
  "type": "observation",
  "tool_name": "derm_cv",
  "findings": {
    "predictions": [{"condition": "Eczema", "confidence": 0.85}]
  },
  "confidence": 0.85,
  "timestamp": "2025-11-22T13:00:04.000Z"
}

// Step 5: Next thought
{
  "type": "thought",
  "content": "Based on high confidence for eczema, I should now assess severity using triage rules.",
  "timestamp": "2025-11-22T13:00:05.000Z",
  "variant": "intermediate"
}

// Step 6: Triage tool
{
  "type": "action_start",
  "tool_name": "triage_rules",
  "tool_display_name": "Triage Classification",
  "timestamp": "2025-11-22T13:00:06.000Z"
}

{
  "type": "action_complete",
  "tool_name": "triage_rules",
  "duration_ms": 342,
  "results": {
    "level": "urgent",
    "reasoning": "Severe itching affecting sleep requires prompt attention",
    "confidence": 0.88,
    "red_flags": [
      {
        "symptom": "Severe itching at night",
        "risk": "May indicate secondary infection",
        "severity": "medium"
      }
    ]
  },
  "timestamp": "2025-11-22T13:00:07.000Z"
}

// Step 7: Final thought
{
  "type": "thought",
  "content": "The analysis is complete. I will provide comprehensive advice.",
  "timestamp": "2025-11-22T13:00:08.000Z",
  "variant": "final"
}

// Step 8: Final answer (triggers existing triage result display)
{
  "type": "final_answer",
  "result": {
    "triage_level": "urgent",
    "recommendation": {
      "action": "See a dermatologist",
      "timeframe": "within 24 hours",
      "home_care_advice": "Apply gentle moisturizer, avoid hot water and harsh soaps",
      "warning_signs": "Increased pain, spreading rash, fever, oozing"
    },
    "red_flags": [
      {
        "symptom": "Severe itching affecting sleep",
        "risk": "May indicate secondary infection",
        "severity": "medium"
      }
    ]
  },
  "timestamp": "2025-11-22T13:00:09.000Z"
}
```

---

## Frontend Integration Points

### Already Implemented ✅

The frontend automatically handles all message types:

```typescript
// In useReActFlow.ts
websocket.on('thought', (msg) => {
  store.addThoughtStep(msg.content, msg.timestamp, msg.variant);
});

websocket.on('action_start', (msg) => {
  store.addActionStep(msg.tool_name, msg.tool_display_name, msg.timestamp);
});

websocket.on('action_complete', (msg) => {
  store.updateActionStep(msg.tool_name, 'complete', msg.results, msg.duration);
});

websocket.on('final_answer', (msg) => {
  store.setFinalResult(msg.result);
  // Also triggers existing triage result display
});
```

### Component Mapping

| Message Type | Rendered Component |
|--------------|-------------------|
| `thought` | `<ThoughtBubble>` |
| `action_start` / `action_complete` | `<ToolExecutionCard>` |
| `observation` | `<ObservationPanel>` |
| `final_answer` | `<EnhancedTriageResult>` (existing) |

---

## Error Handling

### Backend Should Handle
1. **Invalid JSON**: Close connection with code 1003
2. **Authentication failure**: Close with code 1008
3. **Rate limit exceeded**: Send error message, then close
4. **Tool execution timeout**: Send `action_error` message

### Error Message Format
```json
{
  "type": "error",
  "code": "TOOL_TIMEOUT",
  "message": "Tool execution exceeded 30 second timeout",
  "timestamp": "2025-11-22T13:00:00.000Z"
}
```

### Frontend Error Handling ✅
Already implemented in `useReActFlow.ts`:
- Automatic reconnection (3 attempts with exponential backoff)
- Error state display in `<ReActFlowContainer>`
- Graceful degradation if WebSocket unavailable

---

## Testing

### 1. Manual Testing with `wscat`

```bash
# Install wscat
npm install -g wscat

# Connect
wscat -c "ws://localhost:8000/ws/chat?session=test123"

# Send test messages
> {"type":"thought","content":"Testing thought","timestamp":"2025-11-22T13:00:00.000Z"}
> {"type":"action_start","tool_name":"derm_cv","tool_display_name":"Derm CV","timestamp":"2025-11-22T13:00:01.000Z"}
```

### 2. Python Test Client

```python
import asyncio
import websockets
import json
from datetime import datetime

async def test_react_flow():
    uri = "ws://localhost:8000/ws/chat?session=test123"
    
    async with websockets.connect(uri) as websocket:
        # Send thought
        await websocket.send(json.dumps({
            "type": "thought",
            "content": "Analyzing symptoms...",
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }))
        
        # Send tool execution
        await websocket.send(json.dumps({
            "type": "action_start",
            "tool_name": "derm_cv",
            "tool_display_name": "Dermatology CV",
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }))
        
        await asyncio.sleep(1)
        
        await websocket.send(json.dumps({
            "type": "action_complete",
            "tool_name": "derm_cv",
            "duration_ms": 1000,
            "results": {
                "predictions": [
                    {"condition": "Eczema", "confidence": 0.85}
                ]
            },
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }))

asyncio.run(test_react_flow())
```

### 3. Expected Frontend Behavior

When backend sends messages, frontend should:
1. ✅ Display `<ThoughtBubble>` with fade-in animation
2. ✅ Show `<ToolExecutionCard>` with loading spinner
3. ✅ Update card to "complete" with green checkmark
4. ✅ Display confidence meters with correct colors
5. ✅ "Why this tool?" modal works when clicked
6. ✅ Smooth scrolling to new steps

---

## Performance Requirements

| Metric | Target |
|--------|--------|
| Message latency | < 100ms |
| Messages per second | Up to 10 |
| Concurrent connections | 1000+ |
| Message size | < 10KB each |
| Connection timeout | 30 minutes idle |

---

## Implementation Checklist

### Backend Tasks
- [ ] Create WebSocket endpoint at `/ws/chat`
- [ ] Implement session-based connection management
- [ ] Add JWT authentication
- [ ] Modify LangChain agent to stream ReAct steps
- [ ] Implement message serialization (use examples above)
- [ ] Add error handling and logging
- [ ] Rate limiting per session
- [ ] Write unit tests for message formatting
- [ ] Write integration tests with mock frontend

### Testing Tasks
- [ ] Test with `wscat` manually
- [ ] Test authentication flow
- [ ] Test reconnection behavior
- [ ] Test with multiple concurrent sessions
- [ ] Load testing (100+ connections)
- [ ] Verify message ordering
- [ ] Test error scenarios

### Deployment
- [ ] Environment variables for WebSocket URL
- [ ] SSL/TLS certificates for `wss://`
- [ ] WebSocket proxy configuration (Nginx/HAProxy)
- [ ] Monitoring and logging
- [ ] Health check endpoint

---

## Example LangChain Integration

```python
from langchain.agents import AgentExecutor
from langchain.callbacks.base import BaseCallbackHandler
import asyncio
import json

class WebSocketStreamHandler(BaseCallbackHandler):
    def __init__(self, websocket, session_id):
        self.websocket = websocket
        self.session_id = session_id
        
    async def on_agent_action(self, action, **kwargs):
        # Send thought
        await self.send_message({
            "type": "thought",
            "content": action.log,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        })
        
        # Send action start
        await self.send_message({
            "type": "action_start",
            "tool_name": action.tool,
            "tool_display_name": self.get_display_name(action.tool),
            "timestamp": datetime.utcnow().isoformat() + "Z"
        })
    
    async def on_tool_end(self, output, **kwargs):
        tool_name = kwargs.get('tool_name')
        duration = kwargs.get('duration_ms', 0)
        
        # Send action complete
        await self.send_message({
            "type": "action_complete",
            "tool_name": tool_name,
            "duration_ms": duration,
            "results": output,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        })
    
    async def send_message(self, data):
        await self.websocket.send_text(json.dumps(data))
```

---

## Support & Questions

**Frontend Lead**: Contact for TypeScript types, component specs  
**Documentation**: See `/frontend/doc/chat_interface_ai/` for full component specs

**Quick Links**:
- [Component Specifications](./03_COMPONENT_SPECIFICATION.md)
- [Technical Implementation](./04_TECHNICAL_IMPLEMENTATION.md)
- [Frontend Types](../../types/react-flow.ts)

---

**Status**: ✅ Frontend ready and waiting for backend WebSocket implementation
