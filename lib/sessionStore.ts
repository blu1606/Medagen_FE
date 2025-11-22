'use client';

import { create } from 'zustand';
import { sessionService } from '@/lib/services';
import { toast } from 'sonner';

export interface ConversationSession {
    id: string;
    title: string;
    timestamp: string;
    lastMessage: string;
    status: 'active' | 'waiting' | 'resolved' | 'archived';
    patientData?: {
        name: string;
        age: number;
        chiefComplaint: string;
        duration?: string;
        painLevel?: number;
        triageLevel?: 'emergency' | 'urgent' | 'routine';
        bodyParts?: string[];
        // Extended fields from onboarding
        gender?: string;
        chronicConditions?: string[];
        allergies?: string[];
        currentMedications?: string;
        severity?: 'mild' | 'moderate' | 'severe';
        symptomImage?: string;  // Base64 string for persistence
    };
    triageResult?: {
        severity: string;
        recommendation: string;
    };
}

interface SessionStore {
    sessions: ConversationSession[];
    currentSessionId: string | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchSessions: () => Promise<void>;
    createSession: (patientData?: any) => Promise<string>;
    updateSession: (id: string, updates: Partial<ConversationSession>) => Promise<void>;
    deleteSession: (id: string) => Promise<void>;
    setCurrentSession: (id: string) => void;
    getCurrentSession: () => ConversationSession | null;
    archiveSession: (id: string) => Promise<void>;
}

export const useSessionStore = create<SessionStore>((set, get) => ({
    sessions: [],
    currentSessionId: null,
    isLoading: false,
    error: null,

    fetchSessions: async () => {
        set({ isLoading: true, error: null });
        try {
            const backendSessions = await sessionService.list();

            // Transform backend sessions to frontend format
            const sessions: ConversationSession[] = backendSessions.map(s => ({
                id: s.id,
                title: s.patient_data?.chiefComplaint || 'Consultation',
                timestamp: s.created_at,
                lastMessage: s.agent_status === 'completed' ? 'Triage Completed' : 'In Progress',
                status: 'active', // Default to active for now
                patientData: s.patient_data,
                triageResult: s.triage_result ? {
                    severity: s.triage_result.triage_level,
                    recommendation: s.triage_result.recommendation.action
                } : undefined
            }));

            set({ sessions, isLoading: false });
        } catch (error: any) {
            console.error('Failed to fetch sessions:', error);
            set({ error: error.message, isLoading: false });
        }
    },

    createSession: async (patientData) => {
        set({ isLoading: true, error: null });
        try {
            // Create session in backend
            const newSession = await sessionService.create({
                patient_data: patientData,
                patient_id: 'current-user' // TODO: Replace with actual user ID
            });

            const session: ConversationSession = {
                id: newSession.id,
                title: patientData?.chiefComplaint || 'New Consultation',
                timestamp: newSession.created_at,
                lastMessage: 'Started',
                status: 'active',
                patientData,
            };

            set((state) => ({
                sessions: [session, ...state.sessions],
                currentSessionId: session.id,
                isLoading: false
            }));

            return session.id;
        } catch (error: any) {
            console.error('Failed to create session:', error);
            toast.error('Failed to create session');
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    updateSession: async (id, updates) => {
        // Optimistic update
        set((state) => ({
            sessions: state.sessions.map((session) =>
                session.id === id ? { ...session, ...updates } : session
            ),
        }));

        try {
            // TODO: Implement update endpoint in backend if needed
            // await sessionService.update(id, updates);
        } catch (error: any) {
            console.error('Failed to update session:', error);
            // Revert on failure if needed
        }
    },

    deleteSession: async (id) => {
        set({ isLoading: true });
        try {
            await sessionService.delete(id);
            set((state) => ({
                sessions: state.sessions.filter((session) => session.id !== id),
                currentSessionId:
                    state.currentSessionId === id ? null : state.currentSessionId,
                isLoading: false
            }));
        } catch (error: any) {
            console.error('Failed to delete session:', error);
            toast.error('Failed to delete session');
            set({ isLoading: false });
        }
    },

    setCurrentSession: (id) => {
        set({ currentSessionId: id });
    },

    getCurrentSession: () => {
        const state = get();
        return (
            state.sessions.find((s) => s.id === state.currentSessionId) || null
        );
    },

    archiveSession: async (id) => {
        // For now just update status locally, backend might need specific endpoint
        get().updateSession(id, { status: 'archived' });
    },
}));
