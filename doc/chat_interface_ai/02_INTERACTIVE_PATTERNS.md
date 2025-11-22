# Interactive Patterns - Tương Tác Người Dùng

## 🎯 Mục Đích

Thiết kế các **interaction patterns đột phá** giúp người dùng không chỉ xem mà còn **tương tác sâu** với quá trình suy luận của AI, tạo trải nghiệm "wow" và tăng độ tin cậy.

---

## 💡 Core Interactive Features

### 1. **Expandable Tool Cards** - Mở Rộng Công Cụ

#### Concept
Người dùng có thể click để xem chi tiết từng bước AI thực hiện.

#### States

```
[Collapsed - Default]
┌──────────────────────────────────────────┐
│ 🛠️ Dermatology Analysis    ✅ 1.2s  [▼]│
└──────────────────────────────────────────┘

[Expanded - On Click]
┌──────────────────────────────────────────┐
│ 🛠️ Dermatology Analysis    ✅ 1.2s  [▲]│
│ ┌────────────────────────────────────────┐│
│ │ 📊 Model Predictions:                  ││
│ │ ┌────────────────────────────────────┐ ││
│ │ │ Eczema         87% ████████▓░      │ ││
│ │ │ Psoriasis      11% █▓░░░░░░░░      │ ││
│ │ │ Contact Derm.   2% ▓░░░░░░░░░      │ ││
│ │ └────────────────────────────────────┘ ││
│ │                                        ││
│ │ 🔍 Detected Visual Features:           ││
│ │   • Erythema (redness) - High          ││
│ │   • Dry scaly patches - Present        ││
│ │   • Vesicles - Not detected            ││
│ │                                        ││
│ │ 🧪 Model Info:                         ││
│ │   Model: DermNet-ResNet50              ││
│ │   Trained on: 23,000 cases             ││
│ │   Validation accuracy: 91.2%           ││
│ │                                        ││
│ │ [🔎 View Raw JSON] [❓ Why this?]     ││
│ └────────────────────────────────────────┘│
└──────────────────────────────────────────┘
```

#### Implementation

```tsx
function ExpandableToolCard({ tool, results }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card>
      <CardHeader 
        className="cursor-pointer hover:bg-accent/50 transition"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <h3>{tool.displayName}</h3>
          <ChevronDown className={cn(
            "transition-transform",
            expanded && "rotate-180"
          )} />
        </div>
      </CardHeader>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <CardContent>
              <DetailedResults results={results} />
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
```

---

### 2. **"Why This?" Explanations** - Giải Thích Tại Sao

#### Concept
Mỗi công cụ đều có nút "Why this?" để AI giải thích tại sao chọn công cụ đó.

#### User Flow

```
User sees: 🛠️ derm_cv tool was used
    ↓
User clicks: [❓ Why this tool?]
    ↓
Modal appears with explanation
    ↓
User understands reasoning → Trust increased ✓
```

#### Modal Design

```
┌─────────────────────────────────────────────┐
│  ❓ Why did I use Dermatology CV?          │
├─────────────────────────────────────────────┤
│                                             │
│  I chose this tool because:                 │
│                                             │
│  ✓ You mentioned "skin rash"                │
│    → Indicates dermatological condition     │
│                                             │
│  ✓ You uploaded an image                    │
│    → Visual analysis needed                 │
│                                             │
│  ✓ Symptoms match skin conditions           │
│    → Dermatology CV provides accurate       │
│      identification of skin lesions         │
│                                             │
│  Alternative tools considered:              │
│  • wound_cv - Ruled out (no open wound)     │
│  • text-only diagnosis - Less accurate      │
│                                             │
│  [ Got it! ✓ ]                              │
└─────────────────────────────────────────────┘
```

#### Implementation

```tsx
function WhyThisButton({ tool, context }: Props) {
  const [showExplanation, setShowExplanation] = useState(false);

  const getExplanation = () => {
    // Could be generated by AI or pre-defined
    return {
      reasons: [
        {
          signal: context.userMention,
          explanation: 'User mentioned dermatological symptoms'
        },
        {
          signal: context.hasImage,
          explanation: 'Image uploaded, visual analysis needed'
        }
      ],
      alternatives: [
        { tool: 'wound_cv', reason: 'No open wound detected' }
      ]
    };
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => setShowExplanation(true)}
      >
        <HelpCircle className="h-4 w-4 mr-1" />
        Why this tool?
      </Button>

      <Dialog open={showExplanation} onOpenChange={setShowExplanation}>
        <DialogContent>
          <ExplanationDisplay explanation={getExplanation()} />
        </DialogContent>
      </Dialog>
    </>
  );
}
```

---

### 3. **Interactive CV Results** - Kết Quả CV Tương Tác

#### Concept
Kết quả phân tích hình ảnh không chỉ hiển thị số liệu mà còn interactive.

#### Features

##### A. Hover to Highlight
```
User hovers over "Eczema 87%"
    ↓
Hiển thị thêm:
┌────────────────────────────────────┐
│ 🔍 Eczema (Atopic Dermatitis)     │
│ ┌────────────────────────────────┐ │
│ │ Confidence: 87%                │ │
│ │                                │ │
│ │ Key indicators detected:       │ │
│ │ • Dry, scaly patches           │ │
│ │ • Erythema present             │ │
│ │ • Typical distribution         │ │
│ │                                │ │
│ │ [Learn more about Eczema →]   │ │
│ └────────────────────────────────┘ │
└────────────────────────────────────┘
```

##### B. Image Annotation
```
User clicks "View analyzed image"
    ↓
Hiển thị ảnh gốc với annotations:

┌────────────────────────────────────┐
│  [Original Image with overlays]    │
│                                    │
│     [Annotated region 1] ← Dry skin
│     [Annotated region 2] ← Redness │
│     [Annotated region 3] ← Scaling │
│                                    │
│  Toggle: [ ] Annotations           │
│  [ Download annotated image ]      │
└────────────────────────────────────┘
```

##### C. Compare Conditions
```
User clicks "Compare with similar"
    ↓
Side-by-side comparison:

┌─────────────────────────────────────────┐
│  Your Case    vs    Eczema (Reference)  │
│  ┌─────────┐       ┌─────────┐          │
│  │ [Image] │       │ [Image] │          │
│  └─────────┘       └─────────┘          │
│                                         │
│  Similarities:                          │
│  ✓ Dry patches                          │
│  ✓ Redness pattern                      │
│                                         │
│  Differences:                           │
│  • Your case: milder severity           │
│  • Reference: more scaling              │
└─────────────────────────────────────────┘
```

#### Implementation

```tsx
function InteractiveCVResult({ prediction, image }: Props) {
  const [showAnnotated, setShowAnnotated] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {/* Predictions with hover */}
      <div className="space-y-2">
        {prediction.results.map((result) => (
          <Tooltip key={result.condition}>
            <TooltipTrigger asChild>
              <div 
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent cursor-pointer"
                onMouseEnter={() => setSelectedCondition(result.condition)}
              >
                <span>{result.condition}</span>
                <ConfidenceMeter value={result.confidence} />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="w-80">
              <ConditionDetails condition={result} />
            </TooltipContent>
          </Tooltip>
        ))}
      </div>

      {/* Annotated image toggle */}
      <Button 
        variant="outline"
        onClick={() => setShowAnnotated(!showAnnotated)}
      >
        {showAnnotated ? 'Hide' : 'Show'} Image Analysis
      </Button>

      {showAnnotated && (
        <AnnotatedImageViewer 
          image={image}
          annotations={prediction.annotations}
        />
      )}
    </div>
  );
}
```

---

### 4. **Confidence Visualization** - Hiển Thị Độ Tin Cậy

#### Concept
Độ tin cậy không chỉ là số % mà được visualize bằng nhiều cách.

#### Variants

##### A. Progress Bar with Color
```
High Confidence (>80%)
████████▓░ 87%  🟢

Medium Confidence (50-80%)
█████░░░░░ 62%  🟡

Low Confidence (<50%)
███░░░░░░░ 32%  🔴
```

##### B. Confidence Meter (Gauge)
```
      ┌─────┐
     ╱   87  ╲
    │    %    │
    │  ●●●●●  │  ← 5/5 stars
    └─────────┘
    High Confidence
```

##### C. Uncertainty Range
```
┌────────────────────────────────────┐
│ Estimated Confidence: 87%          │
│                                    │
│ Uncertainty range: ±5%             │
│ ├───────────[■]───────────────┤    │
│ 82%        87%              92%    │
│                                    │
│ Interpretation:                    │
│ Very high confidence in this       │
│ prediction. Model is reliable.     │
└────────────────────────────────────┘
```

#### Implementation

```tsx
function ConfidenceMeter({ value, showDetails = false }: Props) {
  const getColor = (conf: number) => {
    if (conf >= 0.8) return 'text-green-500';
    if (conf >= 0.5) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getInterpretation = (conf: number) => {
    if (conf >= 0.8) return 'High confidence - Reliable prediction';
    if (conf >= 0.5) return 'Medium confidence - Consider additional input';
    return 'Low confidence - Seek professional opinion';
  };

  return (
    <Tooltip>
      <TooltipTrigger>
        <div className="flex items-center gap-2">
          <Progress value={value * 100} className="w-24" />
          <span className={cn("font-semibold", getColor(value))}>
            {(value * 100).toFixed(0)}%
          </span>
        </div>
      </TooltipTrigger>
      {showDetails && (
        <TooltipContent>
          <p className="font-medium">{getInterpretation(value)}</p>
          <p className="text-xs text-muted-foreground">
            Uncertainty: ±{((1 - value) * 10).toFixed(0)}%
          </p>
        </TooltipContent>
      )}
    </Tooltip>
  );
}
```

---

### 5. **Red Flag Highlights** - Cảnh Báo Nguy Hiểm

#### Concept
Red flags được làm nổi bật cực kỳ rõ ràng với animations và colors.

#### Visual Design

```
┌─────────────────────────────────────────────┐
│  🚨 CRITICAL RED FLAGS DETECTED             │
│  ┌───────────────────────────────────────┐  │
│  │                                       │  │
│  │  ⚠️  High Fever (39.8°C)             │  │
│  │      → Risk of serious infection      │  │
│  │                                       │  │
│  │  ⚠️  Severe Pain (9/10)               │  │
│  │      → Immediate attention needed     │  │
│  │                                       │  │
│  │  ⚠️  Difficulty Breathing             │  │
│  │      → EMERGENCY - Call 115 now       │  │
│  │                                       │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  🏥 RECOMMENDATION: Go to Emergency Room    │
│     DO NOT delay. This is urgent.           │
│                                             │
│  [ 📞 Call Emergency: 115 ]                 │
│  [ 🗺️ Find Nearest Hospital ]              │
└─────────────────────────────────────────────┘
```

#### Animation

```css
@keyframes pulse-red {
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
  animation: pulse-red 2s infinite;
}
```

#### Implementation

```tsx
function RedFlagAlert({ redFlags }: { redFlags: RedFlag[] }) {
  if (redFlags.length === 0) return null;

  return (
    <Alert className="border-red-500 red-flag-alert">
      <AlertTriangle className="h-5 w-5 text-red-500" />
      <AlertTitle className="text-red-600 font-bold">
        🚨 CRITICAL RED FLAGS DETECTED
      </AlertTitle>
      <AlertDescription>
        <div className="space-y-3 mt-2">
          {redFlags.map((flag, idx) => (
            <div key={idx} className="flex gap-2">
              <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{flag.symptom}</p>
                <p className="text-sm text-muted-foreground">{flag.risk}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-red-50 dark:bg-red-950 rounded-md">
          <p className="font-semibold text-red-700 dark:text-red-300">
            🏥 RECOMMENDATION: {getEmergencyRecommendation(redFlags)}
          </p>
        </div>

        <div className="flex gap-2 mt-4">
          <Button variant="destructive" size="sm">
            <Phone className="h-4 w-4 mr-2" />
            Call Emergency: 115
          </Button>
          <Button variant="outline" size="sm">
            <MapPin className="h-4 w-4 mr-2" />
            Find Nearest Hospital
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
```

---

### 6. **Conversational Context Visualization** - Hiện Context

#### Concept
Hiển thị thông tin context từ cuộc hội thoại theo dạng có thể tương tác.

#### Design

```
┌─────────────────────────────────────────────┐
│  📊 Conversation Context                    │
│  ┌───────────────────────────────────────┐  │
│  │                                       │  │
│  │   Chief Complaint: Hand rash          │  │
│  │   ┌───────┬─────────┬──────────┐      │  │
│  │   │       │         │          │      │  │
│  │   │ 📅    │ 😣      │ 📸       │      │  │
│  │   │ 2 days│ Itchy   │ Image    │      │  │
│  │   │       │ (7/10)  │ provided │      │  │
│  │   └───────┴─────────┴──────────┘      │  │
│  │                                       │  │
│  │   Previous Attempts:                  │  │
│  │   • OTC cream (no improvement)        │  │
│  │                                       │  │
│  │   Risk Factors:                       │  │
│  │   • No allergies                      │  │
│  │   • No chronic conditions             │  │
│  │                                       │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  [ 📝 Add more context ]                    │
└─────────────────────────────────────────────┘
```

---

### 7. **Suggested Next Actions** - Gợi Ý Hành Động

#### Concept
AI gợi ý người dùng có thể cung cấp thêm thông tin gì để cải thiện độ chính xác.

#### Design

```
┌─────────────────────────────────────────────┐
│  💡 You can help me improve accuracy by:    │
│  ┌───────────────────────────────────────┐  │
│  │ [ ] Upload another photo (different   │  │
│  │     angle or lighting)                │  │
│  │                                       │  │
│  │ [ ] Describe pain level (1-10 scale)  │  │
│  │                                       │  │
│  │ [ ] When did symptoms first appear?   │  │
│  │                                       │  │
│  │ [ ] Any recent changes in routine?    │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  These details would help me determine      │
│  severity and recommend better next steps.  │
└─────────────────────────────────────────────┘
```

---

## 🎬 Micro-Interactions

### 1. Success Checkmark Animation
```css
@keyframes checkmark {
  0% {
    transform: scale(0) rotate(45deg);
  }
  50% {
    transform: scale(1.2) rotate(45deg);
  }
  100% {
    transform: scale(1) rotate(45deg);
  }
}
```

### 2. Loading Shimmer
```css
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.tool-loading {
  background: linear-gradient(
    90deg,
    #f0f0f0 0px,
    #f8f8f8 50%,
    #f0f0f0 100%
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
}
```

### 3. Confidence Meter Fill
```tsx
// Animate confidence bar from 0 to value
<motion.div
  initial={{ width: 0 }}
  animate={{ width: `${confidence * 100}%` }}
  transition={{ duration: 1, ease: 'easeOut' }}
  className="h-2 bg-green-500 rounded-full"
/>
```

---

## ✅ Checklist

- [ ] Implement expandable/collapsible tool cards
- [ ] Add "Why this?" explanation modals
- [ ] Create interactive CV result viewers
- [ ] Implement confidence meters with tooltips
- [ ] Design red flag alert system with animations
- [ ] Add conversation context visualization
- [ ] Implement suggested actions prompts
- [ ] Add all micro-interactions and animations
- [ ] Test on mobile devices
- [ ] Accessibility testing

---

**Next**: [03_COMPONENT_SPECIFICATION.md](./03_COMPONENT_SPECIFICATION.md) - Chi tiết API và implementation của các components
