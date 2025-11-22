# Kế hoạch Implementation: Tăng cường Triage Report với AI Decision-Making

## Tổng quan

Dự án này nhằm phân tích lại chức năng triage report hiện tại và thêm khả năng cho AI tự quyết định khi nào nên tạo triage report chi tiết dựa trên ngữ cảnh và mức độ nghiêm trọng của tình huống.

## Phân tích Hệ thống Hiện tại

### 1. Kiến trúc Triage Hiện tại

Hệ thống Medagen hiện tại có **3 workflows chính**:

#### 1.1. Triage Workflow (Symptoms → Assessment)
- **Trigger**: User báo triệu chứng cụ thể
- **Input**: Text (+ optional image)
- **Process**:
  1. Intent classification
  2. CV analysis (nếu có ảnh)
  3. Triage Rules evaluation
  4. RAG guideline search
  5. LLM synthesis
- **Output**: `TriageResult` với cấu trúc chuẩn

#### 1.2. Disease Info Query (Educational)
- **Trigger**: User hỏi về bệnh cụ thể ("Bệnh X là gì?")
- **Input**: Text query
- **Process**:
  1. Knowledge base search (CSDL)
  2. RAG fallback
  3. Educational response synthesis
- **Output**: `TriageResult` với `triage_level: "routine"`

#### 1.3. General Health Query
- **Trigger**: Câu hỏi sức khỏe chung
- **Process**: RAG search + LLM synthesis
- **Output**: Educational response

### 2. Cấu trúc TriageResult Hiện tại

```typescript
interface TriageResult {
  triage_level: 'emergency' | 'urgent' | 'routine' | 'self_care';
  symptom_summary: string;
  red_flags: string[];
  suspected_conditions: Array<{
    name: string;
    source: 'cv_model' | 'guideline' | 'user_report' | 'reasoning';
    confidence: 'low' | 'medium' | 'high';
  }>;
  cv_findings: {
    model_used: 'derm_cv' | 'eye_cv' | 'wound_cv' | 'none';
    raw_output: any;
  };
  recommendation: {
    action: string;
    timeframe: string;
    home_care_advice: string;
    warning_signs: string;
  };
}
```

### 3. Vấn đề Hiện tại

> [!IMPORTANT]
> **Thiếu tính năng Triage Report chi tiết**
> 
> Hiện tại, hệ thống **LUÔN** trả về `TriageResult` cho mọi query, bất kể đó là:
> - Câu hỏi giáo dục đơn giản ("Mụn trứng cá là gì?")
> - Triệu chứng nghiêm trọng cần đánh giá kỹ
> - Tình huống cấp cứu
> 
> **AI không có khả năng quyết định** khi nào cần tạo **Triage Report chi tiết** với:
> - Phân tích sâu về triệu chứng
> - Đánh giá rủi ro đa chiều
> - Lộ trình hành động rõ ràng
> - Tracking timeline

---

## Đề xuất Giải pháp - SIMPLIFIED APPROACH

### Ý tưởng Cốt lõi (Đơn giản hóa)

> [!NOTE]
> **Nguyên tắc đơn giản:**
> 
> Khi AI có **Đủ THÔNG TIN** để đưa ra recommendation cụ thể → Tạo **Triage Report đầy đủ**

**"Đủ thông tin" nghĩa là:**
- AI đã phân tích được triệu chứng
- AI có thể đưa ra triage level (emergency/urgent/routine/self-care)
- AI có recommendation hành động cụ thể

**Không đủ thông tin:**
- Câu hỏi giáo dục chung chung ("Sức khỏe là gì?")
- Câu hỏi out-of-scope (BHYT, thủ tục)
- Cần hỏi lại để làm rõ

### Triage Report Components

**Khi trigger, Triage Report bao gồm:**

| Component | Mô tả |
|-----------|-------|
| **Symptom Analysis** | Phân tích triệu chứng chi tiết |
| **Triage Level** | Emergency/Urgent/Routine/Self-care |
| **Red Flags** | Các dấu hiệu cảnh báo |
| **CV Findings** | Kết quả phân tích ảnh (nếu có) |
| **Recommendations** | Hành động cụ thể + timeline |
| **📍 Location** | Danh sách cơ sở y tế gần nhất |
| **📄 PDF Export** | Khả năng export report dạng PDF |
| **Follow-up** | Checklist theo dõi |

---

## Proposed Changes

### Component: AI Agent Core

#### [MODIFY] [agent-executor.ts](file:///D:/Project/Medagen_master/Medagen/src/agent/agent-executor.ts)

**Changes:**
- Thêm method `hasEnoughInformation()` - Logic đơn giản để kiểm tra có đủ info
- Thêm method `generateCompleteTriageReport()` - Tạo report đầy đủ với location + PDF
- Tích hợp **Maps service** để lấy vị trí cơ sở y tế
- Cập nhật response để bao gồm location data

**Implementation Details:**
```typescript
private hasEnoughInformation(
  intent: IntentClassification,
  triageResult?: TriageRulesResult
): boolean {
  // Simple check:
  // - Not out_of_scope
  // - Not needs_clarification
  // - Has triage_level determined
  return intent.type !== 'out_of_scope' && 
         !intent.needsClarification &&
         triageResult !== undefined;
}

private async generateCompleteTriageReport(
  userText: string,
  triageResult: TriageRulesResult,
  cvResult?: CVResult,
  guidelines?: any[]
): Promise<CompleteTriageReport> {
  // 1. Build core report
  // 2. Get nearby medical facilities
  // 3. Add PDF export metadata
  // 4. Return complete report
}
```

---

#### [NEW] [triage-report.service.ts](file:///D:/Project/Medagen_master/Medagen/src/services/triage-report.service.ts)

**Purpose**: Service để tạo complete triage report với tất cả features

**Responsibilities:**
- Format comprehensive triage report
- Integrate location data từ Maps
- Prepare data cho PDF export
- Generate timeline & follow-up checklist
- Calculate severity scores

---

#### [NEW] [pdf-export.service.ts](file:///D:/Project/Medagen_master/Medagen/src/services/pdf-export.service.ts)

**Purpose**: Service để export triage report sang PDF

**Tech Stack:** 
- `pdfkit` hoặc `puppeteer` cho PDF generation
- Custom template cho medical report format

**Features:**
- Professional medical report layout
- Include all triage data
- QR code for digital access
- Printable format

---

#### [MODIFY] [system-prompt.ts](file:///D:/Project/Medagen_master/Medagen/src/agent/system-prompt.ts)

**Changes:**
- Cập nhật hướng dẫn: Khi đủ info → tạo complete report
- Thêm format mẫu cho complete triage report
- Instructions về khi nào cần location data

---

### Component: Location Integration

#### [NEW] [location.service.ts](file:///D:/Project/Medagen_master/Medagen/src/services/location.service.ts)

**Purpose**: Service để tìm cơ sở y tế gần nhất

**Integration:**
- Sử dụng existing Maps tool/API
- Filter theo triage level (Emergency → Bệnh viện có cấp cứu)
- Return sorted by distance

**Data Structure:**
```typescript
interface MedicalFacility {
  name: string;
  address: string;
  distance_km: number;
  facility_type: 'emergency' | 'hospital' | 'clinic';
  phone: string;
  coordinates: { lat: number; lng: number };
  capabilities: string[]; // ["cấp cứu", "nội khoa", ...]
}
```

---

### Component: Type Definitions

#### [MODIFY] [types/index.ts](file:///D:/Project/Medagen_master/Medagen/src/types/index.ts)

**Changes:**
- Thêm `CompleteTriageReport` interface
- Thêm `MedicalFacility` interface
- Thêm `PDFExportMetadata` interface
- Extend `TriageResult` để support complete report

**New Types:**
```typescript
export interface CompleteTriageReport extends TriageResult {
  report_type: 'complete';
  
  // Core triage data (existing)
  triage_level: TriageLevel;
  symptom_summary: string;
  red_flags: string[];
  suspected_conditions: SuspectedCondition[];
  cv_findings: CVFindings;
  recommendation: Recommendation;
  
  // NEW: Location data
  nearby_facilities: MedicalFacility[];
  
  // NEW: PDF export metadata
  pdf_export: PDFExportMetadata;
  
  // NEW: Follow-up & tracking
  follow_up: {
    checklist: string[];
    timeline: ActionTimeline;
    warning_signs_monitor: string[];
  };
  
  // Metadata
  metadata: {
    generated_at: string;
    report_id: string;
    has_sufficient_info: boolean;
  };
}

export interface MedicalFacility {
  name: string;
  address: string;
  distance_km: number;
  facility_type: 'emergency' | 'hospital' | 'clinic' | 'specialist';
  phone?: string;
  coordinates: { lat: number; lng: number };
  capabilities: string[];
  working_hours?: string;
  accepts_emergency?: boolean;
}

export interface PDFExportMetadata {
  available: boolean;
  download_url?: string;
  qr_code?: string;
  expires_at?: string;
}

export interface ActionTimeline {
  immediate: string;      // Ngay lập tức
  within_hours: string;   // Trong vài giờ
  within_days: string;    // Trong vài ngày
  follow_up: string;      // Tái khám
}
```

---

### Component: Frontend Display

#### [NEW] [CompleteTriageReportCard.tsx](file:///D:/Project/Medagen_master/Medagen/frontend/components/organisms/CompleteTriageReportCard.tsx)

**Purpose**: Component hiển thị complete triage report với tất cả tính năng

**Features:**
- **Triage Summary Section**: Level, red flags, summary
- **CV Findings Section**: Hiển thị kết quả phân tích ảnh với confidence
- **Recommendations Section**: Action items với timeline
- **📍 Location Map Section**: 
  - Interactive map với markers
  - List cơ sở y tế gần nhất
  - Directions button
  - Filter theo loại cơ sở
- **📄 PDF Export Button**: 
  - Generate & download PDF
  - QR code để share
  - Print preview
- **Follow-up Checklist**: Checkbox list để user theo dõi
- **Responsive Design**: Mobile-friendly
- **Accessibility**: Screen reader support

---

#### [NEW] [LocationMap.tsx](file:///D:/Project/Medagen_master/Medagen/frontend/components/molecules/LocationMap.tsx)

**Purpose**: Component hiển thị bản đồ với các cơ sở y tế

**Tech Stack:**
- Google Maps React hoặc Leaflet
- Custom markers cho từng loại facility
- Click to get directions

---

#### [NEW] [PDFExportButton.tsx](file:///D:/Project/Medagen_master/Medagen/frontend/components/atoms/PDFExportButton.tsx)

**Purpose**: Button component để trigger PDF export

**Features:**
- Loading state khi generate
- Download progress
- Share options (email, print)
- QR code modal

---

## Verification Plan

### Automated Tests

#### Unit Tests
```bash
# Test decision logic
npm test src/agent/agent-executor.test.ts

# Test report generation
npm test src/services/detailed-triage-report.service.test.ts
```

#### Integration Tests
```bash
# Test end-to-end triage flow với different scenarios
npm test src/__tests__/integration/triage-report.test.ts
```

**Test Scenarios:**
1. **Simple Educational Query** → Should NOT trigger detailed report
2. **Emergency Symptoms** → Should trigger detailed report
3. **Image with High Confidence** → Should trigger detailed report
4. **Multiple Red Flags** → Should trigger detailed report
5. **Routine Check** → Should NOT trigger detailed report

### Manual Verification

#### Frontend Testing
1. Test với UI để xem detailed report display
2. Verify responsive design
3. Check print layout
4. Test accessibility

#### User Flow Testing
1. Submit query: "Đau ngực dữ dội, khó thở"
   - Expected: Detailed Triage Report generated
2. Submit query: "Mụn trứng cá là gì?"
   - Expected: Simple educational response
3. Submit image with clear pathology
   - Expected: Detailed Triage Report with CV analysis

---

## Implementation Timeline

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| **Phase 1** | Backend logic (decision + generation) | 3-4 hours |
| **Phase 2** | Type definitions & interfaces | 1 hour |
| **Phase 3** | Frontend component | 2-3 hours |
| **Phase 4** | Testing & refinement | 2 hours |
| **Total** | | **8-10 hours** |

---

## Example Output

### Scenario: User có đủ thông tin

**Input:** "Đau ngực dữ dội, khó thở, mồ hôi lạnh từ 30 phút nay"

**Output - Complete Triage Report:**
```json
{
  "report_type": "complete",
  "triage_level": "emergency",
  "symptom_summary": "Đau ngực dữ dội kèm khó thở và mồ hôi lạnh, triệu chứng bắt đầu 30 phút trước",
  "red_flags": [
    "Đau ngực dữ dội",
    "Khó thở",
    "Mồ hôi lạnh",
    "Triệu chứng cấp tính < 1 giờ"
  ],
  "suspected_conditions": [
    {
      "name": "Nghi ngờ nhồi máu cơ tim cấp",
      "source": "reasoning",
      "confidence": "high"
    },
    {
      "name": "Suy tim cấp",
      "source": "reasoning",
      "confidence": "medium"
    }
  ],
  "cv_findings": {
    "model_used": "none",
    "raw_output": {}
  },
  "recommendation": {
    "action": "GỌI 115 NGAY - KHÔNG TỰ ĐI. Đây là tình huống cấp cứu y khoa.",
    "timeframe": "NGAY LẬP TỨC - mỗi phút đều quan trọng",
    "home_care_advice": "Nằm nghỉ, nới lỏng quần áo, không vận động. Chờ xe cấp cứu.",
    "warning_signs": "Đau ngực lan ra cánh tay trái, hàm, lưng. Mất ý thức. Ngừng thở."
  },
  
  // NEW: Location data
  "nearby_facilities": [
    {
      "name": "Bệnh viện Chợ Rẫy",
      "address": "201B Nguyễn Chí Thanh, Quận 5, TP.HCM",
      "distance_km": 2.3,
      "facility_type": "emergency",
      "phone": "028 3855 4137",
      "coordinates": { "lat": 10.7546, "lng": 106.6639 },
      "capabilities": ["Cấp cứu 24/7", "Khoa Tim mạch", "ICU", "Phẫu thuật tim"],
      "working_hours": "24/7",
      "accepts_emergency": true
    },
    {
      "name": "Bệnh viện Đại học Y Dược TP.HCM",
      "address": "215 Hồng Bàng, Quận 5, TP.HCM",
      "distance_km": 2.8,
      "facility_type": "emergency",
      "phone": "028 3855 2010",
      "coordinates": { "lat": 10.7584, "lng": 106.6571 },
      "capabilities": ["Cấp cứu 24/7", "Khoa Tim mạch", "ICU"],
      "working_hours": "24/7",
      "accepts_emergency": true
    }
  ],
  
  // NEW: PDF export
  "pdf_export": {
    "available": true,
    "download_url": "/api/reports/download/abc123.pdf",
    "qr_code": "data:image/png;base64,iVBORw0KG...",
    "expires_at": "2025-11-30T00:00:00Z"
  },
  
  // NEW: Follow-up
  "follow_up": {
    "checklist": [
      "☐ Đã gọi 115",
      "☐ Đã nằm nghỉ",
      "☐ Đã nới lỏng quần áo",
      "☐ Có người ở bên cạnh"
    ],
    "timeline": {
      "immediate": "Gọi 115 NGAY - Không tự đi",
      "within_hours": "ECG, xét nghiệm Troponin, đánh giá tim mạch",
      "within_days": "Theo dõi tại bệnh viện",
      "follow_up": "Tái khám tim mạch sau xuất viện"
    },
    "warning_signs_monitor": [
      "Đau ngực tăng hoặc không giảm",
      "Khó thở nặng hơn",
      "Mất ý thức",
      "Da xanh tím"
    ]
  },
  
  "metadata": {
    "generated_at": "2025-11-23T00:03:00+07:00",
    "report_id": "TR-20251123-ABC123",
    "has_sufficient_info": true
  }
}
```

### Scenario: Không đủ thông tin

**Input:** "Sức khỏe là gì?"

**Output - Simple Response (no complete report):**
```json
{
  "triage_level": "routine",
  "symptom_summary": "Câu hỏi giáo dục chung về sức khỏe",
  "red_flags": [],
  "suspected_conditions": [],
  "cv_findings": {
    "model_used": "none",
    "raw_output": {}
  },
  "recommendation": {
    "action": "Sức khỏe là trạng thái hoàn hảo về thể chất, tinh thần và xã hội...",
    "timeframe": "Không áp dụng",
    "home_care_advice": "Duy trì lối sống lành mạnh...",
    "warning_signs": "Thông tin chỉ mang tính tham khảo"
  }
  // NO location, NO PDF, NO complete report features
}
```

---

## User Review Required

> [!IMPORTANT]
> **New Features to Add**
> 
> - **PDF Export**: Cần library nào? (pdfkit, puppeteer, jsPDF?)
> - **Maps Integration**: Đã có Maps tool rồi - cần API key Google Maps?
> - **Location Data**: Cần database cơ sở y tế Việt Nam hoặc dùng Google Places API?

> [!NOTE]
> **Simple Logic = No Breaking Changes**
> 
> - Response vẫn là `TriageResult` nhưng extend với thêm fields
> - Backward compatible
> - Frontend có thể opt-in hiển thị location/PDF
> - Câu hỏi out-of-scope vẫn trả về response đơn giản như cũ

---

## Next Steps

Sau khi plan được approve:
1. Implement backend decision logic
2. Create detailed report generation service
3. Update type definitions
4. Build frontend component
5. Write tests
6. Document usage examples
