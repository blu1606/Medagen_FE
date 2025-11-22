import { AssessmentSnapshot } from '@/lib/assessmentStore';
import { MessageResponse, SessionResponse, SessionCreate } from '@/lib/api/types';

// Mock data storage
let mockAssessmentData: Partial<AssessmentSnapshot> | null = null;
let mockSessions: SessionResponse[] = [
    {
        id: 'mock-session-1',
        patient_id: 'user-1',
        patient_data: {
            name: 'John Doe',
            age: 30,
            chiefComplaint: 'Headache',
            painLevel: 5,
            duration: '2 days',
            triageLevel: 'routine'
        },
        agent_status: 'completed',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date(Date.now() - 86400000).toISOString(),
    }
];
let mockMessages: Record<string, MessageResponse[]> = {
    'mock-session-1': [
        {
            id: 'msg-1',
            session_id: 'mock-session-1',
            role: 'assistant',
            content: 'Hello! How can I help you today?',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
        },
        {
            id: 'msg-2',
            session_id: 'mock-session-1',
            role: 'user',
            content: 'I have a headache.',
            timestamp: new Date(Date.now() - 86390000).toISOString(),
        }
    ]
};

export const mockBackend = {
    assessment: {
        save: async (data: any) => {
            console.log('[Mock Backend] Saving assessment:', data);
            await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
            mockAssessmentData = { ...data };
            return { success: true, message: 'Assessment saved (MOCK)' };
        },
        load: async () => {
            console.log('[Mock Backend] Loading assessment');
            await new Promise(resolve => setTimeout(resolve, 600));

            if (!mockAssessmentData) {
                return {
                    selectedParts: ['head', 'neck'],
                    painLevel: 4,
                    duration: '2 days',
                    image: null
                };
            }
            return mockAssessmentData;
        }
    },
    session: {
        create: async (data: SessionCreate) => {
            console.log('[Mock Backend] Creating session:', data);
            await new Promise(resolve => setTimeout(resolve, 1000));
            const newSession: SessionResponse = {
                id: `mock-session-${Date.now()}`,
                patient_id: data.patient_id,
                patient_data: data.patient_data,
                agent_status: 'running',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };
            mockSessions.unshift(newSession);
            mockMessages[newSession.id] = [];
            return newSession;
        },
        list: async () => {
            console.log('[Mock Backend] Listing sessions');
            await new Promise(resolve => setTimeout(resolve, 500));
            return mockSessions;
        },
        getById: async (id: string) => {
            console.log('[Mock Backend] Getting session:', id);
            await new Promise(resolve => setTimeout(resolve, 300));
            const session = mockSessions.find(s => s.id === id);
            if (!session) throw new Error('Session not found');
            return session;
        }
    },
    conversation: {
        sendMessage: async (sessionId: string, content: string) => {
            console.log('[Mock Backend] Sending message:', sessionId, content);
            await new Promise(resolve => setTimeout(resolve, 600));

            const userMsg: MessageResponse = {
                id: `msg-${Date.now()}`,
                session_id: sessionId,
                role: 'user',
                content,
                timestamp: new Date().toISOString(),
            };

            if (!mockMessages[sessionId]) mockMessages[sessionId] = [];
            mockMessages[sessionId].push(userMsg);

            return userMsg;
        },
        streamResponse: (
            sessionId: string,
            onChunk: (chunk: string) => void,
            onComplete: () => void
        ) => {
            console.log('[Mock Backend] Streaming response for:', sessionId);
            const mockResponse = "I understand your symptoms. Based on what you've described, it sounds like you might be experiencing a tension headache. However, I need to ask a few more questions to be sure. Does the pain feel like a tight band around your head?";
            const words = mockResponse.split(' ');
            let i = 0;

            const interval = setInterval(() => {
                if (i < words.length) {
                    onChunk(words[i] + ' ');
                    i++;
                } else {
                    clearInterval(interval);
                    onComplete();

                    // Save assistant message
                    if (!mockMessages[sessionId]) mockMessages[sessionId] = [];
                    mockMessages[sessionId].push({
                        id: `msg-ai-${Date.now()}`,
                        session_id: sessionId,
                        role: 'assistant',
                        content: mockResponse,
                        timestamp: new Date().toISOString(),
                    });
                }
            }, 100); // Stream word by word every 100ms

            return new AbortController(); // Return dummy controller
        },
        getMessages: async (sessionId: string) => {
            console.log('[Mock Backend] Getting messages for:', sessionId);
            await new Promise(resolve => setTimeout(resolve, 400));
            return mockMessages[sessionId] || [];
        }
    }
};
