'use client';

import React from 'react';
import { ExternalLink } from 'lucide-react';
import type { GuidelineResults } from '@/types/react-flow';

interface GuidelineDisplayProps {
    results: GuidelineResults;
}

export function GuidelineDisplay({ results }: GuidelineDisplayProps) {
    return (
        <div className="space-y-3">
            <h4 className="text-sm font-semibold">Medical Guidelines Retrieved</h4>

            {results.guidelines.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No guidelines found</p>
            ) : (
                <div className="space-y-2">
                    {results.guidelines.map((guideline, idx) => (
                        <div
                            key={idx}
                            className="p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                        >
                            <div className="flex items-start justify-between gap-2 mb-1">
                                <h5 className="text-sm font-semibold">{guideline.title}</h5>
                                {guideline.relevance_score && (
                                    <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                                        {Math.round(guideline.relevance_score * 100)}% relevant
                                    </span>
                                )}
                            </div>

                            <p className="text-sm text-muted-foreground mb-2">
                                {guideline.content}
                            </p>

                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <ExternalLink className="h-3 w-3" />
                                <span>Source: {guideline.source}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
