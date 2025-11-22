import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { transformApiError } from './errors';
import { mockBackend } from '@/lib/mock-backend';
import { ReportApiResponse, BackendReportResponse } from '@/lib/api/report-types';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true' || process.env.NEXT_PUBLIC_MOCK_DATA === 'TRUE';

export type ReportType = 'full' | 'summary' | 'tools_only';

// Re-export for backward compatibility
export type ReportResponse = ReportApiResponse;

/**
 * Report Service
 * Handles report generation and retrieval from backend
 */
export const reportService = {
    /**
     * Generate or get full report for a session
     * @param sessionId - Session ID
     * @param type - Report type: 'full' (default), 'summary', or 'tools_only'
     * @param userLocation - Optional user location { latitude, longitude }
     * @returns Report with content and markdown
     */
    async getReport(
        sessionId: string,
        type: ReportType = 'full',
        userLocation?: { latitude: number; longitude: number } | null
    ): Promise<ReportApiResponse> {
        if (USE_MOCK) {
            // Return mock report with new structure
            const mockBackendReport: BackendReportResponse = {
                session_id: sessionId,
                user_id: 'mock-user',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                concerns: [
                    {
                        description: 'Mock health concern for testing',
                        timestamp: new Date().toISOString(),
                        has_image: false,
                    },
                ],
                triage_assessment: [
                    {
                        level: 'routine',
                        timestamp: new Date().toISOString(),
                        red_flags: [],
                        reasoning: 'Mock triage assessment',
                    },
                ],
                suspected_conditions: [],
                medical_guidelines: [],
                recommendations: [
                    {
                        action: 'Mock recommendation',
                        timeframe: '1-2 days',
                        home_care_advice: 'Rest and monitor symptoms',
                        warning_signs: 'Seek immediate help if symptoms worsen',
                        timestamp: new Date().toISOString(),
                    },
                ],
                suggested_hospitals: [],
            };

            return {
                session_id: sessionId,
                report_type: type,
                generated_at: new Date().toISOString(),
                report: {
                    report_content: mockBackendReport,
                    report_markdown: '# Mock Report\n\nThis is a mock report for testing.',
                },
            };
        }

        try {
            // Build URL with query params
            let url = ENDPOINTS.REPORTS.GET(sessionId, type);

            // Add location parameters if provided
            if (userLocation) {
                const urlObj = new URL(url, window.location.origin);
                urlObj.searchParams.set('latitude', userLocation.latitude.toString());
                urlObj.searchParams.set('longitude', userLocation.longitude.toString());
                url = urlObj.pathname + urlObj.search;
            }

            const response = await apiClient.get<BackendReportResponse | ReportApiResponse>(url);

            // Backend currently returns BackendReportResponse directly
            // Wrap it to match expected format
            const data = response.data as any;

            if (data.report && data.report.report_content) {
                // Already in expected format
                return data as ReportApiResponse;
            } else if (data.session_id && data.concerns) {
                // Direct backend format - wrap it
                return {
                    session_id: data.session_id,
                    report_type: type,
                    generated_at: data.updated_at || new Date().toISOString(),
                    report: {
                        report_content: data as BackendReportResponse,
                        report_markdown: '', // Backend doesn't provide markdown yet
                    },
                } as ReportApiResponse;
            } else {
                throw new Error('Invalid backend response format');
            }
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
    async getJSON(sessionId: string): Promise<BackendReportResponse> {
        if (USE_MOCK) {
            return {
                session_id: sessionId,
                user_id: 'mock-user',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                concerns: [],
                triage_assessment: [],
                suspected_conditions: [],
                medical_guidelines: [],
                recommendations: [],
                suggested_hospitals: [],
            };
        }

        try {
            const response = await apiClient.get<{ content: BackendReportResponse }>(
                ENDPOINTS.REPORTS.JSON(sessionId)
            );
            return response.data.content || {} as BackendReportResponse;
        } catch (error: any) {
            throw transformApiError(error);
        }
    },
};

export default reportService;

