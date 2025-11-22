'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Brain, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ThoughtStep } from '@/types/react-flow';

interface ThoughtBubbleProps {
    thought: string;
    timestamp: string;
    stepNumber: number;
    variant?: 'initial' | 'intermediate' | 'final';
    className?: string;
}

const variantStyles = {
    initial: 'border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/50',
    intermediate: 'border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/50',
    final: 'border-l-green-500 bg-green-50/50 dark:bg-green-950/50'
};

const variantBadgeStyles = {
    initial: 'border-blue-500 text-blue-700 dark:text-blue-300',
    intermediate: 'border-amber-500 text-amber-700 dark:text-amber-300',
    final: 'border-green-500 text-green-700 dark:text-green-300'
};

function formatTime(timestamp: string): string {
    try {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    } catch {
        return '';
    }
}

export function ThoughtBubble({
    thought,
    timestamp,
    stepNumber,
    variant = 'intermediate',
    className
}: ThoughtBubbleProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex gap-3 items-start"
        >
            {/* AI Avatar */}
            <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src="/ai-avatar.png" alt="AI" />
                <AvatarFallback className="bg-primary text-primary-foreground">
                    AI
                </AvatarFallback>
            </Avatar>

            {/* Thought Card */}
            <Card className={cn(
                'flex-1 border-l-4',
                variantStyles[variant],
                className
            )}>
                <CardHeader className="pb-2 pt-3">
                    <div className="flex items-center justify-between">
                        <Badge
                            variant="outline"
                            className={cn('gap-1', variantBadgeStyles[variant])}
                        >
                            <Brain className="h-3 w-3" />
                            Thought #{stepNumber}
                        </Badge>
                        <time className="text-xs text-muted-foreground">
                            {formatTime(timestamp)}
                        </time>
                    </div>
                </CardHeader>
                <CardContent className="pb-3">
                    <p className="text-sm italic text-muted-foreground flex items-start gap-2">
                        <MessageCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <span>{thought}</span>
                    </p>
                </CardContent>
            </Card>
        </motion.div>
    );
}
