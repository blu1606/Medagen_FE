import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { AgentStatusResponse, AgentConfig, AgentLog } from '@/lib/api/types';
import { transformApiError } from './errors';

/**
 * Agent Service
 * Handles AI agent management and monitoring
 */
export const agentService = {
    /**
     * Get agent status for a session
     * @param sessionId - Session ID
     * @returns Agent status with current phase and progress
     */
    async getStatus(sessionId: string): Promise<AgentStatusResponse> {
        try {
            const response = await apiClient.get<AgentStatusResponse>(
                ENDPOINTS.AGENTS.STATUS(sessionId)
            );
            return response.data;
        } catch (error: any) {
            throw transformApiError(error);
        }
    },

    /**
     * Spawn (start) an AI agent for a session
     * @param sessionId - Session ID
     * @param config - Optional agent configuration
     */
    async spawn(sessionId: string, config?: AgentConfig): Promise<void> {
        try {
            await apiClient.post(
                ENDPOINTS.AGENTS.SPAWN(sessionId),
                config || {}
            );
        } catch (error: any) {
            throw transformApiError(error);
        }
    },

    /**
     * Interrupt (pause) agent execution
     * @param sessionId - Session ID
     */
    async interrupt(sessionId: string): Promise<void> {
        try {
            await apiClient.post(ENDPOINTS.AGENTS.INTERRUPT(sessionId));
        } catch (error: any) {
            throw transformApiError(error);
        }
    },

    /**
     * Get agent execution logs for debugging
     * @param sessionId - Session ID
     * @returns Array of agent logs
     */
    async getLogs(sessionId: string): Promise<AgentLog[]> {
        try {
            const response = await apiClient.get<AgentLog[]>(
                ENDPOINTS.AGENTS.LOGS(sessionId)
            );
            return response.data;
        } catch (error: any) {
            throw transformApiError(error);
        }
    },
};

export default agentService;
