import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { ReActStep, TriageResult, ToolStatus, ToolResults } from '@/types/react-flow';

interface ReActFlowState {
    // State
    steps: ReActStep[];
    currentStepIndex: number;
    isProcessing: boolean;
    finalResult: TriageResult | null;

    // Actions
    addThoughtStep: (content: string, timestamp: string, variant?: 'initial' | 'intermediate' | 'final') => void;
    addActionStep: (toolName: string, displayName: string, timestamp: string) => void;
    updateActionStep: (toolName: string, status: ToolStatus, results?: ToolResults, duration?: number) => void;
    addObservationStep: (toolName: string, findings: any, timestamp: string, confidence?: number) => void;
    setFinalResult: (result: TriageResult) => void;
    setProcessing: (processing: boolean) => void;
    reset: () => void;
}

const initialState = {
    steps: [],
    currentStepIndex: 0,
    isProcessing: false,
    finalResult: null,
};

export const useReActFlowStore = create<ReActFlowState>()(
    devtools(
        (set, get) => ({
            ...initialState,

            addThoughtStep: (content, timestamp, variant = 'intermediate') => {
                const state = get();
                const stepNumber = state.steps.length + 1;

                set({
                    steps: [
                        ...state.steps,
                        {
                            type: 'thought',
                            content,
                            timestamp,
                            stepNumber,
                            variant
                        }
                    ],
                    currentStepIndex: stepNumber - 1
                });
            },

            addActionStep: (toolName, displayName, timestamp) => {
                const state = get();
                const stepNumber = state.steps.length + 1;

                set({
                    steps: [
                        ...state.steps,
                        {
                            type: 'action',
                            toolName,
                            displayName,
                            status: 'running',
                            timestamp,
                            stepNumber
                        }
                    ],
                    isProcessing: true
                });
            },

            updateActionStep: (toolName, status, results, duration) => {
                const state = get();

                set({
                    steps: state.steps.map(step =>
                        step.type === 'action' && step.toolName === toolName
                            ? {
                                ...step,
                                status,
                                results,
                                duration: duration || step.duration
                            }
                            : step
                    ),
                    isProcessing: status === 'running'
                });
            },

            addObservationStep: (toolName, findings, timestamp, confidence) => {
                const state = get();
                const stepNumber = state.steps.length + 1;

                set({
                    steps: [
                        ...state.steps,
                        {
                            type: 'observation',
                            toolName,
                            findings,
                            timestamp,
                            stepNumber,
                            confidence
                        }
                    ]
                });
            },

            setFinalResult: (result) => {
                set({
                    finalResult: result,
                    isProcessing: false
                });
            },

            setProcessing: (processing) => {
                set({ isProcessing: processing });
            },

            reset: () => {
                set(initialState);
            }
        }),
        {
            name: 'react-flow-store'
        }
    )
);
