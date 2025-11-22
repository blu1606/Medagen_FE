'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { getConfidenceBgColor, getConfidenceColor, getConfidenceInterpretation } from '@/lib/react-flow-utils';

export interface ConfidenceMeterProps {
    value: number; // 0.0 to 1.0
    showLabel?: boolean;
    showTooltip?: boolean;
    compact?: boolean;
    className?: string;
}

export function ConfidenceMeter({
    value,
    showLabel = true,
    showTooltip = true,
    compact = false,
    className
}: ConfidenceMeterProps) {
    const percentage = Math.round(value * 100);
    const bgColor = getConfidenceBgColor(value);
    const textColor = getConfidenceColor(value);
    const interpretation = getConfidenceInterpretation(value);

    const meter = (
        <div className={cn('flex items-center gap-2', className)}>
            {/* Progress Bar */}
            <div className={cn(
                'flex-1 bg-secondary rounded-full overflow-hidden',
                compact ? 'h-1.5 min-w-[60px]' : 'h-2 min-w-[100px]'
            )}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={cn('h-full', bgColor)}
                />
            </div>

            {/* Percentage Label */}
            {showLabel && (
                <span className={cn(
                    'font-semibold tabular-nums',
                    compact ? 'text-xs' : 'text-sm',
                    textColor
                )}>
                    {percentage}%
                </span>
            )}
        </div>
    );

    if (!showTooltip) {
        return meter;
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="cursor-help">
                        {meter}
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <div className="space-y-1">
                        <p className="font-medium">{interpretation}</p>
                        <p className="text-xs text-muted-foreground">
                            Uncertainty range: ±{Math.round((1 - value) * 10)}%
                        </p>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
