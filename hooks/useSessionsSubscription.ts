'use client';

import { useEffect } from 'react';
import { createSupabaseClient } from '@/lib/supabase';
import { useSessionStore } from '@/store/sessionStore';
import type { ConversationSession } from '@/lib/supabase-types';
import { handleChannelError } from '@/lib/supabase-utils';

/**
 * Subscribe to real-time session updates
 * Listens for new sessions created by the user
 */
export function useSessionsSubscription(userId: string | undefined) {
  const sessions = useSessionStore((s) => s.sessions);

  useEffect(() => {
    if (!userId) return;

    const supabase = createSupabaseClient();

    const channel = supabase
      .channel(`sessions:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversation_sessions',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newSession = payload.new as ConversationSession;

          // Convert to ConversationSession format
          const sessionData = {
            id: newSession.id,
            title: 'New Conversation',
            timestamp: newSession.created_at || new Date().toISOString(),
            lastMessage: 'Started',
            status: 'active' as const,
          };

          // Add to store if not duplicate
          const isDuplicate = sessions.some((s) => s.id === sessionData.id);

          if (!isDuplicate) {
            useSessionStore.setState((state) => ({
              sessions: [sessionData, ...state.sessions],
            }));
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversation_sessions',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const updatedSession = payload.new as ConversationSession;

          useSessionStore.setState((state) => ({
            sessions: state.sessions.map((s) =>
              s.id === updatedSession.id
                ? {
                    ...s,
                    timestamp: updatedSession.updated_at || s.timestamp,
                  }
                : s
            ),
          }));
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          handleChannelError('Failed to subscribe to sessions');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, sessions]);
}
