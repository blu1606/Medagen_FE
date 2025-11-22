// TypeScript types for ReAct flow
export type ReActStepType = 'thought' | 'action' | 'observation';
export type ToolStatus = 'pending' | 'running' | 'complete' | 'error';
export type TriageLevel = 'emergency' | 'urgent' | 'routine' | 'self_care';

// Base ReAct Step
export interface BaseReActStep {
    stepNumber: number;
    timestamp: string;
}

// Thought Step
export interface ThoughtStep extends BaseReActStep {
    type: 'thought';
    content: string;
    variant?: 'initial' | 'intermediate' | 'final';
}

// Action Step
export interface ActionStep extends BaseReActStep {
    type: 'action';
    toolName: string;
    displayName: string;
    status: ToolStatus;
    duration?: number;
    results?: ToolResults;
}

// Observation Step
export interface ObservationStep extends BaseReActStep {
    type: 'observation';
    toolName: string;
    findings: any;
    confidence?: number;
}

// Union type for all steps
export type ReActStep = ThoughtStep | ActionStep | ObservationStep;

// Tool Results Types
export interface CVResults {
    predictions: Array<{
        condition: string;
        confidence: number;
    }>;
    visual_features?: string[];
    annotations?: ImageAnnotation[];
    model_info?: {
        name: string;
        accuracy: number;
        trained_on?: number;
    };
}

export interface TriageResults {
    triage_level: TriageLevel;
    red_flags: string[];
    reasoning: string;
    severity_score?: number;
}

export interface GuidelineResults {
    guidelines: Array<{
        title: string;
        content: string;
        source: string;
        relevance_score?: number;
    }>;
}

export type ToolResults = CVResults | TriageResults | GuidelineResults;

// Image Annotation
export interface ImageAnnotation {
    id: string;
    label: string;
    coordinates: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    confidence: number;
}

// WebSocket Messages
export interface ThoughtMessage {
    type: 'thought';
    content: string;
    timestamp: string;
}

export interface ActionStartMessage {
    type: 'action_start';
    tool_name: string;
    tool_display_name: string;
    timestamp: string;
}

export interface ActionCompleteMessage {
    type: 'action_complete';
    tool_name: string;
    duration_ms: number;
    results: ToolResults;
    timestamp: string;
}

export interface ActionErrorMessage {
    type: 'action_error';
    tool_name: string;
    error: string;
    timestamp: string;
}

export interface ObservationMessage {
    type: 'observation';
    tool_name: string;
    findings: any;
    confidence?: number;
    timestamp: string;
}

export interface FinalAnswerMessage {
    type: 'final_answer';
    result: TriageResult;
    timestamp: string;
}

export type WebSocketMessage =
    | ThoughtMessage
    | ActionStartMessage
    | ActionCompleteMessage
    | ActionErrorMessage
    | ObservationMessage
    | FinalAnswerMessage;

// Triage Result (from existing)
export interface TriageResult {
    triage_level: TriageLevel;
    symptom_summary: string;
    red_flags: string[];
    suspected_conditions: Array<{
        name: string;
        confidence: 'low' | 'medium' | 'high';
        source?: string;
    }>;
    cv_findings?: {
        model_used: string;
        raw_output: CVResults;
    };
    recommendation: {
        action: string;
        timeframe: string;
        home_care_advice: string;
        warning_signs: string;
    };
    nearest_clinic?: {
        name: string;
        distance_km: number;
        address: string;
        rating?: number;
    };
}

// Red Flag
export interface RedFlag {
    symptom: string;
    risk: string;
    severity: 'critical' | 'high' | 'medium';
}

// Conversation Context
export interface ConversationContext {
    chief_complaint: string;
    duration?: string;
    severity?: number;
    previous_attempts?: string[];
    risk_factors?: string[];
    images?: string[];
}
