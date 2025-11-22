'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, AlertCircle, Phone, MapPin, Hospital } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RedFlag, TriageLevel } from '@/types/react-flow';

export interface RedFlagAlertProps {
    redFlags: RedFlag[];
    triageLevel: TriageLevel;
    recommendation: string;
    onEmergencyCall?: () => void;
    onFindHospital?: () => void;
    className?: string;
}

export function RedFlagAlert({
    redFlags,
    triageLevel,
    recommendation,
    onEmergencyCall,
    onFindHospital,
    className
}: RedFlagAlertProps) {
    if (redFlags.length === 0) return null;

    const isEmergency = triageLevel === 'emergency';
    const isUrgent = triageLevel === 'urgent';

    const handleEmergencyCall = () => {
        if (onEmergencyCall) {
            onEmergencyCall();
        } else {
            window.location.href = 'tel:115';
        }
    };

    const handleFindHospital = () => {
        if (onFindHospital) {
            onFindHospital();
        } else {
            window.open('https://www.google.com/maps/search/hospital+near+me', '_blank');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
                duration: 0.5,
                type: 'spring',
                bounce: 0.4
            }}
            className={cn(
                'rounded-lg border-2',
                isEmergency && 'border-red-500 bg-red-50 dark:bg-red-950/30 red-flag-pulse',
                isUrgent && 'border-orange-500 bg-orange-50 dark:bg-orange-950/30',
                !isEmergency && !isUrgent && 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30',
                className
            )}
        >
            <Alert variant={isEmergency ? 'destructive' : 'default'} className="border-0 bg-transparent">
                <AlertTriangle className="h-5 w-5" />
                <AlertTitle className="flex items-center gap-2 text-base">
                    {isEmergency && '🚨'} RED FLAGS DETECTED
                </AlertTitle>
                <AlertDescription>
                    <div className="space-y-3 mt-3">
                        {/* Red Flags List */}
                        {redFlags.map((flag, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex gap-2"
                            >
                                <AlertCircle className={cn(
                                    "h-5 w-5 flex-shrink-0 mt-0.5",
                                    flag.severity === 'critical' && "text-red-600 dark:text-red-400",
                                    flag.severity === 'high' && "text-orange-600 dark:text-orange-400",
                                    flag.severity === 'medium' && "text-yellow-600 dark:text-yellow-400"
                                )} />
                                <div>
                                    <p className="font-semibold text-sm">{flag.symptom}</p>
                                    <p className="text-xs text-muted-foreground">{flag.risk}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="border-t my-4" />

                    {/* Recommendation */}
                    <div className="p-3 bg-background rounded-md">
                        <p className="font-semibold flex items-center gap-2 mb-1">
                            <Hospital className="h-4 w-4" />
                            RECOMMENDATION
                        </p>
                        <p className="text-sm">{recommendation}</p>
                        {isEmergency && (
                            <p className="text-sm font-bold text-red-600 dark:text-red-400 mt-2">
                                ⚠️ DO NOT delay. This requires immediate medical attention.
                            </p>
                        )}
                    </div>

                    {/* Emergency Actions */}
                    {(isEmergency || isUrgent) && (
                        <div className="flex flex-col sm:flex-row gap-2 mt-4">
                            <Button
                                variant={isEmergency ? "destructive" : "default"}
                                className="flex-1"
                                onClick={handleEmergencyCall}
                            >
                                <Phone className="h-4 w-4 mr-2" />
                                {isEmergency ? 'Call Emergency: 115' : 'Call Healthcare Hotline'}
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={handleFindHospital}
                            >
                                <MapPin className="h-4 w-4 mr-2" />
                                Find Nearest Hospital
                            </Button>
                        </div>
                    )}
                </AlertDescription>
            </Alert>
        </motion.div>
    );
}
