/**
 * Supabase Database Types
 *
 * Generated types matching Supabase schema
 * Run `npx supabase gen types typescript --project-id <id>` to auto-generate
 */

export interface Database {
  public: {
    Tables: {
      conversation_sessions: {
        Row: {
          id: string;
          user_id: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      conversation_history: {
        Row: {
          id: string;
          session_id: string | null;
          user_id: string;
          role: 'user' | 'assistant';
          content: string;
          image_url: string | null;
          triage_result: any | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          session_id?: string | null;
          user_id: string;
          role: 'user' | 'assistant';
          content: string;
          image_url?: string | null;
          triage_result?: any | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          session_id?: string | null;
          user_id?: string;
          role?: 'user' | 'assistant';
          content?: string;
          image_url?: string | null;
          triage_result?: any | null;
          created_at?: string | null;
        };
      };
      sessions: {
        Row: {
          id: string;
          user_id: string;
          input_text: string;
          image_url: string | null;
          triage_level: string;
          triage_result: any;
          location: any | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          input_text: string;
          image_url?: string | null;
          triage_level: string;
          triage_result: any;
          location?: any | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          input_text?: string;
          image_url?: string | null;
          triage_level?: string;
          triage_result?: any;
          location?: any | null;
          created_at?: string | null;
        };
      };
      diseases: {
        Row: {
          id: string;
          specialty_id: string | null;
          name: string;
          synonyms: string[] | null;
          icd10_code: string | null;
          description: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          specialty_id?: string | null;
          name: string;
          synonyms?: string[] | null;
          icd10_code?: string | null;
          description?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          specialty_id?: string | null;
          name?: string;
          synonyms?: string[] | null;
          icd10_code?: string | null;
          description?: string | null;
          created_at?: string | null;
        };
      };
      specialties: {
        Row: {
          id: string;
          name: string;
          name_en: string | null;
          description: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          name_en?: string | null;
          description?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          name_en?: string | null;
          description?: string | null;
          created_at?: string | null;
        };
      };
    };
  };
}

// Helper types for frontend
export type ConversationSession = Database['public']['Tables']['conversation_sessions']['Row'];
export type ConversationSessionInsert = Database['public']['Tables']['conversation_sessions']['Insert'];

export type ConversationMessage = Database['public']['Tables']['conversation_history']['Row'];
export type ConversationMessageInsert = Database['public']['Tables']['conversation_history']['Insert'];

export type TriageSession = Database['public']['Tables']['sessions']['Row'];
export type TriageSessionInsert = Database['public']['Tables']['sessions']['Insert'];

export type Disease = Database['public']['Tables']['diseases']['Row'];
export type Specialty = Database['public']['Tables']['specialties']['Row'];

// Enriched types for UI
export interface EnrichedConversationSession extends ConversationSession {
  title: string;
  preview: string;
  message_count: number;
}

export interface TriageResult {
  severity: string;
  recommendation: string;
  red_flags?: string[];
  suspected_conditions?: Array<{
    name: string;
    confidence: string;
  }>;
  [key: string]: any;
}
