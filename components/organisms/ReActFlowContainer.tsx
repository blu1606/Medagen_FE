'use client';

import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { ThoughtBubble } from '../molecules/ThoughtBubble';
import { ToolExecutionCard } from '../molecules/ToolExecutionCard';
import { ObservationPanel } from '../molecules/ObservationPanel';
import { useReActFlow } from '@/hooks/useReActFlow';
import { Loader2 } from 'lucide-react';
import type { ReActStep } from '@/types/react-flow';

export interface ReActFlowContainerProps {
    sessionId: string;
    userId: string;
    className?: string;
}

export function ReActFlowContainer({
    sessionId,
    userId,
    className
}: ReActFlowContainerProps) {
    const { steps, isProcessing, isConnected, error } = useReActFlow(sessionId, userId);

    // Don't render if no steps yet
    if (steps.length === 0 && !isProcessing) {
        return null;
    }

    return (
        <div className={`space-y-4 ${className || ''}`}>
            {/* Connection Status (only show if error) */}
            {error && (
                <div className="text-sm text-red-600 dark:text-red-400 p-2 bg-red-50 dark:bg-red-950/30 rounded">
                    ⚠️ Connection error: {error.message}
                </div>
            )}

            {/* ReAct Steps Timeline */}
            <AnimatePresence mode="popLayout">
                {steps.map((step, idx) => {
                    const key = `${step.type}-${step.stepNumber}`;

                    // Render based on step type
                    switch (step.type) {
                        case 'thought':
                            return (
                                <ThoughtBubble
                                    key={key}
                                    thought={step.content}
                                    timestamp={step.timestamp}
                                    stepNumber={step.stepNumber}
                                    variant={step.variant}
                                />
                            );

                        case 'action':
                            return (
                                <ToolExecutionCard
                                    key={key}
                                    toolName={step.toolName}
                                    displayName={step.displayName}
                                    status={step.status}
                                    duration={step.duration}
                                    results={step.results}
                                    stepNumber={step.stepNumber}
                                    initialExpanded={step.status === 'complete'}
                                />
                            );

                        case 'observation':
                            return (
                                <ObservationPanel
                                    key={key}
                                    toolName={step.toolName}
                                    results={step.findings}
                                    confidence={step.confidence}
                                    stepNumber={step.stepNumber}
                                />
                            );

                        default:
                            return null;
                    }
                })}
            </AnimatePresence>

            {/* Processing Indicator */}
            {isProcessing && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>AI is thinking...</span>
                </div>
            )}
        </div>
    );
}
