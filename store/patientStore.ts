'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PatientResponse, PatientCreate, PatientUpdate } from '@/lib/api/types';
import { patientService } from '@/lib/services';

interface PatientStore {
    // State
    patients: PatientResponse[];
    selectedPatient: PatientResponse | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchPatients: () => Promise<void>;
    searchPatients: (query: string) => Promise<void>;
    createPatient: (data: PatientCreate) => Promise<PatientResponse>;
    updatePatient: (id: string, data: PatientUpdate) => Promise<void>;
    selectPatient: (patient: PatientResponse | null) => void;
    clearSelected: () => void;
    clearError: () => void;
}

export const usePatientStore = create<PatientStore>()(
    persist(
        (set, get) => ({
            // Initial state
            patients: [],
            selectedPatient: null,
            isLoading: false,
            error: null,

            // Fetch all patients
            fetchPatients: async () => {
                set({ isLoading: true, error: null });

                try {
                    const patients = await patientService.list();

                    set({
                        patients,
                        isLoading: false,
                    });
                } catch (error: any) {
                    const errorMessage = error.message || 'Failed to fetch patients';
                    set({ error: errorMessage, isLoading: false });
                }
            },

            // Search patients by query
            searchPatients: async (query) => {
                if (!query.trim()) {
                    // If empty query, fetch all patients
                    get().fetchPatients();
                    return;
                }

                set({ isLoading: true, error: null });

                try {
                    const patients = await patientService.search(query);

                    set({
                        patients,
                        isLoading: false,
                    });
                } catch (error: any) {
                    const errorMessage = error.message || 'Failed to search patients';
                    set({ error: errorMessage, isLoading: false });
                }
            },

            // Create new patient
            createPatient: async (data) => {
                set({ isLoading: true, error: null });

                try {
                    const newPatient = await patientService.create(data);

                    set((state) => ({
                        patients: [newPatient, ...state.patients],
                        isLoading: false,
                    }));

                    return newPatient;
                } catch (error: any) {
                    const errorMessage = error.message || 'Failed to create patient';
                    set({ error: errorMessage, isLoading: false });
                    throw error;
                }
            },

            // Update existing patient
            updatePatient: async (id, data) => {
                set({ isLoading: true, error: null });

                try {
                    const updatedPatient = await patientService.update(id, data);

                    set((state) => ({
                        patients: state.patients.map((patient) =>
                            patient.id === id ? updatedPatient : patient
                        ),
                        selectedPatient:
                            state.selectedPatient?.id === id
                                ? updatedPatient
                                : state.selectedPatient,
                        isLoading: false,
                    }));
                } catch (error: any) {
                    const errorMessage = error.message || 'Failed to update patient';
                    set({ error: errorMessage, isLoading: false });
                    throw error;
                }
            },

            // Select a patient
            selectPatient: (patient) => {
                set({ selectedPatient: patient });
            },

            // Clear selected patient
            clearSelected: () => {
                set({ selectedPatient: null });
            },

            // Clear error
            clearError: () => {
                set({ error: null });
            },
        }),
        {
            name: 'medagen-patient',
            // Only persist selectedPatient
            partialize: (state) => ({
                selectedPatient: state.selectedPatient,
            }),
        }
    )
);
