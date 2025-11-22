/**
 * Supabase Service Layer
 * Direct database queries for optimized performance
 */

import { createSupabaseClient } from '@/lib/supabase';
import {
  safeSupabaseQuery,
  getCurrentUserId,
  retrySupabaseOperation,
} from '@/lib/supabase-utils';
import type {
  ConversationSession,
  ConversationMessage,
  EnrichedConversationSession,
  TriageSession,
} from '@/lib/supabase-types';

/**
 * Conversation Sessions Service
 */
export const supabaseSessionService = {
  /**
   * Fetch all sessions for current user
   */
  async fetchSessions(): Promise<EnrichedConversationSession[]> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const supabase = createSupabaseClient();

    const sessions = await safeSupabaseQuery(
      supabase
        .from('conversation_sessions')
        .select('id, user_id, created_at, updated_at')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(50)
    );

    if (!sessions) return [];

    // Enrich with message count and preview
    const enrichedSessions = await Promise.all(
      sessions.map(async (session) => {
        // Get last message for preview
        const { data: lastMessage } = await supabase
          .from('conversation_history')
          .select('content')
          .eq('session_id', session.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        // Get message count
        const { count } = await supabase
          .from('conversation_history')
          .select('*', { count: 'exact', head: true })
          .eq('session_id', session.id);

        return {
          ...session,
          title:
            lastMessage?.content?.substring(0, 30) || 'New Conversation',
          preview: lastMessage?.content?.substring(0, 50) || '',
          message_count: count || 0,
        };
      })
    );

    return enrichedSessions;
  },

  /**
   * Fetch single session by ID
   */
  async fetchSessionById(
    sessionId: string
  ): Promise<ConversationSession | null> {
    const supabase = createSupabaseClient();

    const session = await safeSupabaseQuery(
      supabase
        .from('conversation_sessions')
        .select('*')
        .eq('id', sessionId)
        .single()
    );

    return session;
  },

  /**
   * Create new conversation session
   */
  async createSession(
    userId: string
  ): Promise<ConversationSession | null> {
    const supabase = createSupabaseClient();

    const session = await safeSupabaseQuery(
      supabase
        .from('conversation_sessions')
        .insert({
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()
    );

    return session;
  },

  /**
   * Update session timestamp
   */
  async updateSessionTimestamp(sessionId: string): Promise<void> {
    const supabase = createSupabaseClient();

    await safeSupabaseQuery(
      supabase
        .from('conversation_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', sessionId)
    );
  },

  /**
   * Delete session
   */
  async deleteSession(sessionId: string): Promise<void> {
    const supabase = createSupabaseClient();

    // Delete messages first (cascade may handle this, but explicit is safer)
    await safeSupabaseQuery(
      supabase
        .from('conversation_history')
        .delete()
        .eq('session_id', sessionId)
    );

    // Delete session
    await safeSupabaseQuery(
      supabase
        .from('conversation_sessions')
        .delete()
        .eq('id', sessionId)
    );
  },
};

/**
 * Conversation Messages Service
 */
export const supabaseConversationService = {
  /**
   * Fetch messages for a session
   */
  async fetchMessages(
    sessionId: string,
    options?: { limit?: number; before?: string }
  ): Promise<ConversationMessage[]> {
    const supabase = createSupabaseClient();
    const limit = options?.limit || 50;

    let query = supabase
      .from('conversation_history')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (options?.before) {
      query = query.lt('created_at', options.before);
    }

    const messages = await safeSupabaseQuery(query);
    return messages || [];
  },

  /**
   * Add message to conversation
   */
  async addMessage(
    sessionId: string,
    userId: string,
    role: 'user' | 'assistant',
    content: string,
    imageUrl?: string
  ): Promise<ConversationMessage | null> {
    const supabase = createSupabaseClient();

    const message = await safeSupabaseQuery(
      supabase
        .from('conversation_history')
        .insert({
          session_id: sessionId,
          user_id: userId,
          role,
          content,
          image_url: imageUrl,
          created_at: new Date().toISOString(),
        })
        .select()
        .single()
    );

    // Update session timestamp
    await retrySupabaseOperation(() =>
      supabaseSessionService.updateSessionTimestamp(sessionId)
    );

    return message;
  },

  /**
   * Delete message
   */
  async deleteMessage(messageId: string): Promise<void> {
    const supabase = createSupabaseClient();

    await safeSupabaseQuery(
      supabase
        .from('conversation_history')
        .delete()
        .eq('id', messageId)
    );
  },
};

/**
 * Triage Sessions Service
 */
export const supabaseTriageService = {
  /**
   * Fetch triage result for user
   */
  async fetchLatestTriageResult(
    userId: string
  ): Promise<TriageSession | null> {
    const supabase = createSupabaseClient();

    const triageSession = await safeSupabaseQuery(
      supabase
        .from('sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
    );

    return triageSession;
  },

  /**
   * Fetch all triage sessions for user
   */
  async fetchTriageSessions(
    userId: string,
    limit: number = 10
  ): Promise<TriageSession[]> {
    const supabase = createSupabaseClient();

    const sessions = await safeSupabaseQuery(
      supabase
        .from('sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)
    );

    return sessions || [];
  },
};

export default {
  sessions: supabaseSessionService,
  conversations: supabaseConversationService,
  triage: supabaseTriageService,
};
