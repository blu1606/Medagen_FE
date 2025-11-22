import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { transformApiError } from './errors';
import { mockBackend } from '@/lib/mock-backend';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true' || process.env.NEXT_PUBLIC_MOCK_DATA === 'TRUE';

/**
 * Report API Response Types
 */
export interface ReportContent {
    conversation_timeline?: any[];
    tool_executions?: any[];
    summary?: any;
    [key: string]: any;
}

export interface ReportResponse {
    session_id: string;
    report_type: 'full' | 'summary' | 'tools_only';
    generated_at: string;
    report: {
        report_content: ReportContent;
        report_markdown: string;
    };
}

export type ReportType = 'full' | 'summary' | 'tools_only';

/**
 * Report Service
 * Handles report generation and retrieval from backend
 */
export const reportService = {
    /**
     * Generate or get full report for a session
     * @param sessionId - Session ID
     * @param type - Report type: 'full' (default), 'summary', or 'tools_only'
     * @returns Report with content and markdown
     */
    async getReport(sessionId: string, type: ReportType = 'full'): Promise<ReportResponse> {
        if (USE_MOCK) {
            // Return mock report
            return {
                session_id: sessionId,
                report_type: type,
                generated_at: new Date().toISOString(),
                report: {
                    report_content: {
                        conversation_timeline: [],
                        tool_executions: [],
                        summary: {},
                    },
                    report_markdown: '# Mock Report\n\nThis is a mock report for testing.',
                },
            };
        }

        try {
            const response = await apiClient.get<ReportResponse>(
                ENDPOINTS.REPORTS.GET(sessionId, type)
            );
            return response.data;
        } catch (error: any) {
            throw transformApiError(error);
        }
    },

    /**
     * Get markdown report only
     * @param sessionId - Session ID
     * @returns Markdown string
     */
    async getMarkdown(sessionId: string): Promise<string> {
        if (USE_MOCK) {
            return '# Mock Report\n\nThis is a mock markdown report.';
        }

        try {
            const response = await apiClient.get<{ markdown: string }>(
                ENDPOINTS.REPORTS.MARKDOWN(sessionId)
            );
            return response.data.markdown || '';
        } catch (error: any) {
            throw transformApiError(error);
        }
    },

    /**
     * Get JSON report only (structured data)
     * @param sessionId - Session ID
     * @returns Report content as JSON
     */
    async getJSON(sessionId: string): Promise<ReportContent> {
        if (USE_MOCK) {
            return {
                conversation_timeline: [],
                tool_executions: [],
                summary: {},
            };
        }

        try {
            const response = await apiClient.get<{ content: ReportContent }>(
                ENDPOINTS.REPORTS.JSON(sessionId)
            );
            return response.data.content || {};
        } catch (error: any) {
            throw transformApiError(error);
        }
    },
};

export default reportService;

