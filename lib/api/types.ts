/**
 * API Types
 *
 * TypeScript types matching backend Pydantic models.
 * These ensure type safety for API requests and responses.
 */

// ==================== Patient Types ====================

export interface PatientData {
  name: string;
  age: number;
  chiefComplaint: string;
  bodyParts?: string[];
  painLevel?: number;
  duration?: string;
  triageLevel?: 'emergency' | 'urgent' | 'routine';
}

export interface PatientCreate extends PatientData {
  id?: string;
}

export interface PatientResponse {
  id: string;
  name: string;
  age: number;
  chiefComplaint: string;
  bodyParts?: string[];
  painLevel?: number;
  duration?: string;
  triageLevel?: 'emergency' | 'urgent' | 'routine';
  created_at: string;
  updated_at?: string;
}

export interface PatientUpdate {
  name?: string;
  age?: number;
  chiefComplaint?: string;
  bodyParts?: string[];
  painLevel?: number;
  duration?: string;
  triageLevel?: 'emergency' | 'urgent' | 'routine';
}

// ==================== Session Types ====================

export interface SessionCreate {
  patient_id?: string;
  patient_data?: PatientData;
}

export interface SessionResponse {
  id: string;
  patient_id?: string;
  patient_data?: PatientData;
  agent_status: AgentStatus;
  created_at: string;
  updated_at?: string;
}

export interface SessionUpdate {
  patient_data?: Partial<PatientData>;
  agent_status?: AgentStatus;
}

// ==================== Message Types ====================

export type MessageRole = 'user' | 'assistant' | 'system';

export interface MessageCreate {
  role: MessageRole;
  content: string;
}

export interface MessageResponse {
  id: string;
  session_id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// ==================== Agent Types ====================

export type AgentStatus = 'idle' | 'spawning' | 'running' | 'completed' | 'error';

export interface AgentStatusResponse {
  status: AgentStatus;
  current_phase?: string;
  progress?: number;
  error?: string;
}

export interface AgentConfig {
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

export interface AgentLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  metadata?: Record<string, any>;
}

// ==================== API Error Types ====================

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  statusCode?: number;
}

export interface ApiErrorResponse {
  error: ApiError;
}

// ==================== List/Pagination Types ====================

export interface ListParams {
  limit?: number;
  offset?: number;
  sort_by?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

// ==================== Search Types ====================

export interface SearchParams {
  q: string;
  limit?: number;
}

// ==================== Streaming Types ====================

export interface StreamChunk {
  type: 'text' | 'metadata' | 'end';
  data: string | Record<string, any>;
}

export interface StreamEvent {
  event: string;
  data: string;
}
