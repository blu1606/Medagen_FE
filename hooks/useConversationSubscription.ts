'use client';

import { useEffect } from 'react';
import { createSupabaseClient } from '@/lib/supabase';
import { useConversationStore } from '@/store/conversationStore';
import type { ConversationMessage } from '@/lib/supabase-types';
import { handleChannelError } from '@/lib/supabase-utils';

/**
 * Subscribe to real-time conversation messages
 * Listens for new messages in a specific session
 */
export function useConversationSubscription(sessionId: string | undefined) {
  const messagesBySession = useConversationStore((s) => s.messagesBySession);

  useEffect(() => {
    if (!sessionId) return;

    const supabase = createSupabaseClient();

    const channel = supabase
      .channel(`conversation:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversation_history',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          const newMessage = payload.new as ConversationMessage;

          // Convert Supabase message to MessageResponse format
          const messageResponse = {
            id: newMessage.id,
            session_id: newMessage.session_id || sessionId,
            role: newMessage.role,
            content: newMessage.content,
            timestamp: newMessage.created_at || new Date().toISOString(),
            image_url: newMessage.image_url,
            triage_result: newMessage.triage_result,
          };

          // Add to store
          const existingMessages = messagesBySession[sessionId] || [];
          const isDuplicate = existingMessages.some((m) => m.id === messageResponse.id);

          if (!isDuplicate) {
            useConversationStore.setState((state) => ({
              messagesBySession: {
                ...state.messagesBySession,
                [sessionId]: [...existingMessages, messageResponse],
              },
            }));
          }
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          handleChannelError('Failed to subscribe to conversation');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, messagesBySession]);
}
