import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { MessageResponse, MessageCreate } from '@/lib/api/types';
import { transformApiError } from './errors';
import { mockBackend } from '@/lib/mock-backend';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true' || process.env.NEXT_PUBLIC_MOCK_DATA === 'TRUE';

/**
 * Conversation Service
 * Handles message sending and Server-Sent Events (SSE) streaming
 */
export const conversationService = {
    /**
     * Get all messages for a session
     * @param sessionId - Session ID
     * @param limit - Optional limit for messages (default: 20)
     * @returns Array of messages in chronological order
     */
    async getMessages(sessionId: string, limit?: number): Promise<MessageResponse[]> {
        if (USE_MOCK) {
            return mockBackend.conversation.getMessages(sessionId);
        }
        try {
            const queryParams = limit ? `?limit=${limit}` : '';
            const response = await apiClient.get<{ messages: MessageResponse[], count: number }>(
                `${ENDPOINTS.CONVERSATIONS.MESSAGES(sessionId)}${queryParams}`
            );
            // Backend returns { messages: [], count: number }
            return response.data.messages || [];
        } catch (error: any) {
            throw transformApiError(error);
        }
    },

    /**
     * Send a message to a session via health-check endpoint
     * @param sessionId - Session ID
     * @param content - Message content
     * @param imageUrl - Optional image URL
     * @param userId - User ID (required by backend)
     * @param location - Optional location coordinates
     * @returns Triage result with session_id
     */
    async sendMessage(
        sessionId: string,
        content: string,
        imageUrl?: string,
        userId: string = 'anonymous',
        location?: { lat: number; lng: number }
    ): Promise<any> {
        if (USE_MOCK) {
            return mockBackend.conversation.sendMessage(sessionId, content);
        }
        try {
            // Backend expects: { user_id, text, image_url?, session_id, location? }
            const payload: any = {
                user_id: userId,
                text: content,
                session_id: sessionId,
            };

            if (imageUrl) {
                payload.image_url = imageUrl;
            }

            if (location) {
                payload.location = location;
            }

            const response = await apiClient.post<any>(
                ENDPOINTS.SESSIONS.CREATE, // Use health-check endpoint
                payload
            );

            // Backend returns triage result with session_id
            return response.data;
        } catch (error: any) {
            throw transformApiError(error);
        }
    },

    /**
     * Stream AI response using Server-Sent Events (SSE)
     * @param sessionId - Session ID
     * @param onChunk - Callback for each text chunk
     * @param onComplete - Callback when stream ends
     * @param onError - Callback for errors
     * @returns AbortController to allow cancellation
     */
    streamResponse(
        sessionId: string,
        onChunk: (chunk: string) => void,
        onComplete: () => void,
        onError: (error: Error) => void
    ): AbortController {
        if (USE_MOCK) {
            return mockBackend.conversation.streamResponse(sessionId, onChunk, onComplete);
        }

        const abortController = new AbortController();

        const streamUrl = `${process.env.NEXT_PUBLIC_API_URL}${ENDPOINTS.CONVERSATIONS.STREAM(sessionId)}`;

        // Use EventSource for SSE
        const eventSource = new EventSource(streamUrl);

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                if (data.type === 'text') {
                    onChunk(data.data);
                } else if (data.type === 'end') {
                    eventSource.close();
                    onComplete();
                }
            } catch (error) {
                console.error('Failed to parse SSE data:', error);
            }
        };

        eventSource.onerror = (error) => {
            eventSource.close();
            onError(new Error('Stream connection error'));
        };

        // Handle abort
        abortController.signal.addEventListener('abort', () => {
            eventSource.close();
        });

        return abortController;
    },

    /**
     * Delete a message
     * @param sessionId - Session ID
     * @param messageId - Message ID
     */
    async deleteMessage(sessionId: string, messageId: string): Promise<void> {
        if (USE_MOCK) {
            console.log('[Mock Backend] Deleting message:', messageId);
            return;
        }
        try {
            await apiClient.delete(
                ENDPOINTS.CONVERSATIONS.DELETE_MESSAGE(sessionId, messageId)
            );
        } catch (error: any) {
            throw transformApiError(error);
        }
    },
};

export default conversationService;
