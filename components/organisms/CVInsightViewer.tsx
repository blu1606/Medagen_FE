'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart4, ImageIcon, Info } from 'lucide-react';
import { ConfidenceMeter } from '../atoms/ConfidenceMeter';
import { cn } from '@/lib/utils';
import type { CVResults } from '@/types/react-flow';

export interface CVInsightViewerProps {
    results: CVResults;
    imageUrl?: string;
    showAnnotations?: boolean;
    interactive?: boolean;
    className?: string;
}

export function CVInsightViewer({
    results,
    imageUrl,
    showAnnotations = false,
    interactive = true,
    className
}: CVInsightViewerProps) {
    const [selectedCondition, setSelectedCondition] = useState<string | null>(null);

    const sortedPredictions = [...results.predictions].sort((a, b) => b.confidence - a.confidence);

    return (
        <div className={cn('space-y-4', className)}>
            {/* Predictions List */}
            <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                    <BarChart4 className="h-4 w-4" />
                    Model Predictions
                </h4>
                {sortedPredictions.map((pred, idx) => (
                    <div
                        key={idx}
                        className={cn(
                            'flex items-center justify-between p-3 rounded-lg border transition-all',
                            'hover:bg-accent cursor-pointer',
                            interactive && selectedCondition === pred.condition && 'bg-accent border-primary'
                        )}
                        onMouseEnter={() => interactive && setSelectedCondition(pred.condition)}
                        onMouseLeave={() => interactive && setSelectedCondition(null)}
                    >
                        <div className="flex items-center gap-3 flex-1">
                            <span className="text-sm font-medium">{pred.condition}</span>
                            {idx === 0 && (
                                <Badge variant="secondary" className="text-xs">
                                    Most Likely
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <ConfidenceMeter value={pred.confidence} compact showLabel={false} className="min-w-[80px]" />
                            <span className={cn(
                                "text-sm font-semibold tabular-nums min-w-[48px] text-right",
                                pred.confidence >= 0.8 && "text-green-600 dark:text-green-400",
                                pred.confidence >= 0.5 && pred.confidence < 0.8 && "text-yellow-600 dark:text-yellow-400",
                                pred.confidence < 0.5 && "text-red-600 dark:text-red-400"
                            )}>
                                {(pred.confidence * 100).toFixed(0)}%
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Visual Features */}
            {results.visual_features && results.visual_features.length > 0 && (
                <Card>
                    <CardContent className="pt-4">
                        <h4 className="text-sm font-semibold mb-3">🔍 Detected Visual Features</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {results.visual_features.map((feature, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-start gap-2 p-2 rounded bg-muted/50"
                                >
                                    <span className="text-green-500 mt-0.5">✓</span>
                                    <span className="text-sm">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Model Info */}
            {results.model_info && (
                <Card className="bg-muted/50">
                    <CardContent className="pt-4">
                        <div className="flex items-start gap-2 mb-2">
                            <Info className="h-4 w-4 mt-0.5 text-muted-foreground" />
                            <h4 className="text-sm font-semibold">Model Information</h4>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1 pl-6">
                            <p>Model: <strong>{results.model_info.name}</strong></p>
                            <p>Validation Accuracy: <strong>{(results.model_info.accuracy * 100).toFixed(1)}%</strong></p>
                            {results.model_info.trained_on && (
                                <p>Training Cases: <strong>{results.model_info.trained_on.toLocaleString()}</strong></p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Image Display (Simple version without Tabs) */}
            {imageUrl && (
                <Card>
                    <CardContent className="pt-4">
                        <div className="relative">
                            <img
                                src={imageUrl}
                                alt="Medical image"
                                className="w-full rounded-lg"
                            />
                            {showAnnotations && results.annotations && (
                                <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                                    Annotations: {results.annotations.length}
                                </div>
                            )}
                        </div>
                        <div className="mt-3 flex justify-end">
                            <Button variant="outline" size="sm">
                                <ImageIcon className="h-3 w-3 mr-1" />
                                Download Image
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
