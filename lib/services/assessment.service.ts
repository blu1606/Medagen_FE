import { AssessmentSnapshot } from '@/lib/assessmentStore';
import { mockBackend } from '@/lib/mock-backend';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true' || process.env.NEXT_PUBLIC_MOCK_DATA === 'TRUE';

export const assessmentService = {
    async saveAssessment(data: Omit<AssessmentSnapshot, 'id' | 'timestamp'>) {
        if (USE_MOCK) {
            return mockBackend.assessment.save(data);
        }

        const response = await fetch(`${API_BASE_URL}/api/assessment/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error('Failed to save assessment');
        }

        return response.json();
    },

    async loadAssessment() {
        if (USE_MOCK) {
            return mockBackend.assessment.load();
        }

        const response = await fetch(`${API_BASE_URL}/api/assessment/load`);

        if (!response.ok) {
            throw new Error('Failed to load assessment');
        }

        return response.json();
    },
};
