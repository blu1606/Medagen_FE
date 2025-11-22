import { AssessmentSnapshot } from '@/lib/assessmentStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const assessmentService = {
    async saveAssessment(data: Omit<AssessmentSnapshot, 'id' | 'timestamp'>) {
        // Mock API call for now since backend might not be ready
        console.log('Mock saving assessment:', data);
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
        return { success: true };

        /* 
        // Real implementation (restore when backend is ready)
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
        */
    },

    async loadAssessment() {
        const response = await fetch(`${API_BASE_URL}/api/assessment/load`);

        if (!response.ok) {
            throw new Error('Failed to load assessment');
        }

        return response.json();
    },
};
