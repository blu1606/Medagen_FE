import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import {
    SessionCreate,
    SessionResponse,
    SessionUpdate,
    AgentStatusResponse,
    ListParams,
} from '@/lib/api/types';
import { buildQueryString } from '@/lib/api/utils';
import { transformApiError } from './errors';
import { mockBackend } from '@/lib/mock-backend';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true' || process.env.NEXT_PUBLIC_MOCK_DATA === 'TRUE';

/**
 * Session Service
 * Handles all session-related API calls
 */
export const sessionService = {
    /**
     * Create a new conversation session via health-check/triage endpoint
     * @param data - Session creation data
     * @returns Created session
     */
    async create(data: SessionCreate): Promise<SessionResponse> {
        if (USE_MOCK) {
            return mockBackend.session.create(data);
        }
        try {
            // Transform frontend format to backend format
            const backendPayload = {
                text: data.patient_data?.chiefComplaint || 'Health check request',
                user_id: data.patient_id || 'anonymous',
                session_id: undefined, // Let backend create new session
                location: undefined, // TODO: Add location if needed
            };

            const response = await apiClient.post<any>(
                ENDPOINTS.SESSIONS.CREATE,
                backendPayload
            );

            // Backend returns: { ...triageResult, session_id, nearest_clinic? }
            // Transform to SessionResponse format
            const backendData = response.data;

            const sessionResponse: SessionResponse = {
                id: backendData.session_id, // Map session_id to id
                patient_id: data.patient_id,
                patient_data: data.patient_data,
                agent_status: 'completed', // Triage completed
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            return sessionResponse;
        } catch (error: any) {
            throw transformApiError(error);
        }
    },

    /**
     * Get session by ID
     * @param id - Session ID
     * @returns Session data
     * @throws NotFoundError if session not found
     */
    async getById(id: string): Promise<SessionResponse> {
        if (USE_MOCK) {
            return mockBackend.session.getById(id);
        }
        try {
            const response = await apiClient.get<SessionResponse>(
                ENDPOINTS.SESSIONS.GET(id)
            );
            return response.data;
        } catch (error: any) {
            throw transformApiError(error);
        }
    },

    /**
     * List all sessions with optional pagination
     * @param params - List parameters (limit, offset)
     * @returns Array of sessions
     */
    async list(params?: ListParams): Promise<SessionResponse[]> {
        if (USE_MOCK) {
            return mockBackend.session.list();
        }
        try {
            const queryString = params ? buildQueryString(params) : '';
            const response = await apiClient.get<SessionResponse[]>(
                `${ENDPOINTS.SESSIONS.LIST}${queryString}`
            );
            return response.data;
        } catch (error: any) {
            throw transformApiError(error);
        }
    },

    /**
     * Update session metadata
     * @param id - Session ID
     * @param updates - Partial session updates
     * @returns Updated session
     */
    async update(id: string, updates: Partial<SessionUpdate>): Promise<SessionResponse> {
        if (USE_MOCK) {
            console.log('[Mock Backend] Updating session:', id, updates);
            return mockBackend.session.getById(id); // Return existing for now
        }
        try {
            const response = await apiClient.put<SessionResponse>(
                ENDPOINTS.SESSIONS.UPDATE(id),
                updates
            );
            return response.data;
        } catch (error: any) {
            throw transformApiError(error);
        }
    },

    /**
     * Delete a session
     * @param id - Session ID
     */
    async delete(id: string): Promise<void> {
        if (USE_MOCK) {
            console.log('[Mock Backend] Deleting session:', id);
            return;
        }
        try {
            await apiClient.delete(ENDPOINTS.SESSIONS.DELETE(id));
        } catch (error: any) {
            throw transformApiError(error);
        }
    },

    /**
     * Get agent status for a session
     * @param id - Session ID
     * @returns Agent status information
     */
    async getAgentStatus(id: string): Promise<AgentStatusResponse> {
        if (USE_MOCK) {
            return { status: 'idle' };
        }
        try {
            const response = await apiClient.get<AgentStatusResponse>(
                ENDPOINTS.AGENTS.STATUS(id)
            );
            return response.data;
        } catch (error: any) {
            throw transformApiError(error);
        }
    },
};

export default sessionService;
