# AI Reasoning Visualization - ReAct Flow Interface

## 🎯 Mục Đích

Thiết kế giao diện hiển thị **quá trình suy luận (ReAct flow)** của AI một cách trực quan, giúp người dùng:
- Hiểu AI đang "nghĩ" gì
- Thấy AI đang dùng công cụ nào
- Quan sát kết quả từ mỗi công cụ
- Tin tưởng vào quyết định cuối cùng

---

## 🧠 Hiểu Về ReAct Pattern

### Định Nghĩa

**ReAct** = **Re**asoning + **Act**ing

```
Thought → Action → Observation → Thought → Action → ... → Final Answer
  💭        🛠️         👁️          💭        🛠️              ✅
```

### Ví Dụ Thực Tế

**Input người dùng**: "Da tay em nổi mẩn đỏ ngứa 2 ngày, đây là ảnh" [📷]

**ReAct Flow của AI**:

```
Step 1: THOUGHT
💭 "Người dùng mô tả vấn đề da và có ảnh đính kèm. 
    Tôi nên phân tích ảnh bằng công cụ dermatology CV."

Step 2: ACTION
🛠️ Tool: derm_cv
   Input: { image_url: "..." }
   Status: Running... ⏳

Step 3: OBSERVATION  
👁️ Tool Results:
   {
     "predictions": [
       { "condition": "Eczema", "confidence": 0.87 },
       { "condition": "Psoriasis", "confidence": 0.11 },
       { "condition": "Contact Dermatitis", "confidence": 0.02 }
     ]
   }

Step 4: THOUGHT
💭 "Độ tin cậy Eczema cao (87%). Bây giờ tôi cần đánh giá 
    mức độ nghiêm trọng để phân loại triage."

Step 5: ACTION
🛠️ Tool: triage_rules
   Input: { 
     symptoms: ["rash", "itching"],
     duration_days: 2,
     severity: "moderate"
   }
   Status: Running... ⏳

Step 6: OBSERVATION
👁️ Tool Results:
   {
     "triage_level": "routine",
     "red_flags": [],
     "reasoning": "Triệu chứng nhẹ đến trung bình, không có dấu hiệu nguy hiểm"
   }

Step 7: THOUGHT
💭 "Đã có đủ thông tin. Tôi sẽ tạo câu trả lời cuối cùng."

Step 8: FINAL ANSWER
✅ {
     "triage_level": "routine",
     "suspected_conditions": [
       { "name": "Eczema", "confidence": "high" }
     ],
     "recommendation": "Khám bác sĩ da liễu trong vòng 1 tuần"
   }
```

---

## 🎨 UI Design Concepts

### Concept 1: Timeline View (Dòng Thời Gian)

**Ý tưởng**: Hiển thị ReAct flow như một timeline theo chiều dọc

```
┌─────────────────────────────────────────────────────────┐
│  [User] Da tay em nổi mẩn đỏ... [📷]                   │
└────────────────┬────────────────────────────────────────┘
                 ↓
┌────────────────────────────────────────────────────────┐
│  💭 THOUGHT #1                                   10:30 │
│  ┌──────────────────────────────────────────────────┐  │
│  │ "Người dùng có ảnh. Tôi sẽ phân tích bằng      │  │
│  │  công cụ dermatology CV..."                    │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────┬───────────────────────────────────────┘
                 ↓
┌────────────────────────────────────────────────────────┐
│  🛠️ ACTION #1: derm_cv                          10:30 │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Status: ✅ Completed (1.2s)                     │  │
│  │                                                  │  │
│  │ [Expand Details ▼]                              │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────┬───────────────────────────────────────┘
                 ↓
┌────────────────────────────────────────────────────────┐
│  👁️ OBSERVATION #1                              10:30 │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 📊 Predictions:                                  │  │
│  │   • Eczema         ████████▓░ 87%              │  │
│  │   • Psoriasis      █▓░░░░░░░░ 11%              │  │
│  │   • Contact Derm.  ▓░░░░░░░░░  2%              │  │
│  │                                                  │  │
│  │ [View Full Analysis →]                          │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────┬───────────────────────────────────────┘
                 ↓
┌────────────────────────────────────────────────────────┐
│  💭 THOUGHT #2                                   10:31 │
│  ┌──────────────────────────────────────────────────┐  │
│  │ "Độ tin cậy Eczema cao. Tiếp tục đánh giá      │  │
│  │  mức độ nghiêm trọng..."                       │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────┬───────────────────────────────────────┘
                 ↓
   ... (tiếp tục với các steps khác)
```

**Ưu điểm**:
- ✅ Clear progression - rõ ràng từng bước
- ✅ Easy to follow - dễ theo dõi
- ✅ Familiar pattern - quen thuộc với user

**Nhược điểm**:
- ❌ Dài khi có nhiều steps
- ❌ Khó nhìn tổng quan

---

### Concept 2: Graph View (Biểu Đồ Nút)

**Ý tưởng**: Hiển thị như một graph nodes có thể zoom/pan

```
                    [User Input]
                         ↓
                   [💭 Thought 1]
                         ↓
        ┌────────────────┼────────────────┐
        ↓                ↓                ↓
   [🛠️ derm_cv]    [💭 Thought]    [🛠️ triage]
        ↓                                 ↓
   [👁️ Observe 1]                   [👁️ Observe 2]
        └────────────────┬────────────────┘
                         ↓
                   [💭 Thought 3]
                         ↓
                   [✅ Final Answer]
```

**Interactions**:
- Click node → Expand details
- Hover → Preview content
- Zoom in/out
- Pan around

**Ưu điểm**:
- ✅ Hiển thị tổng quan tốt
- ✅ Interactive và "cool"
- ✅ Thấy được parallel execution

**Nhược điểm**:
- ❌ Phức tạp hơn để implement
- ❌ Có thể khó hiểu với người dùng không tech-savvy

---

### Concept 3: Hybrid - Collapsible Cards + Timeline (RECOMMENDED ⭐)

**Ý tưởng**: Kết hợp timeline và cards, có thể collapse/expand

```
┌────────────────────────────────────────────────────────┐
│  [User] Da tay em nổi mẩn... [📷]                      │
└────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────┐
│  💭 AI is thinking...                            [―]  │
│  "Phát hiện hình ảnh. Sử dụng dermatology CV..."       │
└────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────┐
│  🛠️ Dermatology Analysis                         [▼]  │
│  ┌──────────────────────────────────────────────────┐  │
│  │ ⏱️ Analyzing image... 1.2s                       │  │
│  │                                                  │  │
│  │ 📊 Results:                                      │  │
│  │ ┌────────────────────────────────────────────┐  │  │
│  │ │ Eczema             87% ████████▓░          │  │  │
│  │ │ Psoriasis          11% █▓░░░░░░░░          │  │  │
│  │ │ Contact Dermatitis  2% ▓░░░░░░░░░          │  │  │
│  │ └────────────────────────────────────────────┘  │  │
│  │                                                  │  │
│  │ 🔍 Detected features:                            │  │
│  │   • Redness and inflammation                    │  │
│  │   • Dry, scaly patches                          │  │
│  │   • No vesicles or pustules                     │  │
│  │                                                  │  │
│  │ [Why this tool? ❓] [View raw data →]          │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────┐
│  🛠️ Triage Assessment                            [▼]  │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 🎯 Evaluating severity...                        │  │
│  │                                                  │  │
│  │ ✅ Classification: Routine Care                  │  │
│  │ 🏥 Urgency Level: Low                            │  │
│  │ 🚨 Red Flags: None detected                      │  │
│  │                                                  │  │
│  │ [Why this tool? ❓]                             │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────┐
│  [AI] Dựa trên phân tích, em có thể bị Eczema...      │
└────────────────────────────────────────────────────────┘
```

**Ưu điểm**:
- ✅ Cân bằng giữa chi tiết và tổng quan
- ✅ User có control (expand/collapse)
- ✅ Dễ implement
- ✅ Mobile-friendly

**→ ĐỀ XUẤT SỬ DỤNG CONCEPT NÀY**

---

## 🎭 Component Designs

### 1. ThoughtBubble Component

```tsx
interface ThoughtBubbleProps {
  thought: string;
  timestamp: string;
  index: number; // Step number
  variant?: 'initial' | 'intermediate' | 'final';
}

function ThoughtBubble({ thought, timestamp, index, variant }: ThoughtBubbleProps) {
  return (
    <div className="flex gap-2 items-start">
      {/* Avatar */}
      <Avatar className="h-8 w-8">
        <AvatarImage src="/ai-avatar.png" />
        <AvatarFallback>AI</AvatarFallback>
      </Avatar>

      {/* Thought Content */}
      <Card className={cn(
        "flex-1 border-l-4",
        variant === 'initial' && "border-l-blue-500",
        variant === 'intermediate' && "border-l-amber-500",
        variant === 'final' && "border-l-green-500"
      )}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="gap-1">
              <Brain className="h-3 w-3" />
              Thought #{index}
            </Badge>
            <span className="text-xs text-muted-foreground">{timestamp}</span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm italic text-muted-foreground">
            💭 "{thought}"
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
```

**Visual States**:
- 🟦 Initial (Blue) - Thought đầu tiên
- 🟧 Intermediate (Amber) - Thoughts giữa chừng
- 🟩 Final (Green) - Thought cuối cùng trước kết quả

---

### 2. ToolExecutionCard Component

```tsx
interface ToolExecutionCardProps {
  toolName: string;
  displayName: string;
  status: 'pending' | 'running' | 'complete' | 'error';
  duration?: number; // in seconds
  results?: any;
  onExpand?: () => void;
  expanded?: boolean;
}

function ToolExecutionCard({
  toolName,
  displayName,
  status,
  duration,
  results,
  onExpand,
  expanded = false
}: ToolExecutionCardProps) {
  return (
    <div className="flex gap-2 items-start">
      {/* Tool Icon */}
      <div className={cn(
        "h-8 w-8 rounded-full flex items-center justify-center",
        status === 'running' && "animate-pulse bg-blue-500",
        status === 'complete' && "bg-green-500",
        status === 'error' && "bg-red-500",
        status === 'pending' && "bg-gray-400"
      )}>
        <Wrench className="h-4 w-4 text-white" />
      </div>

      {/* Tool Card */}
      <Card className="flex-1">
        <CardHeader 
          className="pb-2 cursor-pointer"
          onClick={onExpand}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">{displayName}</CardTitle>
              {status === 'running' && (
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              )}
              {status === 'complete' && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
            </div>
            <Button variant="ghost" size="sm">
              {expanded ? <ChevronUp /> : <ChevronDown />}
            </Button>
          </div>
          {duration && (
            <p className="text-xs text-muted-foreground">
              ⏱️ {duration.toFixed(1)}s
            </p>
          )}
        </CardHeader>

        {expanded && results && (
          <CardContent>
            <ToolResultsDisplay 
              toolName={toolName} 
              results={results} 
            />
          </CardContent>
        )}
      </Card>
    </div>
  );
}
```

---

### 3. ObservationPanel Component

```tsx
interface ObservationPanelProps {
  toolName: string;
  results: ToolResults;
  confidence?: number;
}

function ObservationPanel({ toolName, results, confidence }: ObservationPanelProps) {
  return (
    <div className="flex gap-2 items-start">
      <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center">
        <Eye className="h-4 w-4 text-white" />
      </div>

      <Card className="flex-1 border-l-4 border-l-purple-500">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Badge variant="outline">
              <Eye className="h-3 w-3 mr-1" />
              Observation
            </Badge>
            {confidence && (
              <ConfidenceMeter value={confidence} />
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Dynamic rendering based on tool type */}
          {toolName === 'derm_cv' && <CVResultsDisplay results={results} />}
          {toolName === 'triage_rules' && <TriageResultsDisplay results={results} />}
          {toolName === 'guideline_retrieval' && <GuidelineDisplay results={results} />}
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 🎬 Animation Patterns

### Entry Animations

```typescript
// Framer Motion variants
const thoughtVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.3, ease: 'easeOut' }
  }
};

const toolVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.4, ease: 'backOut' }
  }
};

// Usage
<motion.div
  variants={thoughtVariants}
  initial="hidden"
  animate="visible"
>
  <ThoughtBubble />
</motion.div>
```

### Running State Animation

```css
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
```

### Completion Animation

```typescript
// Confetti on successful completion
import confetti from 'canvas-confetti';

const onToolComplete = () => {
  confetti({
    particleCount: 30,
    spread: 60,
    origin: { y: 0.6 }
  });
};
```

---

## 📱 Responsive Behavior

### Desktop (>1024px)
```
┌──────────────────────────────────┐
│  Timeline on left (60%)          │
│  ┌───────────────┐                │
│  │ Thought       │                │
│  │ Tool          │  Details       │
│  │ Observation   │  Panel (40%)   │
│  │ ...           │                │
│  └───────────────┘                │
└──────────────────────────────────┘
```

### Tablet (768px - 1024px)
```
┌──────────────────────────────────┐
│  Full width timeline             │
│  ┌───────────────────────────┐   │
│  │ Thought                   │   │
│  │ Tool (collapsed by default)│   │
│  │ Observation               │   │
│  └───────────────────────────┘   │
└──────────────────────────────────┘
```

### Mobile (<768px)
```
┌────────────────┐
│  Compact cards │
│  ┌──────────┐  │
│  │ 💭 #1    │  │
│  │ 🛠️ Tool  │  │
│  │ 👁️ Obs   │  │
│  └──────────┘  │
└────────────────┘
```

---

## 🎯 User Interactions

### 1. Expandable Tools
```
[Collapsed State]
┌────────────────────────────┐
│ 🛠️ derm_cv    ✅ 1.2s  [▼]│
└────────────────────────────┘

[Expanded State]
┌────────────────────────────┐
│ 🛠️ derm_cv    ✅ 1.2s  [▲]│
│ ┌────────────────────────┐ │
│ │ Full results...        │ │
│ │ [Why this tool? ❓]    │ │
│ └────────────────────────┘ │
└────────────────────────────┘
```

### 2. "Why This?" Explanations
```
User clicks "Why this tool?"
   ↓
Modal opens:
┌──────────────────────────────────┐
│  ❓ Why did I use derm_cv?       │
│  ┌──────────────────────────────┐│
│  │ I detected these signals:    ││
│  │ • User mentioned "skin rash" ││
│  │ • Image was uploaded         ││
│  │ • Symptoms match dermatology ││
│  │                              ││
│  │ So I chose the dermatology   ││
│  │ computer vision tool to      ││
│  │ analyze the skin condition.  ││
│  └──────────────────────────────┘│
│  [ Got it ✓ ]                    │
└──────────────────────────────────┘
```

### 3. Confidence Tooltips
```
Hover over confidence meter
   ↓
Tooltip shows:
┌────────────────────────┐
│ Confidence Breakdown   │
│ • Model accuracy: 92%  │
│ • Sample size: 10K     │
│ • Validation: Passed   │
└────────────────────────┘
```

---

## 🔄 Real-Time Updates (WebSocket)

### Data Flow
```
Backend (Agent)   →   WebSocket   →   Frontend
    ↓                     ↓               ↓
  Thought            ws.send()      updateReActFlow()
    ↓                     ↓               ↓
  Action start       ws.send()      showToolRunning()
    ↓                     ↓               ↓
  Action complete    ws.send()      showToolResults()
    ↓                     ↓               ↓
  Observation        ws.send()      addObservation()
```

### WebSocket Message Format

```typescript
// Thought step
{
  type: 'thought',
  content: 'User mentioned hand symptoms...',
  step_number: 1,
  timestamp: '2024-11-22T10:30:00Z'
}

// Action start
{
  type: 'action_start',
  tool_name: 'derm_cv',
  tool_display_name: 'Dermatology CV',
  step_number: 2,
  timestamp: '2024-11-22T10:30:01Z'
}

// Action complete
{
  type: 'action_complete',
  tool_name: 'derm_cv',
  duration_ms: 1200,
  results: { ... },
  step_number: 2,
  timestamp: '2024-11-22T10:30:02.2Z'
}

// Observation
{
  type: 'observation',
  tool_name: 'derm_cv',
  findings: { ... },
  confidence: 0.87,
  step_number: 3,
  timestamp: '2024-11-22T10:30:02.3Z'
}

// Final answer
{
  type: 'final_answer',
  result: { ... },
  timestamp: '2024-11-22T10:30:05Z'
}
```

---

## ✅ Checklist

- [ ] Implement ThoughtBubble component
- [ ] Implement ToolExecutionCard component
- [ ] Implement ObservationPanel component
- [ ] Add expand/collapse functionality
- [ ] Implement "Why this tool?" modal
- [ ] Add confidence meters
- [ ] Implement entry animations
- [ ] Add WebSocket listeners for real-time updates
- [ ] Handle responsive layouts
- [ ] Add accessibility (ARIA labels, keyboard navigation)
- [ ] Error state handling for failed tools

---

**Next**: [02_INTERACTIVE_PATTERNS.md](./02_INTERACTIVE_PATTERNS.md) - Interactive UI patterns và user engagement features
