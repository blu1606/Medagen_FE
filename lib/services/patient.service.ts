import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import {
    PatientCreate,
    PatientResponse,
    PatientUpdate,
    ListParams,
    SearchParams,
} from '@/lib/api/types';
import { buildQueryString } from '@/lib/api/utils';
import { transformApiError, ValidationError } from './errors';

/**
 * Patient Service
 * Handles all patient-related API calls
 */
export const patientService = {
    /**
     * Create a new patient
     * @param data - Patient creation data
     * @returns Created patient
     * @throws ValidationError if data is invalid
     */
    async create(data: PatientCreate): Promise<PatientResponse> {
        // Client-side validation
        if (!data.name || data.name.trim() === '') {
            throw new ValidationError('Patient name is required');
        }

        if (data.age <= 0) {
            throw new ValidationError('Patient age must be greater than 0');
        }

        try {
            const response = await apiClient.post<PatientResponse>(
                ENDPOINTS.PATIENTS.CREATE,
                data
            );
            return response.data;
        } catch (error: any) {
            throw transformApiError(error);
        }
    },

    /**
     * Get patient by ID
     * @param id - Patient ID
     * @returns Patient data
     * @throws NotFoundError if patient not found
     */
    async getById(id: string): Promise<PatientResponse> {
        try {
            const response = await apiClient.get<PatientResponse>(
                ENDPOINTS.PATIENTS.GET(id)
            );
            return response.data;
        } catch (error: any) {
            throw transformApiError(error);
        }
    },

    /**
     * List all patients with optional pagination and sorting
     * @param params - List parameters (limit, offset, sort_by, order)
     * @returns Array of patients
     */
    async list(params?: ListParams): Promise<PatientResponse[]> {
        try {
            const queryString = params ? buildQueryString(params) : '';
            const response = await apiClient.get<PatientResponse[]>(
                `${ENDPOINTS.PATIENTS.LIST}${queryString}`
            );
            return response.data;
        } catch (error: any) {
            throw transformApiError(error);
        }
    },

    /**
     * Search patients by name or ID
     * @param query - Search query string
     * @returns Array of matching patients
     */
    async search(query: string): Promise<PatientResponse[]> {
        try {
            const params: SearchParams = { q: query, limit: 50 };
            const queryString = buildQueryString(params);
            const response = await apiClient.get<PatientResponse[]>(
                `${ENDPOINTS.PATIENTS.SEARCH}${queryString}`
            );
            return response.data;
        } catch (error: any) {
            throw transformApiError(error);
        }
    },

    /**
     * Update patient information
     * @param id - Patient ID
     * @param data - Partial patient updates
     * @returns Updated patient
     */
    async update(id: string, data: PatientUpdate): Promise<PatientResponse> {
        try {
            const response = await apiClient.put<PatientResponse>(
                ENDPOINTS.PATIENTS.UPDATE(id),
                data
            );
            return response.data;
        } catch (error: any) {
            throw transformApiError(error);
        }
    },

    /**
     * Delete a patient
     * @param id - Patient ID
     */
    async delete(id: string): Promise<void> {
        try {
            await apiClient.delete(ENDPOINTS.PATIENTS.DELETE(id));
        } catch (error: any) {
            throw transformApiError(error);
        }
    },
};

export default patientService;
