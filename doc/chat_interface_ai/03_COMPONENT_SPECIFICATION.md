# Component Specification - Chi Tiết Kỹ Thuật Components

## 🎯 Mục Đích

Tài liệu này định nghĩa **API, props, state management** và implementation details cho tất cả các React components mới phục vụ cho AI reasoning visualization.

---

## 📦 Component Architecture Overview

```
┌────────────────────────────────────────────────┐
│           <ReActFlowContainer />               │
│  (Main container - manages the entire flow)    │
│  ┌──────────────────────────────────────────┐  │
│  │  <ConversationContext />                 │  │
│  │  (Patient info, symptoms summary)        │  │
│  └──────────────────────────────────────────┘  │
│                                                │
│  ┌──────────────────────────────────────────┐  │
│  │  <ReActTimeline />                       │  │
│  │  (Timeline of thought-action-obs steps)  │  │
│  │  ┌────────────────────────────────────┐  │  │
│  │  │ <ThoughtBubble />                  │  │  │
│  │  ├────────────────────────────────────┤  │  │
│  │  │ <ToolExecutionCard />              │  │  │
│  │  │   ├─ <CVInsightViewer />           │  │  │
│  │  │   └─ <TriageResultViewer />        │  │  │
│  │  ├────────────────────────────────────┤  │  │
│  │  │ <ObservationPanel />               │  │  │
│  │  │   └─ <ConfidenceMeter />           │  │  │
│  │  └────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────┘  │
│                                                │
│  ┌──────────────────────────────────────────┐  │
│  │  <RedFlagAlert />                        │  │
│  │  (Critical warnings if present)          │  │
│  └──────────────────────────────────────────┘  │
└────────────────────────────────────────────────┘
```

---

## Component #1: ReActFlowContainer

### Purpose
Top-level container quản lý toàn bộ ReAct flow visualization.

### API Specification

```typescript
interface ReActFlowContainerProps {
  sessionId: string;
  userId: string;
  onComplete?: (result: TriageResult) => void;
  showContext?: boolean; // Show conversation context
  enableInteractions?: boolean; // Enable click interactions
  className?: string;
}

function ReActFlowContainer({
  sessionId,
  userId,
  onComplete,
  showContext = true,
  enableInteractions = true,
  className
}: ReActFlowContainerProps): JSX.Element;
```

### State Management

```typescript
interface ReActFlowState {
  steps: ReActStep[]; // All thought-action-observation steps
  currentStepIndex: number;
  isProcessing: boolean;
  finalResult: TriageResult | null;
  conversationContext: ConversationContext | null;
  error: Error | null;
}

const useReActFlow = (sessionId: string, userId: string) => {
  const [state, setState] = useState<ReActFlowState>({
    steps: [],
    currentStepIndex: 0,
    isProcessing: false,
    finalResult: null,
    conversationContext: null,
    error: null
  });

  // WebSocket connection
  useEffect(() => {
    const ws = new WebSocket(`ws://api.medagen.com/ws/chat?session=${sessionId}`);

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      handleReActMessage(message);
    };

    return () => ws.close();
  }, [sessionId]);

  const handleReActMessage = (message: ReActMessage) => {
    switch (message.type) {
      case 'thought':
        addThoughtStep(message);
        break;
      case 'action_start':
        addActionStep(message);
        break;
      case 'action_complete':
        updateActionStep(message);
        break;
      case 'observation':
        addObservationStep(message);
        break;
      case 'final_answer':
        setFinalResult(message.result);
        break;
    }
  };

  return {
    steps: state.steps,
    isProcessing: state.isProcessing,
    finalResult: state.finalResult,
    error: state.error
  };
};
```

### Implementation

```tsx
export function ReActFlowContainer({
  sessionId,
  userId,
  onComplete,
  showContext = true,
  enableInteractions = true,
  className
}: ReActFlowContainerProps) {
  const { steps, isProcessing, finalResult, error } = useReActFlow(sessionId, userId);
  const { conversationContext } = useConversationContext(sessionId, userId);

  useEffect(() => {
    if (finalResult && onComplete) {
      onComplete(finalResult);
    }
  }, [finalResult, onComplete]);

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Conversation Context */}
      {showContext && conversationContext && (
        <ConversationContext data={conversationContext} />
      )}

      {/* ReAct Timeline */}
      <ReActTimeline 
        steps={steps} 
        enableInteractions={enableInteractions}
      />

      {/* Red Flag Alerts */}
      {finalResult?.red_flags && finalResult.red_flags.length > 0 && (
        <RedFlagAlert redFlags={finalResult.red_flags} />
      )}

      {/* Processing Indicator */}
      {isProcessing && (
        <ProcessingIndicator />
      )}
    </div>
  );
}
```

---

## Component #2: ThoughtBubble

### Purpose
Hiển thị một "thought" step trong ReAct flow.

### API Specification

```typescript
interface ThoughtBubbleProps {
  thought: string;
  timestamp: string;
  stepNumber: number;
  variant?: 'initial' | 'intermediate' | 'final';
  className?: string;
}

function ThoughtBubble({
  thought,
  timestamp,
  stepNumber,
  variant = 'intermediate',
  className
}: ThoughtBubbleProps): JSX.Element;
```

### Implementation

```tsx
export function ThoughtBubble({
  thought,
  timestamp,
  stepNumber,
  variant = 'intermediate',
  className
}: ThoughtBubbleProps) {
  const variantStyles = {
    initial: 'border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/50',
    intermediate: 'border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/50',
    final: 'border-l-green-500 bg-green-50/50 dark:bg-green-950/50'
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex gap-3 items-start"
    >
      {/* AI Avatar */}
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src="/ai-avatar.png" />
        <AvatarFallback>AI</AvatarFallback>
      </Avatar>

      {/* Thought Card */}
      <Card className={cn(
        'flex-1 border-l-4',
        variantStyles[variant],
        className
      )}>
        <CardHeader className="pb-2 pt-3">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="gap-1">
              <Brain className="h-3 w-3" />
              Thought #{stepNumber}
            </Badge>
            <time className="text-xs text-muted-foreground">
              {formatTime(timestamp)}
            </time>
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <p className="text-sm italic text-muted-foreground flex items-start gap-2">
            <MessageCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{thought}</span>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
```

---

## Component #3: ToolExecutionCard

### Purpose
Hiển thị tool execution với expandable details.

### API Specification

```typescript
interface ToolExecutionCardProps {
  toolName: string;
  displayName: string;
  status: 'pending' | 'running' | 'complete' | 'error';
  duration?: number; // milliseconds
  results?: ToolResults;
  stepNumber: number;
  onExpand?: (expanded: boolean) => void;
  initialExpanded?: boolean;
  showWhyButton?: boolean;
  className?: string;
}

type ToolResults = 
  | CVResults
  | TriageResults
  | GuidelineResults;

interface CVResults {
  predictions: Array<{
    condition: string;
    confidence: number;
  }>;
  visual_features: string[];
  model_info: {
    name: string;
    accuracy: number;
  };
}

interface TriageResults {
  triage_level: 'emergency' | 'urgent' | 'routine' | 'self_care';
  red_flags: string[];
  reasoning: string;
}

interface GuidelineResults {
  guidelines: Array<{
    title: string;
    content: string;
    source: string;
  }>;
}
```

### Implementation

```tsx
export function ToolExecutionCard({
  toolName,
  displayName,
  status,
  duration,
  results,
  stepNumber,
  onExpand,
  initialExpanded = false,
  showWhyButton = true,
  className
}: ToolExecutionCardProps) {
  const [expanded, setExpanded] = useState(initialExpanded);
  const [showWhyModal, setShowWhyModal] = useState(false);

  const handleToggle = () => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    onExpand?.(newExpanded);
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'complete':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'running': return 'bg-blue-500';
      case 'complete': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex gap-3 items-start"
      >
        {/* Tool Icon */}
        <div className={cn(
          'h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0',
          getStatusColor(),
          status === 'running' && 'animate-pulse'
        )}>
          <Wrench className="h-4 w-4 text-white" />
        </div>

        {/* Tool Card */}
        <Card className={cn('flex-1', className)}>
          <CardHeader 
            className="pb-2 pt-3 cursor-pointer hover:bg-accent/50 transition"
            onClick={handleToggle}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    <Cog className="h-3 w-3 mr-1" />
                    Tool #{stepNumber}
                  </Badge>
                  <CardTitle className="text-base">{displayName}</CardTitle>
                </div>
                {getStatusIcon()}
              </div>
              <Button variant="ghost" size="sm">
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
            
            {duration && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Timer className="h-3 w-3" />
                {(duration / 1000).toFixed(2)}s
              </p>
            )}
          </CardHeader>

          <AnimatePresence>
            {expanded && results && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <CardContent className="pt-0 pb-3">
                  <Separator className="mb-3" />
                  <ToolResultsDisplay 
                    toolName={toolName} 
                    results={results} 
                  />

                  <div className="flex gap-2 mt-3">
                    {showWhyButton && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowWhyModal(true)}
                      >
                        <HelpCircle className="h-3 w-3 mr-1" />
                        Why this tool?
                      </Button>
                    )}
                    <Button variant="ghost" size="sm">
                      <Code className="h-3 w-3 mr-1" />
                      View raw data
                    </Button>
                  </div>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      {/* Why This Tool Modal */}
      {showWhyModal && (
        <WhyThisToolModal
          toolName={toolName}
          displayName={displayName}
          onClose={() => setShowWhyModal(false)}
        />
      )}
    </>
  );
}
```

---

## Component #4: CV InsightViewer

### Purpose
Hiển thị chi tiết kết quả Computer Vision analysis.

### API Specification

```typescript
interface CVInsightViewerProps {
  results: CVResults;
  imageUrl?: string;
  showAnnotations?: boolean;
  interactive?: boolean;
}

function CVInsightViewer({
  results,
  imageUrl,
  showAnnotations = false,
  interactive = true
}: CVInsightViewerProps): JSX.Element;
```

### Implementation

```tsx
export function CVInsightViewer({
  results,
  imageUrl,
  showAnnotations = false,
  interactive = true
}: CVInsightViewerProps) {
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'predictions' | 'annotated'>('predictions');

  return (
    <div className="space-y-4">
      {/* View Mode Toggle */}
      {imageUrl && (
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
          <TabsList>
            <TabsTrigger value="predictions">
              <BarChart4 className="h-4 w-4 mr-2" />
              Predictions
            </TabsTrigger>
            <TabsTrigger value="annotated">
              <ImageIcon className="h-4 w-4 mr-2" />
              Annotated Image
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {/* Predictions View */}
      {viewMode === 'predictions' && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <BarChart4 className="h-4 w-4" />
            Model Predictions
          </h4>
          {results.predictions.map((pred, idx) => (
            <Tooltip key={idx}>
              <TooltipTrigger asChild>
                <div 
                  className={cn(
                    'flex items-center justify-between p-2 rounded-lg',
                    'hover:bg-accent cursor-pointer transition',
                    selectedCondition === pred.condition && 'bg-accent'
                  )}
                  onMouseEnter={() => interactive && setSelectedCondition(pred.condition)}
                  onMouseLeave={() => interactive && setSelectedCondition(null)}
                >
                  <span className="text-sm font-medium">{pred.condition}</span>
                  <div className="flex items-center gap-2">
                    <ConfidenceMeter value={pred.confidence} compact />
                    <span className="text-sm font-semibold">
                      {(pred.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="w-80">
                <ConditionDetailsTooltip 
                  condition={pred.condition}
                  confidence={pred.confidence}
                />
              </TooltipContent>
            </Tooltip>
          ))}

          {/* Visual Features */}
          {results.visual_features && results.visual_features.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                <Eye className="h-4 w-4" />
                Detected Visual Features
              </h4>
              <ul className="space-y-1">
                {results.visual_features.map((feature, idx) => (
                  <li key={idx} className="text-sm flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Model Info */}
          {results.model_info && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <h4 className="text-xs font-semibold mb-1">Model Information</h4>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Model: {results.model_info.name}</p>
                <p>Validation Accuracy: {(results.model_info.accuracy * 100).toFixed(1)}%</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Annotated Image View */}
      {viewMode === 'annotated' && imageUrl && (
        <AnnotatedImageViewer 
          imageUrl={imageUrl}
          annotations={results.annotations}
        />
      )}
    </div>
  );
}
```

---

## Component #5: ConfidenceMeter

### Purpose
Hiển thị độ tin cậy dưới dạng progress bar với màu sắc.

### API Specification

```typescript
interface ConfidenceMeterProps {
  value: number; // 0.0 to 1.0
  showLabel?: boolean;
  showTooltip?: boolean;
  compact?: boolean;
  className?: string;
}

function ConfidenceMeter({
  value,
  showLabel = true,
  showTooltip = true,
  compact = false,
  className
}: ConfidenceMeterProps): JSX.Element;
```

### Implementation

```tsx
export function ConfidenceMeter({
  value,
  showLabel = true,
  showTooltip = true,
  compact = false,
  className
}: ConfidenceMeterProps) {
  const percentage = Math.round(value * 100);

  const getColor = () => {
    if (value >= 0.8) return 'bg-green-500';
    if (value >= 0.5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getTextColor = () => {
    if (value >= 0.8) return 'text-green-600';
    if (value >= 0.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getInterpretation = () => {
    if (value >= 0.8) return 'High confidence - Model is very certain';
    if (value >= 0.5) return 'Medium confidence - Consider additional factors';
    return 'Low confidence - Seek professional opinion';
  };

  const meter = (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn(
        'flex-1 bg-secondary rounded-full overflow-hidden',
        compact ? 'h-1.5' : 'h-2'
      )}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={cn('h-full', getColor())}
        />
      </div>
      {showLabel && (
        <span className={cn(
          'font-semibold',
          compact ? 'text-xs' : 'text-sm',
          getTextColor()
        )}>
          {percentage}%
        </span>
      )}
    </div>
  );

  if (!showTooltip) {
    return meter;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {meter}
      </TooltipTrigger>
      <TooltipContent>
        <div className="space-y-1">
          <p className="font-medium">{getInterpretation()}</p>
          <p className="text-xs text-muted-foreground">
            Uncertainty range: ±{Math.round((1 - value) * 10)}%
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
```

---

## Component #6: RedFlagAlert

### Purpose
Hiển thị red flags với animation và emergency actions.

### API Specification

```typescript
interface RedFlagAlertProps {
  redFlags: RedFlag[];
  triageLevel: 'emergency' | 'urgent' | 'routine' | 'self_care';
  recommendation: string;
  onEmergencyCall?: () => void;
  onFindHospital?: () => void;
}

interface RedFlag {
  symptom: string;
  risk: string;
  severity: 'critical' | 'high' | 'medium';
}
```

### Implementation

```tsx
export function RedFlagAlert({
  redFlags,
  triageLevel,
  recommendation,
  onEmergencyCall,
  onFindHospital
}: RedFlagAlertProps) {
  if (redFlags.length === 0) return null;

  const isEmergency = triageLevel === 'emergency';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'border-2 rounded-lg p-4',
        isEmergency && 'border-red-500 bg-red-50 dark:bg-red-950/30 red-flag-pulse'
      )}
    >
      <Alert variant={isEmergency ? 'destructive' : 'default'}>
        <AlertTriangle className="h-5 w-5" />
        <AlertTitle className="flex items-center gap-2">
          {isEmergency && '🚨'} RED FLAGS DETECTED
        </AlertTitle>
        <AlertDescription>
          <div className="space-y-3 mt-3">
            {redFlags.map((flag, idx) => (
              <div key={idx} className="flex gap-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-red-500" />
                <div>
                  <p className="font-semibold text-sm">{flag.symptom}</p>
                  <p className="text-xs text-muted-foreground">{flag.risk}</p>
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="p-3 bg-background rounded-md">
            <p className="font-semibold flex items-center gap-2">
              <Hospital className="h-4 w-4" />
              RECOMMENDATION
            </p>
            <p className="text-sm mt-1">{recommendation}</p>
          </div>

          {isEmergency && (
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <Button 
                variant="destructive" 
                className="flex-1"
                onClick={onEmergencyCall}
              >
                <Phone className="h-4 w-4 mr-2" />
                Call Emergency: 115
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={onFindHospital}
              >
                <MapPin className="h-4 w-4 mr-2" />
                Find Nearest Hospital
              </Button>
            </div>
          )}
        </AlertDescription>
      </Alert>
    </motion.div>
  );
}

// CSS
const pulseRedAnimation = `
@keyframes red-flag-pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
  }
  50% {
    box-shadow: 0 0 20px 10px rgba(239, 68, 68, 0.3);
  }
}

.red-flag-pulse {
  animation: red-flag-pulse 2s infinite;
}
`;
```

---

## 📊 State Management với Zustand

```typescript
// stores/reactFlowStore.ts
import create from 'zustand';

interface ReActFlowStore {
  // State
  steps: ReActStep[];
  currentStepIndex: number;
  isProcessing: boolean;
  finalResult: TriageResult | null;
  
  // Actions
  addThoughtStep: (thought: string, timestamp: string) => void;
  addActionStep: (toolName: string, displayName: string) => void;
  updateActionStep: (toolName: string, status: ToolStatus, results?: any) => void;
  addObservationStep: (toolName: string, findings: any) => void;
  setFinalResult: (result: TriageResult) => void;
  reset: () => void;
}

export const useReActFlowStore = create<ReActFlowStore>((set) => ({
  steps: [],
  currentStepIndex: 0,
  isProcessing: false,
  finalResult: null,

  addThoughtStep: (thought, timestamp) => 
    set((state) => ({
      steps: [
        ...state.steps,
        {
          type: 'thought',
          content: thought,
          timestamp,
          stepNumber: state.steps.length + 1
        }
      ],
      currentStepIndex: state.steps.length
    })),

  addActionStep: (toolName, displayName) =>
    set((state) => ({
      steps: [
        ...state.steps,
        {
          type: 'action',
          toolName,
          displayName,
          status: 'running',
          timestamp: new Date().toISOString(),
          stepNumber: state.steps.length + 1
        }
      ],
      isProcessing: true
    })),

  updateActionStep: (toolName, status, results) =>
    set((state) => ({
      steps: state.steps.map(step =>
        step.type === 'action' && step.toolName === toolName
          ? { ...step, status, results, duration: Date.now() - new Date(step.timestamp).getTime() }
          : step
      ),
      isProcessing: status === 'running'
    })),

  addObservationStep: (toolName, findings) =>
    set((state) => ({
      steps: [
        ...state.steps,
        {
          type: 'observation',
          toolName,
          findings,
          timestamp: new Date().toISOString(),
          stepNumber: state.steps.length + 1
        }
      ]
    })),

  setFinalResult: (result) =>
    set({ finalResult: result, isProcessing: false }),

  reset: () =>
    set({
      steps: [],
      currentStepIndex: 0,
      isProcessing: false,
      finalResult: null
    })
}));
```

---

## ✅ Testing Checklist

- [ ] Unit tests cho mỗi component
- [ ] Integration tests cho ReActFlowContainer
- [ ] Snapshot tests cho UI consistency
- [ ] Accessibility tests (ARIA, keyboard nav)
- [ ] Performance tests (large number of steps)
- [ ] WebSocket message handling tests
- [ ] Error state tests
- [ ] Responsive layout tests

---

**Next**: [04_TECHNICAL_IMPLEMENTATION.md](./04_TECHNICAL_IMPLEMENTATION.md) - Hướng dẫn implementation chi tiết
