'use client';

import React from 'react';
import { ConfidenceMeter } from '../atoms/ConfidenceMeter';
import type { CVResults } from '@/types/react-flow';

interface CVPredictionsDisplayProps {
    results: CVResults;
}

export function CVPredictionsDisplay({ results }: CVPredictionsDisplayProps) {
    // Sort predictions by confidence (highest first)
    const sortedPredictions = [...results.predictions].sort((a, b) => b.confidence - a.confidence);

    return (
        <div className="space-y-3">
            {/* Predictions */}
            <div className="space-y-2">
                <h4 className="text-sm font-semibold">Model Predictions</h4>
                {sortedPredictions.map((pred, idx) => (
                    <div
                        key={idx}
                        className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors"
                    >
                        <span className="text-sm font-medium flex-1">{pred.condition}</span>
                        <div className="flex items-center gap-2 min-w-[140px]">
                            <ConfidenceMeter value={pred.confidence} compact showLabel />
                        </div>
                    </div>
                ))}
            </div>

            {/* Visual Features */}
            {results.visual_features && results.visual_features.length > 0 && (
                <div className="mt-4 pt-3 border-t">
                    <h4 className="text-sm font-semibold mb-2">Detected Visual Features</h4>
                    <ul className="space-y-1">
                        {results.visual_features.map((feature, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-green-500 mt-0.5">✓</span>
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Model Info */}
            {results.model_info && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                    <h4 className="text-xs font-semibold mb-1">Model Information</h4>
                    <div className="text-xs text-muted-foreground space-y-0.5">
                        <p>Model: {results.model_info.name}</p>
                        <p>Validation Accuracy: {(results.model_info.accuracy * 100).toFixed(1)}%</p>
                        {results.model_info.trained_on && (
                            <p>Training Cases: {results.model_info.trained_on.toLocaleString()}</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
