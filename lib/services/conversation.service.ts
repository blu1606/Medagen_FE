import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { MessageResponse, MessageCreate } from '@/lib/api/types';
import { transformApiError } from './errors';

/**
 * Conversation Service
 * Handles message sending and Server-Sent Events (SSE) streaming
 */
export const conversationService = {
    /**
     * Get all messages for a session
     * @param sessionId - Session ID
     * @returns Array of messages in chronological order
     */
    async getMessages(sessionId: string): Promise<MessageResponse[]> {
        try {
            const response = await apiClient.get<MessageResponse[]>(
                ENDPOINTS.CONVERSATIONS.MESSAGES(sessionId)
            );
            return response.data;
        } catch (error: any) {
            throw transformApiError(error);
        }
    },

    /**
     * Send a message to a session
     * @param sessionId - Session ID
     * @param content - Message content
     * @returns User message response
     */
    async sendMessage(sessionId: string, content: string): Promise<MessageResponse> {
        try {
            const messageData: MessageCreate = {
                role: 'user',
                content,
            };

            const response = await apiClient.post<MessageResponse>(
                ENDPOINTS.CONVERSATIONS.SEND(sessionId),
                messageData
            );

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
