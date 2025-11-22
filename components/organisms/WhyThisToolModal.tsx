'use client';

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Lightbulb, XCircle } from 'lucide-react';

export interface WhyThisToolModalProps {
    isOpen: boolean;
    onClose: () => void;
    toolName: string;
    displayName: string;
    reasoning?: {
        signals: Array<{
            signal: string;
            explanation: string;
        }>;
        alternatives?: Array<{
            tool: string;
            reason: string;
        }>;
    };
}

// Default reasoning based on tool type
function getDefaultReasoning(toolName: string) {
    const reasoningMap: Record<string, any> = {
        derm_cv: {
            signals: [
                {
                    signal: 'Skin-related symptoms mentioned',
                    explanation: 'User described symptoms related to skin conditions (rash, lesion, discoloration, etc.)'
                },
                {
                    signal: 'Image uploaded',
                    explanation: 'Visual analysis is needed for accurate dermatological assessment'
                }
            ],
            alternatives: [
                { tool: 'wound_cv', reason: 'No open wound detected' },
                { tool: 'text-only diagnosis', reason: 'Less accurate without visual confirmation' }
            ]
        },
        eye_cv: {
            signals: [
                {
                    signal: 'Eye-related symptoms',
                    explanation: 'User mentioned symptoms affecting the eyes (redness, discharge, pain, etc.)'
                },
                {
                    signal: 'Image provided',
                    explanation: 'Computer vision analysis provides more accurate assessment of eye conditions'
                }
            ],
            alternatives: [
                { tool: 'general_cv', reason: 'Eye-specific model is more accurate for ophthalmological conditions' }
            ]
        },
        wound_cv: {
            signals: [
                {
                    signal: 'Open wound or injury mentioned',
                    explanation: 'User described an injury, cut, burn, or open wound'
                },
                {
                    signal: 'Visual assessment needed',
                    explanation: 'Wound assessment requires visual analysis of size, depth, and infection signs'
                }
            ]
        },
        triage_rules: {
            signals: [
                {
                    signal: 'Sufficient symptom information',
                    explanation: 'Collected enough details to assess severity and urgency'
                },
                {
                    signal: 'Need to determine care level',
                    explanation: 'System must classify the appropriate level of medical attention needed'
                }
            ]
        },
        guideline_retrieval: {
            signals: [
                {
                    signal: 'Specific medical condition identified',
                    explanation: 'Condition matches medical guidelines database'
                },
                {
                    signal: 'Evidence-based recommendations needed',
                    explanation: 'Provide user with clinically validated information'
                }
            ]
        }
    };

    return reasoningMap[toolName] || {
        signals: [
            {
                signal: 'Tool selection based on symptoms',
                explanation: 'This tool was chosen based on the user\'s reported symptoms and context'
            }
        ]
    };
}

export function WhyThisToolModal({
    isOpen,
    onClose,
    toolName,
    displayName,
    reasoning
}: WhyThisToolModalProps) {
    const finalReasoning = reasoning || getDefaultReasoning(toolName);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-yellow-500" />
                        Why did I use {displayName}?
                    </DialogTitle>
                    <DialogDescription>
                        Here's my reasoning for choosing this specific tool
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Signals */}
                    <div>
                        <h4 className="font-semibold mb-3">I chose this tool because:</h4>
                        <div className="space-y-3">
                            {finalReasoning.signals.map((item: any, idx: number) => (
                                <div key={idx} className="flex gap-3">
                                    <div className="h-6 w-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{item.signal}</p>
                                        <p className="text-sm text-muted-foreground">{item.explanation}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Alternatives (if any) */}
                    {finalReasoning.alternatives && finalReasoning.alternatives.length > 0 && (
                        <div className="pt-3 border-t">
                            <h4 className="font-semibold mb-3">Alternative tools considered:</h4>
                            <div className="space-y-2">
                                {finalReasoning.alternatives.map((alt: any, idx: number) => (
                                    <div key={idx} className="flex gap-3">
                                        <div className="h-6 w-6 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center flex-shrink-0">
                                            <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{alt.tool}</p>
                                            <p className="text-sm text-muted-foreground">Ruled out: {alt.reason}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Learn More */}
                    <div className="pt-3 border-t bg-muted/50 p-3 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                            💡 <strong>Tip:</strong> The AI agent uses multiple specialized tools to provide accurate health assessments.
                            Each tool is selected based on your symptoms and the type of analysis needed.
                        </p>
                    </div>

                    {/* Close Button */}
                    <div className="flex justify-end pt-2">
                        <Button onClick={onClose}>
                            Got it! ✓
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
