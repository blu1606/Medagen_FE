# Tài liệu API: Triage Report Generation

## Tổng quan

Hệ thống đã được mở rộng với tính năng tạo **Complete Triage Report** khi user click button "Generate Report". Report này bao gồm:
- Dữ liệu triage cơ bản (từ conversation)
- Danh sách cơ sở y tế gần nhất
- Metadata cho PDF export
- Follow-up checklist và timeline

## Endpoint mới

### POST `/api/triage/generate-report`

**Mô tả**: Generate complete triage report từ conversation context

**Request Body:**
```typescript
{
  session_id: string;          // Bắt buộc: Session ID để lấy conversation context
  message_id?: string;         // Tùy chọn: Message ID cụ thể để generate report
  user_location?: {            // Tùy chọn: Vị trí user để tìm cơ sở y tế
    lat: number;
    lng: number;
  }
}
```

**Response (200 OK):**
```typescript
{
  report_id: string;
  report: CompleteTriageReport;
}
```

**Response Structure:**
```typescript
interface CompleteTriageReport {
  report_type: 'complete';
  
  // Core triage data (từ TriageResult)
  triage_level: 'emergency' | 'urgent' | 'routine' | 'self-care';
  symptom_summary: string;
  red_flags: string[];
  suspected_conditions: SuspectedCondition[];
  cv_findings: CVFindings;
  recommendation: Recommendation;
  
  // NEW: Location data
  nearby_facilities: MedicalFacility[];
  
  // NEW: PDF export metadata
  pdf_export: {
    available: boolean;
    download_url?: string;
    qr_code?: string;
    expires_at?: string;
  };
  
  // NEW: Follow-up & tracking
  follow_up: {
    checklist: string[];
    timeline: {
      immediate: string;
      within_hours: string;
      within_days: string;
      follow_up: string;
    };
    warning_signs_monitor: string[];
  };
  
  // Metadata
  metadata: {
    generated_at: string;
    report_id: string;
    session_id: string;
    has_sufficient_info: boolean;
  };
}
```

**Error Responses:**

- **400 Bad Request**: Request body không hợp lệ
- **404 Not Found**: Không tìm thấy triage data trong conversation history
- **500 Internal Server Error**: Lỗi server khi generate report

## Services mới

### 1. LocationService (`src/services/location.service.ts`)

**Mục đích**: Tìm cơ sở y tế gần nhất dựa trên location và triage level

**Methods:**
- `findNearbyFacilities(location, triageLevel, limit?)`: Tìm cơ sở y tế gần nhất
  - Tự động chọn keywords và radius dựa trên triage level
  - Emergency: Tìm bệnh viện có cấp cứu trong 10km
  - Urgent: Tìm bệnh viện/phòng khám trong 15km
  - Routine: Tìm phòng khám trong 20km
  - Self-care: Tìm phòng khám/nhà thuốc trong 10km

**Dependencies:**
- Google Maps API (cần `GOOGLE_MAPS_API_KEY` trong config)

### 2. PDFExportService (`src/services/pdf-export.service.ts`)

**Mục đích**: Chuẩn bị metadata cho PDF export

**Methods:**
- `preparePDFExport(report)`: Tạo PDF export metadata
  - Generate download URL
  - Generate QR code (placeholder hiện tại)
  - Set expiration date (30 days)
- `generatePDF(report)`: Generate PDF file (TODO: cần thêm pdfkit)

**Note**: PDF generation chưa được implement. Cần thêm `pdfkit` vào dependencies để generate PDF thực tế.

### 3. TriageReportService (`src/services/triage-report.service.ts`)

**Mục đích**: Service chính để tạo complete triage report

**Methods:**
- `generateCompleteReport(sessionId, triageResult, userLocation?)`: Tạo complete report
  - Lấy nearby facilities từ LocationService
  - Generate follow-up checklist và timeline
  - Prepare PDF export metadata
  - Combine tất cả thành complete report

- `extractTriageDataFromSession(sessionId, messageId?)`: Extract triage data từ conversation history
  - Tìm message cụ thể hoặc latest assistant message có triage_result
  - Return TriageResult hoặc null

- `generateFollowUp(triageResult)`: Generate follow-up checklist và timeline
  - Checklist khác nhau dựa trên triage level
  - Timeline với 4 mốc: immediate, within_hours, within_days, follow_up

## Types mới

### MedicalFacility
```typescript
interface MedicalFacility {
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
```

### PDFExportMetadata
```typescript
interface PDFExportMetadata {
  available: boolean;
  download_url?: string;
  qr_code?: string;
  expires_at?: string;
}
```

### ActionTimeline
```typescript
interface ActionTimeline {
  immediate: string;
  within_hours: string;
  within_days: string;
  follow_up: string;
}
```

### FollowUpChecklist
```typescript
interface FollowUpChecklist {
  checklist: string[];
  timeline: ActionTimeline;
  warning_signs_monitor: string[];
}
```

### CompleteTriageReport
```typescript
interface CompleteTriageReport extends TriageResult {
  report_type: 'complete';
  nearby_facilities: MedicalFacility[];
  pdf_export: PDFExportMetadata;
  follow_up: FollowUpChecklist;
  metadata: {
    generated_at: string;
    report_id: string;
    session_id: string;
    has_sufficient_info: boolean;
  };
}
```

## Flow hoạt động

```
1. User chat với AI về triệu chứng
   ↓
2. AI trả lời triage (emergency/urgent/routine/self-care)
   ↓
3. UI hiển thị button "📋 Generate Full Report"
   ↓
4. User click button (optional)
   ↓
5. Frontend call API POST /api/triage/generate-report
   {
     session_id: "...",
     user_location: { lat, lng }  // optional
   }
   ↓
6. Backend:
   - Extract triage data từ conversation history
   - Get nearby facilities từ LocationService
   - Generate follow-up checklist và timeline
   - Prepare PDF export metadata
   - Combine thành CompleteTriageReport
   ↓
7. Return CompleteTriageReport
   ↓
8. Frontend hiển thị report modal với:
   - Location map
   - PDF download button
   - Follow-up checklist
   - Timeline
```

## Example Request/Response

### Request
```bash
POST /api/triage/generate-report
Content-Type: application/json

{
  "session_id": "abc123-def456-ghi789",
  "user_location": {
    "lat": 10.7546,
    "lng": 106.6639
  }
}
```

### Response
```json
{
  "report_id": "TR-20251123-ABC123",
  "report": {
    "report_type": "complete",
    "triage_level": "emergency",
    "symptom_summary": "Đau ngực dữ dội kèm khó thở và mồ hôi lạnh",
    "red_flags": [
      "Đau ngực dữ dội",
      "Khó thở",
      "Mồ hôi lạnh"
    ],
    "suspected_conditions": [
      {
        "name": "Nghi ngờ nhồi máu cơ tim cấp",
        "source": "reasoning",
        "confidence": "high"
      }
    ],
    "cv_findings": {
      "model_used": "none",
      "raw_output": {}
    },
    "recommendation": {
      "action": "GỌI 115 NGAY - KHÔNG TỰ ĐI",
      "timeframe": "NGAY LẬP TỨC",
      "home_care_advice": "Nằm nghỉ, nới lỏng quần áo",
      "warning_signs": "Đau ngực lan ra cánh tay trái, hàm, lưng"
    },
    "nearby_facilities": [
      {
        "name": "Bệnh viện Chợ Rẫy",
        "address": "201B Nguyễn Chí Thanh, Quận 5, TP.HCM",
        "distance_km": 2.3,
        "facility_type": "emergency",
        "phone": "028 3855 4137",
        "coordinates": {
          "lat": 10.7546,
          "lng": 106.6639
        },
        "capabilities": ["Cấp cứu 24/7", "Khoa Tim mạch", "ICU"],
        "working_hours": "24/7",
        "accepts_emergency": true
      }
    ],
    "pdf_export": {
      "available": true,
      "download_url": "/api/reports/download/TR-20251123-ABC123.pdf",
      "qr_code": "data:image/png;base64,...",
      "expires_at": "2025-12-23T00:00:00Z"
    },
    "follow_up": {
      "checklist": [
        "☐ Đã gọi 115 hoặc đến cơ sở cấp cứu",
        "☐ Đã thông báo cho người thân",
        "☐ Đã chuẩn bị thông tin y tế cần thiết"
      ],
      "timeline": {
        "immediate": "Gọi 115 hoặc đến cơ sở cấp cứu ngay lập tức",
        "within_hours": "Đánh giá ban đầu tại cơ sở y tế, xét nghiệm cần thiết",
        "within_days": "Theo dõi tại bệnh viện, điều trị theo chỉ định",
        "follow_up": "Tái khám theo lịch hẹn của bác sĩ"
      },
      "warning_signs_monitor": [
        "Đau ngực dữ dội",
        "Khó thở",
        "Mồ hôi lạnh"
      ]
    },
    "metadata": {
      "generated_at": "2025-11-23T10:30:00+07:00",
      "report_id": "TR-20251123-ABC123",
      "session_id": "abc123-def456-ghi789",
      "has_sufficient_info": true
    }
  }
}
```

## Dependencies cần thêm (tùy chọn)

Để hoàn thiện tính năng PDF export, cần thêm:

```bash
npm install pdfkit @types/pdfkit
```

Hoặc nếu muốn dùng puppeteer:

```bash
npm install puppeteer
```

## Notes

1. **Location Service**: Cần Google Maps API key trong config (`GOOGLE_MAPS_API_KEY`)
2. **PDF Export**: Hiện tại chỉ tạo metadata, chưa generate PDF thực tế. Cần implement khi thêm pdfkit.
3. **QR Code**: Hiện tại là placeholder, cần thêm library `qrcode` để generate QR code thực tế.
4. **Error Handling**: Tất cả services đều có error handling, trả về empty array/null nếu có lỗi thay vì throw exception.

## Testing

Để test endpoint:

```bash
# 1. Thực hiện health check trước để có conversation history
POST /api/health-check
{
  "text": "Đau ngực dữ dội, khó thở",
  "user_id": "user123",
  "session_id": "session123"
}

# 2. Generate report
POST /api/triage/generate-report
{
  "session_id": "session123",
  "user_location": {
    "lat": 10.7546,
    "lng": 106.6639
  }
}
```

