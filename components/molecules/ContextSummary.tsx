"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Clock, Activity, User, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ContextSummaryProps {
    patientName?: string;
    chiefComplaint: string;
    duration: string;
    severity: number;
    triageLevel?: 'emergency' | 'urgent' | 'routine';
    className?: string;
}

export function ContextSummary({
    patientName = "Guest User",
    chiefComplaint,
    duration,
    severity,
    triageLevel = 'routine',
    className
}: ContextSummaryProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    const toggleExpand = () => setIsExpanded(!isExpanded);

    const triageColors = {
        emergency: "bg-emergency text-emergency-foreground",
        urgent: "bg-urgent text-urgent-foreground",
        routine: "bg-primary text-primary-foreground",
    };

    return (
        <Card className={cn("border-none shadow-md bg-background/80 backdrop-blur-md sticky top-0 z-10", className)}>
            <CardContent className="p-0">
                <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={toggleExpand}
                >
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className={cn("h-2 w-2 rounded-full shrink-0", triageColors[triageLevel].split(' ')[0])} />
                        <span className="font-semibold truncate">
                            {chiefComplaint || "New Consultation"}
                        </span>
                        {!isExpanded && (
                            <Badge variant="outline" className="ml-2 text-xs hidden sm:inline-flex">
                                {duration}
                            </Badge>
                        )}
                    </div>
                    <button className="text-muted-foreground hover:text-foreground transition-colors">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                </div>

                <AnimatePresence initial={false}>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden border-t"
                        >
                            <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                                <div className="flex flex-col gap-1">
                                    <span className="text-muted-foreground flex items-center gap-1">
                                        <User size={12} /> Patient
                                    </span>
                                    <span className="font-medium">{patientName}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-muted-foreground flex items-center gap-1">
                                        <AlertCircle size={12} /> Complaint
                                    </span>
                                    <span className="font-medium truncate" title={chiefComplaint}>{chiefComplaint}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-muted-foreground flex items-center gap-1">
                                        <Clock size={12} /> Duration
                                    </span>
                                    <span className="font-medium">{duration}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-muted-foreground flex items-center gap-1">
                                        <Activity size={12} /> Severity
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden max-w-[60px]">
                                            <div
                                                className={cn("h-full", triageColors[triageLevel].split(' ')[0])}
                                                style={{ width: `${severity * 10}%` }}
                                            />
                                        </div>
                                        <span className="font-medium">{severity}/10</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
}
