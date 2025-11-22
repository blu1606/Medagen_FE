import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { conversationService } from '@/lib/services';
import { storageService } from '@/lib/services/storage.service';
import { api } from '@/lib/api';

export interface TriageResult {
    triage_level: 'emergency' | 'urgent' | 'routine' | 'self_care';
    symptom_summary: string;
    red_flags: string[];
    suspected_conditions: Array<{
        name: string;
        source?: 'cv_model' | 'guideline' | 'user_report' | 'reasoning';
        confidence: 'low' | 'medium' | 'high';
    }>;
    cv_findings?: {
        model_used: 'derm_cv' | 'eye_cv' | 'wound_cv' | 'none';
        raw_output?: any;
    };
    recommendation: {
        action: string;
        timeframe: string;
        home_care_advice: string;
        warning_signs: string;
    };
    message?: string; // Markdown response from LLM
    nearest_clinic?: {
        name: string;
        distance_km: number;
        address: string;
        rating?: number;
    };
    session_id?: string;
}

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    image_url?: string;
    timestamp: string;
    status?: 'sending' | 'sent' | 'error';
    triage_result?: TriageResult;
}

interface UseChatOptions {
    sessionId?: string;
    initialMessages?: Message[];
    userId?: string;
    location?: { lat: number; lng: number };
}

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true' || process.env.NEXT_PUBLIC_MOCK_DATA === 'TRUE';

export function useChat({ sessionId, initialMessages = [], userId = 'anonymous', location }: UseChatOptions = {}) {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [isLoading, setIsLoading] = useState(false);
    const [triageResult, setTriageResult] = useState<TriageResult | null>(null);

    // Load conversation history on mount if sessionId exists
    // Skip for local sessions (created client-side with 'session-' prefix)
    useEffect(() => {
        const isLocalSession = sessionId?.startsWith('session-');

        if (sessionId && messages.length === 0 && !USE_MOCK && !isLocalSession) {
            setIsLoading(true);
            conversationService.getMessages(sessionId)
                .then((history) => {
                    // Transform backend messages to frontend format
                    const transformedMessages: Message[] = history.map((msg: any) => ({
                        id: msg.id,
                        role: msg.role,
                        content: msg.content,
                        image_url: msg.image_url,
                        timestamp: msg.created_at || msg.timestamp,
                        status: 'sent',
                        triage_result: msg.triage_result,
                    }));
                    setMessages(transformedMessages);

                    // Set triage result if available in last message
                    const lastMessage = transformedMessages[transformedMessages.length - 1];
                    if (lastMessage?.triage_result) {
                        setTriageResult(lastMessage.triage_result);
                    }
                })
                .catch((error) => {
                    console.error('Failed to load conversation history:', error);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [sessionId]);

    const sendMessage = useCallback(async (content: string, image?: File, contentToSend?: string) => {
        if (!content.trim() && !image) return;
        if (!sessionId) {
            toast.error('No session ID. Please start a new assessment first.');
            return;
        }

        // Use contentToSend for backend if provided, otherwise use content
        const backendContent = contentToSend || content;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content, // UI shows only user's original message
            image_url: image ? URL.createObjectURL(image) : undefined,
            timestamp: new Date().toISOString(),
            status: 'sending',
        };

        setMessages((prev) => [...prev, userMessage]);
        setIsLoading(true);

        try {
            let imageUrl: string | undefined;

            // Upload image to Supabase Storage if provided
            if (image) {
                try {
                    setIsLoading(true);
                    toast.loading('Uploading image...', { id: 'upload-image' });

                    imageUrl = await storageService.uploadImage(image, {
                        userId,
                        sessionId,
                        folder: 'chat',
                    });

                    toast.success('Image uploaded successfully', { id: 'upload-image' });
                } catch (uploadError: any) {
                    toast.error(uploadError.message || 'Failed to upload image', { id: 'upload-image' });
                    // Update user message status to error
                    setMessages((prev) =>
                        prev.map((m) => (m.id === userMessage.id ? { ...m, status: 'error' } : m))
                    );
                    setIsLoading(false);
                    return;
                }
            }

            // Call backend health-check endpoint (send backendContent with context)
            const response = await conversationService.sendMessage(
                sessionId,
                backendContent, // Use backend content (with context if first message)
                imageUrl,
                userId,
                location
            );

            // Update user message status
            setMessages((prev) =>
                prev.map((m) => (m.id === userMessage.id ? { ...m, status: 'sent' } : m))
            );

            // Backend returns triage result with message
            console.log('[useChat] ==================== API RESPONSE ====================');
            console.log('[useChat] Full API response:', response);
            console.log('[useChat] response.message field:', response.message);
            console.log('[useChat] response.message type:', typeof response.message);
            console.log('[useChat] response.message length:', response.message?.length || 0);
            console.log('[useChat] response.symptom_summary:', response.symptom_summary);
            console.log('[useChat] =======================================================');

            const triageData: TriageResult = {
                triage_level: response.triage_level,
                symptom_summary: response.symptom_summary,
                red_flags: response.red_flags || [],
                suspected_conditions: response.suspected_conditions || [],
                cv_findings: response.cv_findings,
                recommendation: response.recommendation,
                message: response.message, // Store the message field in triage data
                nearest_clinic: response.nearest_clinic,
                session_id: response.session_id || sessionId,
            };

            setTriageResult(triageData);

            // CRITICAL: Use the 'message' field from backend (contains full LLM response in markdown)
            // NEVER use symptom_summary as it just echoes back the user's input context
            let messageContent = '';

            // Primary: Use backend's message field (this is the AI-generated response)
            if (response.message && typeof response.message === 'string' && response.message.trim().length > 0) {
                messageContent = response.message.trim();
                console.log('[useChat] ✅ Using response.message field (length:', messageContent.length, ')');
            }
            // Fallback 1: Use recommendation.action if message is missing
            else if (response.recommendation?.action && response.recommendation.action.trim().length > 0) {
                messageContent = response.recommendation.action.trim();
                console.warn('[useChat] ⚠️ Backend missing message field, using recommendation.action as fallback');
            }
            // Fallback 2: Generate a generic response if everything is missing
            else {
                messageContent = 'I apologize, but I encountered an issue generating a response. Please try again.';
                console.error('[useChat] ❌ CRITICAL: No valid message content in backend response!');
                console.error('[useChat] Response object:', JSON.stringify(response, null, 2));
            }

            console.log('[useChat] 📝 Final message content to display (length: ' + messageContent.length + '):', messageContent.substring(0, 100) + '...');

            // Sanity check: Ensure we're NOT accidentally using symptom_summary
            if (messageContent === response.symptom_summary) {
                console.error('[useChat] 🚨 ERROR: Message content matches symptom_summary! This should never happen!');
                console.error('[useChat] This means the backend did not return a proper message field.');
                // Force use recommendation if this happens
                if (response.recommendation?.action) {
                    messageContent = response.recommendation.action;
                    console.warn('[useChat] Overriding with recommendation.action instead');
                }
            }


            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: messageContent,
                timestamp: new Date().toISOString(),
                status: 'sent',
                triage_result: triageData,
            };

            console.log('[useChat] ✅ AI message created and added to chat');
            setMessages((prev) => [...prev, aiMessage]);


        } catch (error: any) {
            console.error('Error sending message:', error);
            setMessages((prev) =>
                prev.map((m) => (m.id === userMessage.id ? { ...m, status: 'error' } : m))
            );
            toast.error(error.message || 'Failed to send message. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [sessionId, userId, location]);

    return {
        messages,
        isLoading,
        triageResult,
        sendMessage,
        setMessages, // Exposed for initial greeting setup if needed
    };
}
