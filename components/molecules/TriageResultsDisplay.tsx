'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';
import type { TriageResults } from '@/types/react-flow';

interface TriageResultsDisplayProps {
    results: TriageResults;
}

const triageConfig = {
    emergency: {
        icon: AlertTriangle,
        color: 'text-red-600',
        bgColor: 'bg-red-50 dark:bg-red-950/30',
        borderColor: 'border-red-500',
        label: 'Emergency'
    },
    urgent: {
        icon: AlertCircle,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50 dark:bg-orange-950/30',
        borderColor: 'border-orange-500',
        label: 'Urgent'
    },
    routine: {
        icon: Info,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
        borderColor: 'border-yellow-500',
        label: 'Routine'
    },
    self_care: {
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50 dark:bg-green-950/30',
        borderColor: 'border-green-500',
        label: 'Self-Care'
    }
};

export function TriageResultsDisplay({ results }: TriageResultsDisplayProps) {
    const config = triageConfig[results.triage_level];
    const Icon = config.icon;

    return (
        <div className="space-y-3">
            {/* Triage Level */}
            <div className={`flex items-center gap-2 p-3 rounded-lg border-l-4 ${config.bgColor} ${config.borderColor}`}>
                <Icon className={`h-5 w-5 ${config.color}`} />
                <div className="flex-1">
                    <p className="text-sm font-semibold">Classification</p>
                    <p className={`text-lg font-bold ${config.color}`}>{config.label}</p>
                </div>
                {results.severity_score && (
                    <div className="text-right">
                        <p className="text-xs text-muted-foreground">Severity</p>
                        <p className="text-sm font-semibold">{results.severity_score}/10</p>
                    </div>
                )}
            </div>

            {/* Red Flags */}
            {results.red_flags.length > 0 && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <h4 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">
                        ⚠️ Red Flags Detected
                    </h4>
                    <ul className="space-y-1">
                        {results.red_flags.map((flag, idx) => (
                            <li key={idx} className="text-sm text-red-600 dark:text-red-300 flex gap-2">
                                <span>•</span>
                                <span>{flag}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Reasoning */}
            <div className="p-3 bg-muted rounded-lg">
                <h4 className="text-sm font-semibold mb-1">Reasoning</h4>
                <p className="text-sm text-muted-foreground">{results.reasoning}</p>
            </div>
        </div>
    );
}
