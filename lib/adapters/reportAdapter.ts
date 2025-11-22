/**
 * Report Adapter
 * Converts backend report data to UI-friendly format
 */

import { BackendReportResponse } from '@/lib/api/report-types';
import { CompleteTriageReport, MedicalFacility, ActionTimeline } from '@/lib/api/types';

/**
 * Convert backend report to CompleteTriageReport for UI
 */
export function adaptBackendReport(
  backendReport: BackendReportResponse,
  sessionId: string
): CompleteTriageReport {

  // Get latest triage assessment
  const latestTriage = backendReport.triage_assessment[backendReport.triage_assessment.length - 1];

  // Get latest recommendation
  const latestRecommendation = backendReport.recommendations[backendReport.recommendations.length - 1];

  // Extract concerns text
  const concernsSummary = backendReport.concerns
    .map(c => c.description)
    .join('. ');

  // Convert suspected conditions to UI format
  const suspectedConditions = backendReport.suspected_conditions.map(sc => ({
    name: sc.condition_name,
    source: sc.source,
    confidence: sc.confidence,
  }));

  // Convert hospitals to facilities format
  const nearbyFacilities: MedicalFacility[] = backendReport.suggested_hospitals.map(hospital => ({
    name: hospital.name,
    address: hospital.address,
    distance_km: hospital.distance_km,
    facility_type: inferFacilityType(hospital.specialty_match, hospital.name),
    phone: hospital.phone || 'N/A',
    coordinates: hospital.coordinates || { lat: 0, lng: 0 },
    capabilities: hospital.capabilities || [hospital.condition],
    working_hours: hospital.working_hours || 'Contact for hours',
    accepts_emergency: hospital.name.toLowerCase().includes('cấp cứu') ||
                       hospital.name.toLowerCase().includes('emergency'),
  }));

  // Generate action timeline based on triage level
  const actionTimeline = generateActionTimeline(
    latestTriage.level,
    latestRecommendation
  );

  // Generate follow-up checklist
  const checklist = generateChecklist(
    latestTriage.level,
    latestRecommendation
  );

  // Generate warning signs
  const warningSignsMonitor = generateWarningSignsFromRecommendation(
    latestRecommendation.warning_signs,
    latestTriage.red_flags
  );

  // Generate report ID
  const reportId = `TR-${Date.now()}-${sessionId.substring(0, 8)}`;

  return {
    report_type: 'complete',

    // Triage result
    triage_level: latestTriage.level,
    symptom_summary: concernsSummary,
    red_flags: latestTriage.red_flags,
    suspected_conditions: suspectedConditions,

    cv_findings: {
      model_used: backendReport.image_analysis?.model_type || 'none',
      raw_output: backendReport.image_analysis?.top_conditions || [],
    },

    recommendation: {
      action: latestRecommendation.action,
      timeframe: latestRecommendation.timeframe,
      home_care_advice: latestRecommendation.home_care_advice,
      warning_signs: latestRecommendation.warning_signs,
    },

    // Facilities
    nearby_facilities: nearbyFacilities,

    // PDF export (mock for now)
    pdf_export: {
      available: true,
      download_url: '#',
      qr_code: `https://api.qrserver.com/v1/create-qr-code/?data=${reportId}`,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    },

    // Follow-up
    follow_up: {
      checklist,
      timeline: actionTimeline,
      warning_signs_monitor: warningSignsMonitor,
    },

    // Metadata
    metadata: {
      generated_at: backendReport.updated_at || new Date().toISOString(),
      report_id: reportId,
      has_sufficient_info: true,
    },
  };
}

/**
 * Infer facility type from specialty match and name
 */
function inferFacilityType(
  specialtyMatch: string,
  name: string
): 'emergency' | 'hospital' | 'clinic' | 'specialist' {
  const lowerName = name.toLowerCase();

  if (lowerName.includes('cấp cứu') || lowerName.includes('emergency')) {
    return 'emergency';
  }

  if (lowerName.includes('chuyên khoa') || specialtyMatch === 'high') {
    return 'specialist';
  }

  if (lowerName.includes('phòng khám') || lowerName.includes('clinic')) {
    return 'clinic';
  }

  return 'hospital';
}

/**
 * Generate action timeline from triage level and recommendation
 */
function generateActionTimeline(
  triageLevel: string,
  recommendation: { action: string; timeframe: string; home_care_advice: string }
): ActionTimeline {
  const templates: Record<string, ActionTimeline> = {
    emergency: {
      immediate: 'Gọi 115 NGAY - Không tự đi đến bệnh viện',
      within_hours: 'Đánh giá cấp cứu tại bệnh viện',
      within_days: 'Nhập viện điều trị theo chỉ định',
      follow_up: 'Theo dõi theo chỉ định của bác sĩ',
    },
    urgent: {
      immediate: recommendation.home_care_advice || 'Sơ cứu ban đầu tại nhà',
      within_hours: recommendation.action || 'Đến cơ sở y tế trong vài giờ',
      within_days: 'Theo dõi triệu chứng, chụp ảnh tiến triển',
      follow_up: 'Tái khám sau 3 ngày nếu không đỡ',
    },
    routine: {
      immediate: recommendation.home_care_advice || 'Chăm sóc tại nhà',
      within_hours: 'Theo dõi triệu chứng',
      within_days: recommendation.action || 'Đặt lịch khám trong vài ngày',
      follow_up: 'Tái khám sau 1 tuần hoặc khi có biến chứng',
    },
    self_care: {
      immediate: recommendation.home_care_advice || 'Tự chăm sóc tại nhà',
      within_hours: 'Nghỉ ngơi, uống đủ nước',
      within_days: 'Theo dõi triệu chứng',
      follow_up: 'Khám bác sĩ nếu triệu chứng không đỡ sau 3-5 ngày',
    },
  };

  return templates[triageLevel] || templates.routine;
}

/**
 * Generate checklist from triage level and recommendation
 */
function generateChecklist(
  triageLevel: string,
  recommendation: { home_care_advice: string; warning_signs: string }
): string[] {
  const baseChecklist = [
    'Theo dõi nhiệt độ cơ thể định kỳ',
    'Ghi lại các triệu chứng bất thường',
  ];

  // Parse home care advice into checklist items
  const homeCareItems = recommendation.home_care_advice
    .split(/[\n,;]/)
    .map(item => item.trim())
    .filter(item => item.length > 0 && item.length < 100);

  const levelSpecific: Record<string, string[]> = {
    emergency: [
      'Chuẩn bị hồ sơ bệnh án và giấy tờ',
      'Có người thân đi cùng',
      'Mang theo danh sách thuốc đang dùng',
    ],
    urgent: [
      'Chụp ảnh vùng bị ảnh hưởng mỗi ngày',
      'Tuân thủ dùng thuốc theo chỉ định',
      'Tái khám nếu không đỡ sau 3 ngày',
    ],
    routine: [
      'Duy trì chế độ ăn uống lành mạnh',
      'Nghỉ ngơi đầy đủ',
      'Đặt lịch khám định kỳ',
    ],
    self_care: [
      'Uống đủ nước',
      'Tránh các yếu tố kích thích',
      'Liên hệ bác sĩ nếu triệu chứng nặng hơn',
    ],
  };

  return [
    ...baseChecklist,
    ...homeCareItems.slice(0, 3),
    ...(levelSpecific[triageLevel] || levelSpecific.routine),
  ].slice(0, 6); // Limit to 6 items
}

/**
 * Generate warning signs list
 */
function generateWarningSignsFromRecommendation(
  warningSignsText: string,
  redFlags: string[]
): string[] {
  // Parse warning signs from text
  const parsedSigns = warningSignsText
    .split(/[\n,;]/)
    .map(item => item.trim().replace(/^[-•*]\s*/, ''))
    .filter(item => item.length > 0);

  // Combine with red flags
  const allSigns = [...new Set([...parsedSigns, ...redFlags])];

  // Add generic warning signs if list is too short
  const genericSigns = [
    'Sốt cao trên 38.5°C không hạ',
    'Đau tăng dần không giảm',
    'Chóng mặt, mất ý thức',
    'Khó thở, thở nhanh',
  ];

  if (allSigns.length < 4) {
    allSigns.push(...genericSigns.slice(0, 4 - allSigns.length));
  }

  return allSigns.slice(0, 6); // Limit to 6 items
}

/**
 * Generate session name from concerns
 */
export function generateSessionName(concerns: { description: string }[]): string {
  if (concerns.length === 0) return 'Health Report';

  const firstConcern = concerns[0].description;
  const shortConcern = firstConcern.length > 40
    ? firstConcern.substring(0, 40) + '...'
    : firstConcern;

  const date = new Date().toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return `${shortConcern} - ${date}`;
}
