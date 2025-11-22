'use client';

import { create } from 'zustand';
import { MessageResponse } from '@/lib/api/types';
import { conversationService } from '@/lib/services';

interface ConversationStore {
    // State
    messagesBySession: Record<string, MessageResponse[]>;
    streamingMessage: string | null;
    currentStreamingSession: string | null;
    isStreaming: boolean;
    error: string | null;
    streamAbortController: AbortController | null;

    // Actions
    loadMessages: (sessionId: string) => Promise<void>;
    sendMessage: (sessionId: string, content: string) => Promise<void>;
    handleStreamChunk: (sessionId: string, chunk: string) => void;
    handleStreamEnd: (sessionId: string) => void;
    cancelStream: () => void;
    clearMessages: (sessionId: string) => void;
    clearError: () => void;
}

export const useConversationStore = create<ConversationStore>()((set, get) => ({
    // Initial state
    messagesBySession: {},
    streamingMessage: null,
    currentStreamingSession: null,
    isStreaming: false,
    error: null,
    streamAbortController: null,

    // Load messages for a session
    loadMessages: async (sessionId) => {
        try {
            const messages = await conversationService.getMessages(sessionId);

            set((state) => ({
                messagesBySession: {
                    ...state.messagesBySession,
                    [sessionId]: messages,
                },
                error: null,
            }));
        } catch (error: any) {
            const errorMessage = error.message || 'Failed to load messages';
            set({ error: errorMessage });
        }
    },

    // Send message with optimistic update
    sendMessage: async (sessionId, content) => {
        try {
            // Create temporary user message (optimistic update)
            const tempMessage: MessageResponse = {
                id: `temp-${Date.now()}`,
                session_id: sessionId,
                role: 'user',
                content,
                timestamp: new Date().toISOString(),
            };

            // Immediately add to UI
            set((state) => ({
                messagesBySession: {
                    ...state.messagesBySession,
                    [sessionId]: [
                        ...(state.messagesBySession[sessionId] || []),
                        tempMessage,
                    ],
                },
                error: null,
            }));

            // Send to backend
            const response = await conversationService.sendMessage(sessionId, content);

            // Replace temp message with real message
            set((state) => ({
                messagesBySession: {
                    ...state.messagesBySession,
                    [sessionId]: state.messagesBySession[sessionId].map((msg) =>
                        msg.id === tempMessage.id ? response : msg
                    ),
                },
            }));

            // Start streaming AI response
            set({
                isStreaming: true,
                currentStreamingSession: sessionId,
                streamingMessage: '',
            });

            // Start SSE streaming
            const abortController = conversationService.streamResponse(
                sessionId,
                (chunk: string) => {
                    get().handleStreamChunk(sessionId, chunk);
                },
                () => {
                    get().handleStreamEnd(sessionId);
                },
                (error: Error) => {
                    set({
                        error: error.message || 'Stream error',
                        isStreaming: false,
                        currentStreamingSession: null,
                        streamingMessage: null,
                        streamAbortController: null,
                    });
                }
            );

            // Store abort controller for cancellation
            set({ streamAbortController: abortController });
        } catch (error: any) {
            const errorMessage = error.message || 'Failed to send message';

            // Remove optimistic message on error
            set((state) => ({
                messagesBySession: {
                    ...state.messagesBySession,
                    [sessionId]: state.messagesBySession[sessionId].filter(
                        (msg) => !msg.id.startsWith('temp-')
                    ),
                },
                error: errorMessage,
                isStreaming: false,
            }));
        }
    },

    // Handle incoming stream chunk
    handleStreamChunk: (sessionId, chunk) => {
        const currentSession = get().currentStreamingSession;

        if (currentSession !== sessionId) {
            console.warn(`Received chunk for session ${sessionId} but currently streaming ${currentSession}`);
            return;
        }

        set((state) => ({
            streamingMessage: (state.streamingMessage || '') + chunk,
        }));
    },

    // Handle stream end
    handleStreamEnd: (sessionId) => {
        const { streamingMessage } = get();

        if (!streamingMessage) {
            set({
                isStreaming: false,
                currentStreamingSession: null,
                streamAbortController: null,
            });
            return;
        }

        // Create final message from streamed content
        const finalMessage: MessageResponse = {
            id: `msg-${Date.now()}`,
            session_id: sessionId,
            role: 'assistant',
            content: streamingMessage,
            timestamp: new Date().toISOString(),
        };

        // Add to messages
        set((state) => ({
            messagesBySession: {
                ...state.messagesBySession,
                [sessionId]: [
                    ...(state.messagesBySession[sessionId] || []),
                    finalMessage,
                ],
            },
            streamingMessage: null,
            currentStreamingSession: null,
            isStreaming: false,
            streamAbortController: null,
        }));
    },

    // Cancel ongoing stream
    cancelStream: () => {
        const { streamAbortController } = get();

        if (streamAbortController) {
            streamAbortController.abort();
        }

        set({
            isStreaming: false,
            currentStreamingSession: null,
            streamingMessage: null,
            streamAbortController: null,
        });
    },

    // Clear messages for a session
    clearMessages: (sessionId) => {
        set((state) => {
            const newMessagesBySession = { ...state.messagesBySession };
            delete newMessagesBySession[sessionId];

            return {
                messagesBySession: newMessagesBySession,
            };
        });
    },

    // Clear error
    clearError: () => {
        set({ error: null });
    },
}));
