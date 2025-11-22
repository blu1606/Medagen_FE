'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SessionResponse, PatientData } from '@/lib/api/types';
import { sessionService } from '@/lib/services';

export interface ConversationSession {
    id: string;
    title: string;
    timestamp: string;
    lastMessage: string;
    status: 'active' | 'waiting' | 'resolved' | 'archived';
    patientData?: PatientData;
    triageResult?: {
        severity: string;
        recommendation: string;
    };
}

interface SessionStore {
    // State
    sessions: ConversationSession[];
    currentSessionId: string | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    createSession: (patientData?: PatientData) => Promise<string>;
    fetchSession: (id: string) => Promise<void>;
    syncSessions: () => Promise<void>;
    updateSession: (id: string, updates: Partial<ConversationSession>) => void;
    deleteSession: (id: string) => Promise<void>;
    setCurrentSession: (id: string) => void;
    getCurrentSession: () => ConversationSession | null;
    archiveSession: (id: string) => void;
    clearError: () => void;
}

export const useSessionStore = create<SessionStore>()(
    persist(
        (set, get) => ({
            // Initial state
            sessions: [],
            currentSessionId: null,
            isLoading: false,
            error: null,

            // Create session with backend API call
            createSession: async (patientData) => {
                set({ isLoading: true, error: null });

                try {
                    const response = await sessionService.create({ patient_data: patientData });

                    // Convert backend response to ConversationSession format
                    const newSession: ConversationSession = {
                        id: response.id,
                        title: patientData?.chiefComplaint || 'New Consultation',
                        timestamp: response.created_at,
                        lastMessage: 'Started',
                        status: 'active',
                        patientData: response.patient_data,
                    };

                    set((state) => ({
                        sessions: [newSession, ...state.sessions],
                        currentSessionId: newSession.id,
                        isLoading: false,
                    }));

                    return newSession.id;
                } catch (error: any) {
                    const errorMessage = error.message || 'Failed to create session';
                    set({ error: errorMessage, isLoading: false });
                    throw error;
                }
            },

            // Fetch single session from backend
            fetchSession: async (id) => {
                set({ isLoading: true, error: null });

                try {
                    const response = await sessionService.getById(id);

                    // Convert to ConversationSession format
                    const session: ConversationSession = {
                        id: response.id,
                        title: response.patient_data?.chiefComplaint || 'Consultation',
                        timestamp: response.created_at,
                        lastMessage: 'Active',
                        status: 'active',
                        patientData: response.patient_data,
                    };

                    // Add or update in sessions list
                    set((state) => {
                        const existingIndex = state.sessions.findIndex(s => s.id === id);
                        const newSessions = [...state.sessions];

                        if (existingIndex >= 0) {
                            newSessions[existingIndex] = session;
                        } else {
                            newSessions.unshift(session);
                        }

                        return {
                            sessions: newSessions,
                            isLoading: false,
                        };
                    });
                } catch (error: any) {
                    const errorMessage = error.message || 'Failed to fetch session';
                    set({ error: errorMessage, isLoading: false });
                    throw error;
                }
            },

            // Sync all sessions from backend
            syncSessions: async () => {
                set({ isLoading: true, error: null });

                try {
                    const responses = await sessionService.list();

                    // Convert to ConversationSession format
                    const sessions: ConversationSession[] = responses.map(r => ({
                        id: r.id,
                        title: r.patient_data?.chiefComplaint || 'Consultation',
                        timestamp: r.created_at,
                        lastMessage: 'Active',
                        status: 'active',
                        patientData: r.patient_data,
                    }));

                    set({ sessions, isLoading: false });
                } catch (error: any) {
                    const errorMessage = error.message || 'Failed to sync sessions';
                    set({ error: errorMessage, isLoading: false });
                }
            },

            // Update session (local only for now)
            updateSession: (id, updates) => {
                set((state) => ({
                    sessions: state.sessions.map((session) =>
                        session.id === id ? { ...session, ...updates } : session
                    ),
                }));
            },

            // Delete session with backend API call
            deleteSession: async (id) => {
                set({ isLoading: true, error: null });

                try {
                    await sessionService.delete(id);

                    // Remove from local state
                    set((state) => ({
                        sessions: state.sessions.filter((session) => session.id !== id),
                        currentSessionId:
                            state.currentSessionId === id ? null : state.currentSessionId,
                        isLoading: false,
                    }));
                } catch (error: any) {
                    const errorMessage = error.message || 'Failed to delete session';
                    set({ error: errorMessage, isLoading: false });
                    throw error;
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

            archiveSession: (id) => {
                set((state) => ({
                    sessions: state.sessions.map((session) =>
                        session.id === id ? { ...session, status: 'archived' as const } : session
                    ),
                }));
            },

            clearError: () => {
                set({ error: null });
            },
        }),
        {
            name: 'medagen-sessions',
            // Only persist sessions array, not loading/error states
            partialize: (state) => ({
                sessions: state.sessions,
                currentSessionId: state.currentSessionId,
            }),
        }
    )
);
