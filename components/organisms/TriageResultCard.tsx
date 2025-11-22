"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, CheckCircle, ArrowRight, MapPin, Phone, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TriageLevel = 'Emergency' | 'Urgent' | 'Moderate' | 'Mild';

interface TriageResultCardProps {
    result: {
        severity: TriageLevel;
        recommendation: string;
        whileYouWait?: string[];
    };
    onAction?: (action: string) => void;
    className?: string;
}

export function TriageResultCard({ result, onAction, className }: TriageResultCardProps) {
    const config = {
        Emergency: {
            color: "text-emergency",
            bg: "bg-emergency/10",
            border: "border-l-4 border-l-emergency",
            icon: AlertTriangle,
            title: "Immediate Care Required",
            badge: "Emergency",
            badgeVariant: "destructive" as const,
        },
        Urgent: {
            color: "text-urgent",
            bg: "bg-urgent/10",
            border: "border-l-4 border-l-urgent",
            icon: Clock,
            title: "Seek Medical Attention",
            badge: "Urgent",
            badgeVariant: "default" as const, // Using default as orange/amber usually
        },
        Moderate: {
            color: "text-primary",
            bg: "bg-primary/10",
            border: "border-l-4 border-l-primary",
            icon: FileText,
            title: "Schedule Appointment",
            badge: "Routine",
            badgeVariant: "secondary" as const,
        },
        Mild: {
            color: "text-success",
            bg: "bg-success/10",
            border: "border-l-4 border-l-success",
            icon: CheckCircle,
            title: "Self-Care at Home",
            badge: "Self-Care",
            badgeVariant: "outline" as const,
        }
    };

    const theme = config[result.severity] || config.Moderate;
    const Icon = theme.icon;

    return (
        <Card className={cn("overflow-hidden shadow-lg", theme.border, className)}>
            <CardHeader className={cn("pb-4", theme.bg)}>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-full bg-background", theme.color)}>
                            <Icon className="h-6 w-6" />
                        </div>
                        <div>
                            <CardTitle className={cn("text-xl", theme.color)}>{theme.title}</CardTitle>
                            <CardDescription className="mt-1 font-medium text-foreground/80">
                                {result.recommendation}
                            </CardDescription>
                        </div>
                    </div>
                    <Badge variant={theme.badgeVariant} className="text-sm px-3 py-1">
                        {theme.badge}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
                {/* While You Wait / Instructions */}
                {result.whileYouWait && result.whileYouWait.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                            Recommended Actions
                        </h4>
                        <ul className="space-y-2">
                            {result.whileYouWait.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm">
                                    <CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="grid sm:grid-cols-2 gap-3 pt-2">
                    {result.severity === 'Emergency' ? (
                        <Button className="w-full bg-emergency hover:bg-emergency/90 text-white" size="lg" onClick={() => onAction?.('call_911')}>
                            <Phone className="mr-2 h-4 w-4" /> Call Emergency Services
                        </Button>
                    ) : (
                        <Button className="w-full" onClick={() => onAction?.('find_clinic')}>
                            <MapPin className="mr-2 h-4 w-4" /> Find Nearby Clinics
                        </Button>
                    )}

                    <Button variant="outline" className="w-full" onClick={() => onAction?.('download_report')}>
                        <FileText className="mr-2 h-4 w-4" /> Save Report
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
