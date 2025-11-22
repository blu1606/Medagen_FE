'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import { ConfidenceMeter } from '../atoms/ConfidenceMeter';
import { ToolResultsDisplay } from './ToolResultsDisplay';
import type { ToolResults } from '@/types/react-flow';

export interface ObservationPanelProps {
    toolName: string;
    results: ToolResults;
    confidence?: number;
    stepNumber: number;
    className?: string;
}

export function ObservationPanel({
    toolName,
    results,
    confidence,
    stepNumber,
    className
}: ObservationPanelProps) {
    return (
        <div className="flex gap-3 items-start">
            {/* Eye Icon */}
            <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                <Eye className="h-4 w-4 text-white" />
            </div>

            {/* Observation Card */}
            <Card className={`flex-1 border-l-4 border-l-purple-500 ${className}`}>
                <CardHeader className="pb-2 pt-3">
                    <div className="flex items-center justify-between">
                        <Badge variant="outline" className="gap-1 border-purple-500 text-purple-700 dark:text-purple-300">
                            <Eye className="h-3 w-3" />
                            Observation #{stepNumber}
                        </Badge>
                        {confidence !== undefined && (
                            <ConfidenceMeter value={confidence} compact />
                        )}
                    </div>
                </CardHeader>
                <CardContent className="pb-3">
                    <ToolResultsDisplay
                        toolName={toolName}
                        results={results}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
