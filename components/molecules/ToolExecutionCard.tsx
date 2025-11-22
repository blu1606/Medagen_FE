'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Wrench,
    Loader2,
    CheckCircle,
    XCircle,
    Clock,
    ChevronDown,
    ChevronUp,
    Cog,
    HelpCircle,
    Code
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ToolResultsDisplay } from './ToolResultsDisplay';
import { WhyThisToolModal } from '../organisms/WhyThisToolModal';
import { formatDuration } from '@/lib/react-flow-utils';
import type { ToolStatus, ToolResults } from '@/types/react-flow';

export interface ToolExecutionCardProps {
    toolName: string;
    displayName: string;
    status: ToolStatus;
    duration?: number;
    results?: ToolResults;
    stepNumber: number;
    onExpand?: (expanded: boolean) => void;
    initialExpanded?: boolean;
    showWhyButton?: boolean;
    className?: string;
}

function getStatusIcon(status: ToolStatus) {
    switch (status) {
        case 'running':
            return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
        case 'complete':
            return <CheckCircle className="h-4 w-4 text-green-500" />;
        case 'error':
            return <XCircle className="h-4 w-4 text-red-500" />;
        default:
            return <Clock className="h-4 w-4 text-gray-400" />;
    }
}

function getStatusColor(status: ToolStatus): string {
    switch (status) {
        case 'running': return 'bg-blue-500';
        case 'complete': return 'bg-green-500';
        case 'error': return 'bg-red-500';
        default: return 'bg-gray-400';
    }
}

export function ToolExecutionCard({
    toolName,
    displayName,
    status,
    duration,
    results,
    stepNumber,
    onExpand,
    initialExpanded = false,
    showWhyButton = true,
    className
}: ToolExecutionCardProps) {
    const [expanded, setExpanded] = useState(initialExpanded);
    const [showWhyModal, setShowWhyModal] = useState(false);

    const handleToggle = () => {
        const newExpanded = !expanded;
        setExpanded(newExpanded);
        onExpand?.(newExpanded);
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="flex gap-3 items-start"
            >
                {/* Tool Icon */}
                <div className={cn(
                    'h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0',
                    getStatusColor(status),
                    status === 'running' && 'animate-pulse'
                )}>
                    <Wrench className="h-4 w-4 text-white" />
                </div>

                {/* Tool Card */}
                <Card className={cn('flex-1', className)}>
                    <CardHeader
                        className="pb-2 pt-3 cursor-pointer hover:bg-accent/50 transition-colors"
                        onClick={handleToggle}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="gap-1">
                                    <Cog className="h-3 w-3" />
                                    Tool #{stepNumber}
                                </Badge>
                                <h3 className="text-base font-semibold">{displayName}</h3>
                                {getStatusIcon(status)}
                            </div>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                        </div>

                        {duration && status === 'complete' && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <Clock className="h-3 w-3" />
                                {formatDuration(duration)}
                            </p>
                        )}
                    </CardHeader>

                    <AnimatePresence>
                        {expanded && results && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                            >
                                <div className="border-t" />
                                <CardContent className="pt-3 pb-3">
                                    <ToolResultsDisplay
                                        toolName={toolName}
                                        results={results}
                                    />

                                    <div className="flex gap-2 mt-4">
                                        {showWhyButton && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowWhyModal(true);
                                                }}
                                            >
                                                <HelpCircle className="h-3 w-3 mr-1" />
                                                Why this tool?
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                console.log('View raw data', results);
                                            }}
                                        >
                                            <Code className="h-3 w-3 mr-1" />
                                            View raw data
                                        </Button>
                                    </div>
                                </CardContent>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Card>
            </motion.div>

            {/* Why This Tool Modal */}
            <WhyThisToolModal
                isOpen={showWhyModal}
                onClose={() => setShowWhyModal(false)}
                toolName={toolName}
                displayName={displayName}
            />
        </>
    );
}
