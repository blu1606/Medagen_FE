'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface QuickRepliesProps {
    suggestions: string[];

    onSelect: (reply: string) => void;
    isVisible?: boolean;
    label?: string;
}

export function QuickReplies({ suggestions, onSelect, isVisible = true, label = "Quick replies" }: QuickRepliesProps) {
    if (!isVisible || suggestions.length === 0) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="mb-3"
            >
                <p className="text-xs text-muted-foreground mb-2 px-1">
                    💡 {label}:
                </p>
                <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion, index) => (
                        <motion.div
                            key={suggestion}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onSelect(suggestion)}
                                className="text-sm rounded-full hover:bg-primary hover:text-primary-foreground transition-all"
                            >
                                {suggestion}
                            </Button>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

// Smart suggestions based on context
export function generateSmartReplies(context: {
    lastAIMessage?: string;
    symptom?: string;
    stage?: 'initial' | 'details' | 'assessment';
    t?: any;
}): string[] {
    const { lastAIMessage, symptom, stage, t } = context;

    // Helper to get translation or fallback
    const getT = (path: string, fallback: string) => {
        if (!t) return fallback;
        const keys = path.split('.');
        let value = t;
        for (const key of keys) {
            value = value?.[key];
        }
        return value || fallback;
    };

    // Context-aware suggestions based on last AI message
    if (lastAIMessage?.toLowerCase().includes('pain')) {
        return [
            getT('quickReplies.pain.throbbing', "Yes, it's throbbing"),
            getT('quickReplies.pain.dull', "No, it's a dull ache"),
            getT('quickReplies.pain.comesAndGoes', "It comes and goes"),
            getT('quickReplies.pain.constant', "It's constant")
        ];
    }

    if (lastAIMessage?.toLowerCase().includes('how long') || lastAIMessage?.toLowerCase().includes('when')) {
        return [
            getT('quickReplies.duration.today', "Just started today"),
            getT('quickReplies.duration.fewDays', "2-3 days ago"),
            getT('quickReplies.duration.week', "About a week"),
            getT('quickReplies.duration.moreThanWeek', "More than a week")
        ];
    }

    if (lastAIMessage?.toLowerCase().includes('worse') || lastAIMessage?.toLowerCase().includes('better')) {
        return [
            getT('quickReplies.progression.worse', "Getting worse"),
            getT('quickReplies.progression.same', "About the same"),
            getT('quickReplies.progression.better', "Getting better"),
            getT('quickReplies.progression.unsure', "Not sure")
        ];
    }

    if (lastAIMessage?.toLowerCase().includes('medication') || lastAIMessage?.toLowerCase().includes('medicine')) {
        return [
            getT('quickReplies.medication.paracetamol', "Yes, paracetamol"),
            getT('quickReplies.medication.ibuprofen', "Yes, ibuprofen"),
            getT('quickReplies.medication.none', "No medication yet"),
            getT('quickReplies.medication.regular', "I take regular medication")
        ];
    }

    // Symptom-specific suggestions
    if (symptom?.toLowerCase().includes('headache')) {
        return [
            getT('quickReplies.headache.behindEyes', "Behind my eyes"),
            getT('quickReplies.headache.wholeHead', "Whole head"),
            getT('quickReplies.headache.oneSide', "One side only"),
            getT('quickReplies.headache.backOfHead', "Back of head")
        ];
    }

    if (symptom?.toLowerCase().includes('fever')) {
        return [
            getT('quickReplies.fever.high', "Yes, high fever"),
            getT('quickReplies.fever.mild', "Mild fever"),
            getT('quickReplies.fever.none', "No fever"),
            getT('quickReplies.fever.unsure', "Not sure")
        ];
    }

    // Stage-based suggestions
    if (stage === 'initial') {
        return [
            getT('quickReplies.initial.tellMore', "Tell me more"),
            getT('quickReplies.initial.whatToDo', "What should I do?"),
            getT('quickReplies.initial.worried', "I'm worried"),
            getT('quickReplies.initial.serious', "Is this serious?")
        ];
    }

    // Default helpful responses
    return [
        getT('quickReplies.default.yes', "Yes"),
        getT('quickReplies.default.no', "No"),
        getT('quickReplies.default.notSure', "I'm not sure"),
        getT('quickReplies.default.explain', "Can you explain more?")
    ];
}
