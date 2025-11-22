import { useEffect } from 'react';
import { useWebSocket } from './useWebSocket';
import { useReActFlowStore } from '@/stores/reactFlowStore';
import type { WebSocketMessage } from '@/types/react-flow';

// WebSocket URL from environment or default to production
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'wss://medagen-backend.hf.space/ws/chat';

export function useReActFlow(sessionId: string, userId: string) {
    const { isConnected, error, on } = useWebSocket(WS_URL, sessionId, {
        onConnect: () => console.log('🟢 ReAct flow WebSocket connected'),
        onDisconnect: () => console.log('🔴 ReAct flow WebSocket disconnected'),
        onError: (err) => console.error('❌ ReAct flow WebSocket error:', err),
        maxReconnectAttempts: 5
    });

    const {
        addThoughtStep,
        addActionStep,
        updateActionStep,
        addObservationStep,
        setFinalResult,
        setProcessing,
        steps,
        isProcessing,
        finalResult,
        reset
    } = useReActFlowStore();

    useEffect(() => {
        if (!isConnected) return;

        // Register message handlers
        on('thought', (data: WebSocketMessage) => {
            if (data.type === 'thought') {
                addThoughtStep(data.content, data.timestamp);
            }
        });

        on('action_start', (data: WebSocketMessage) => {
            if (data.type === 'action_start') {
                addActionStep(data.tool_name, data.tool_display_name, data.timestamp);
            }
        });

        on('action_complete', (data: WebSocketMessage) => {
            if (data.type === 'action_complete') {
                updateActionStep(
                    data.tool_name,
                    'complete',
                    data.results,
                    data.duration_ms
                );
            }
        });

        on('action_error', (data: WebSocketMessage) => {
            if (data.type === 'action_error') {
                updateActionStep(data.tool_name, 'error');
            }
        });

        on('observation', (data: WebSocketMessage) => {
            if (data.type === 'observation') {
                addObservationStep(
                    data.tool_name,
                    data.findings,
                    data.timestamp,
                    data.confidence
                );
            }
        });

        on('final_answer', (data: WebSocketMessage) => {
            if (data.type === 'final_answer') {
                setFinalResult(data.result);
            }
        });

    }, [isConnected, on, addThoughtStep, addActionStep, updateActionStep, addObservationStep, setFinalResult]);

    // Reset on session change
    useEffect(() => {
        return () => {
            reset();
        };
    }, [sessionId, reset]);

    return {
        steps,
        isProcessing,
        finalResult,
        isConnected,
        error,
        reset
    };
}
