'use client';

import React from 'react';
import { CVPredictionsDisplay } from './CVPredictionsDisplay';
import { TriageResultsDisplay } from './TriageResultsDisplay';
import { GuidelineDisplay } from './GuidelineDisplay';
import type { ToolResults, CVResults, TriageResults, GuidelineResults } from '@/types/react-flow';

interface ToolResultsDisplayProps {
    toolName: string;
    results: ToolResults;
}

export function ToolResultsDisplay({ toolName, results }: ToolResultsDisplayProps) {
    // Route to appropriate display component based on tool type
    switch (toolName) {
        case 'derm_cv':
        case 'eye_cv':
        case 'wound_cv':
            return <CVPredictionsDisplay results={results as CVResults} />;

        case 'triage_rules':
            return <TriageResultsDisplay results={results as TriageResults} />;

        case 'guideline_retrieval':
            return <GuidelineDisplay results={results as GuidelineResults} />;

        default:
            // Fallback for unknown tool types
            return (
                <div className="p-3 bg-muted rounded-lg">
                    <pre className="text-xs overflow-auto">
                        {JSON.stringify(results, null, 2)}
                    </pre>
                </div>
            );
    }
}
