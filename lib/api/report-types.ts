/**
 * Backend Report API Types
 * Types matching the actual backend response structure
 */

// ==================== Main Report Response ====================

export interface BackendReportResponse {
  session_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;

  concerns: Concern[];
  image_analysis?: ImageAnalysis;
  triage_assessment: TriageAssessment[];
  suspected_conditions: SuspectedCondition[];
  medical_guidelines: MedicalGuideline[];
  recommendations: Recommendation[];
  suggested_hospitals: SuggestedHospital[];
}

// ==================== Individual Types ====================

export interface Concern {
  description: string;
  timestamp: string;
  has_image: boolean;
}

export interface ImageAnalysis {
  top_conditions: TopCondition[];
  model_type: 'derm_cv' | 'eye_cv' | 'wound_cv';
}

export interface TopCondition {
  condition_name: string;
  confidence_percent: string;
  probability: number;
}

export interface TriageAssessment {
  level: 'emergency' | 'urgent' | 'routine' | 'self_care';
  timestamp: string;
  red_flags: string[];
  reasoning: string;
}

export interface SuspectedCondition {
  condition_name: string;
  source: 'cv_model' | 'guideline' | 'user_report' | 'reasoning';
  confidence: 'low' | 'medium' | 'high';
  occurrences: number;
}

export interface MedicalGuideline {
  content: string;
  relevance_score: number;
  source: string;
}

export interface Recommendation {
  action: string;
  timeframe: string;
  home_care_advice: string;
  warning_signs: string;
  timestamp: string;
}

export interface SuggestedHospital {
  name: string;
  distance_km: number;
  address: string;
  rating: number;
  specialty_match: 'low' | 'medium' | 'high';
  condition: string;
  phone?: string;
  coordinates?: { lat: number; lng: number };
  capabilities?: string[];
  working_hours?: string;
}

// ==================== API Wrapper ====================

export interface ReportApiResponse {
  session_id: string;
  report_type: 'full' | 'summary' | 'tools_only';
  generated_at: string;
  report: {
    report_content: BackendReportResponse;
    report_markdown: string;
  };
}
