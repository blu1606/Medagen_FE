'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSessionStore } from '@/store/sessionStore';
import { useConversationStore } from '@/store/conversationStore';
import { usePatientStore } from '@/store/patientStore';
import { agentService } from '@/lib/services';
import type { AgentStatusResponse } from '@/lib/api/types';

/**
 * Get current session from URL param
 * Automatically fetches session if not found locally
 */
export function useActiveSession() {
    const params = useParams();
    const sessionId = params?.id as string | undefined;

    const session = useSessionStore((s) =>
        sessionId ? s.sessions.find((sess) => sess.id === sessionId) : null
    );
    const fetchSession = useSessionStore((s) => s.fetchSession);
    const isLoading = useSessionStore((s) => s.isLoading);

    useEffect(() => {
        if (sessionId && !session && !isLoading) {
            fetchSession(sessionId).catch((error) => {
                console.error('Failed to fetch session:', error);
            });
        }
    }, [sessionId, session, isLoading, fetchSession]);

    return {
        session,
        sessionId,
        isLoading,
    };
}

/**
 * Auto-load messages for a session on mount
 * Returns messages and loading state
 */
export function useSessionMessages(sessionId: string | undefined) {
    const messages = useConversationStore((s) =>
        sessionId ? s.messagesBySession[sessionId] || [] : []
    );
    const loadMessages = useConversationStore((s) => s.loadMessages);
    const isStreaming = useConversationStore((s) => s.isStreaming);
    const streamingMessage = useConversationStore((s) => s.streamingMessage);
    const currentStreamingSession = useConversationStore((s) => s.currentStreamingSession);

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (sessionId && messages.length === 0 && !isLoading) {
            setIsLoading(true);
            loadMessages(sessionId)
                .finally(() => setIsLoading(false));
        }
    }, [sessionId]);

    return {
        messages,
        isLoading,
        isStreaming: isStreaming && currentStreamingSession === sessionId,
        streamingMessage: currentStreamingSession === sessionId ? streamingMessage : null,
    };
}

/**
 * Hook for creating session with loading state and navigation
 * Returns createSession function and loading state
 */
export function useCreateSession() {
    const router = useRouter();
    const createSession = useSessionStore((s) => s.createSession);
    const isLoading = useSessionStore((s) => s.isLoading);
    const error = useSessionStore((s) => s.error);

    const handleCreateSession = useCallback(
        async (patientData?: any) => {
            try {
                const sessionId = await createSession(patientData);

                // Navigate to chat page with session ID as query param
                router.push(`/chat?session=${sessionId}`);

                return sessionId;
            } catch (error) {
                console.error('Failed to create session:', error);
                throw error;
            }
        },
        [createSession, router]
    );

    return {
        createSession: handleCreateSession,
        isLoading,
        error,
    };
}

/**
 * Debounced patient search hook
 * Automatically searches when query changes
 */
export function usePatientSearch(initialQuery: string = '') {
    const [query, setQuery] = useState(initialQuery);
    const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

    const patients = usePatientStore((s) => s.patients);
    const searchPatients = usePatientStore((s) => s.searchPatients);
    const fetchPatients = usePatientStore((s) => s.fetchPatients);
    const isLoading = usePatientStore((s) => s.isLoading);

    // Debounce query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    // Search when debounced query changes
    useEffect(() => {
        if (debouncedQuery.trim()) {
            searchPatients(debouncedQuery);
        } else {
            fetchPatients();
        }
    }, [debouncedQuery]);

    return {
        query,
        setQuery,
        patients,
        isLoading,
    };
}

/**
 * Hook for sending messages with optimistic updates
 */
export function useSendMessage(sessionId: string) {
    const sendMessage = useConversationStore((s) => s.sendMessage);
    const error = useConversationStore((s) => s.error);
    const clearError = useConversationStore((s) => s.clearError);

    const [isSending, setIsSending] = useState(false);

    const handleSendMessage = useCallback(
        async (content: string) => {
            if (!content.trim() || isSending) return;

            setIsSending(true);
            clearError();

            try {
                await sendMessage(sessionId, content);
            } catch (error) {
                console.error('Failed to send message:', error);
            } finally {
                setIsSending(false);
            }
        },
        [sessionId, sendMessage, isSending, clearError]
    );

    return {
        sendMessage: handleSendMessage,
        isSending,
        error,
    };
}

/**
 * Hook for managing selected patient
 */
export function useSelectedPatient() {
    const selectedPatient = usePatientStore((s) => s.selectedPatient);
    const selectPatient = usePatientStore((s) => s.selectPatient);
    const clearSelected = usePatientStore((s) => s.clearSelected);

    return {
        selectedPatient,
        selectPatient,
        clearSelected,
    };
}

/**
 * Hook for polling agent status in real-time
 * Polls every 2 seconds while agent is active
 */
export function useAgentStatus(sessionId: string | undefined) {
    const [status, setStatus] = useState<AgentStatusResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!sessionId) {
            setStatus(null);
            return;
        }

        let isMounted = true;
        let pollInterval: NodeJS.Timeout | null = null;

        const fetchStatus = async () => {
            try {
                setIsLoading(true);
                const response = await agentService.getStatus(sessionId);

                if (isMounted) {
                    setStatus(response);
                    setError(null);

                    // Continue polling if agent is still active
                    if (
                        response.status === 'running' ||
                        response.status === 'spawning'
                    ) {
                        pollInterval = setTimeout(fetchStatus, 2000);
                    }
                }
            } catch (err: any) {
                if (isMounted) {
                    setError(err.message || 'Failed to fetch agent status');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        // Initial fetch
        fetchStatus();

        // Cleanup
        return () => {
            isMounted = false;
            if (pollInterval) {
                clearTimeout(pollInterval);
            }
        };
    }, [sessionId]);

    return {
        status,
        isLoading,
        error,
        isActive: status?.status === 'running' || status?.status === 'spawning',
        currentPhase: status?.current_phase,
        progress: status?.progress,
    };
}
