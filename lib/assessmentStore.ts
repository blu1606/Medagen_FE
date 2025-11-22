import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Using `any` for image type to avoid missing import dependencies.
export interface AssessmentSnapshot {
    id: string;
    selectedParts: string[];
    painLevel: number;
    duration: string;
    image?: any; // placeholder for uploaded image data
    timestamp: string;
}

interface AssessmentState {
    selectedParts: string[];
    painLevel: number;
    duration: string;
    image?: any;
    history: AssessmentSnapshot[];

    // actions
    setParts: (parts: string[]) => void;
    setPain: (pain: number) => void;
    setDuration: (duration: string) => void;
    setImage: (image?: any) => void;
    addSnapshot: (snapshot: AssessmentSnapshot) => void;
    loadLast: () => void;
}

/**
 * Global store for the right‑hand Assessment Panel.
 * Persisted in localStorage under the key `assessment-store`.
 */
export const useAssessmentStore = create<AssessmentState>()(
    persist(
        (set, get) => ({
            selectedParts: [],
            painLevel: 0,
            duration: '',
            image: undefined,
            history: [],
            setParts: (parts) => set({ selectedParts: parts }),
            setPain: (pain) => set({ painLevel: pain }),
            setDuration: (duration) => set({ duration }),
            setImage: (image) => set({ image }),
            addSnapshot: (snapshot) => {
                const newHistory = [snapshot, ...get().history];
                set({ history: newHistory });
            },
            loadLast: () => {
                const last = get().history[0];
                if (last) {
                    set({
                        selectedParts: last.selectedParts,
                        painLevel: last.painLevel,
                        duration: last.duration,
                        image: last.image,
                    });
                }
            },
        }),
        {
            name: 'assessment-store', // storage key
            storage: createJSONStorage(() => localStorage),
        }
    )
);
