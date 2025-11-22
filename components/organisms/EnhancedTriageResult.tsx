'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    AlertCircle,
    Phone,
    MapPin,
    Calendar,
    Mail,
    Download,
    Share2,
    Clock,
    CheckCircle2,
    AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useLanguageStore } from '@/store/languageStore';
import { translations } from '@/lib/translations';

interface EnhancedTriageResultProps {
    result: {
        severity: 'Emergency' | 'Urgent' | 'Moderate' | 'Mild';
        recommendation: string;
        nextSteps?: string[];
        whileYouWait?: string[];
    };
    patientData: {
        name: string;
        chiefComplaint: string;
    };
    onNewAssessment: () => void;
}

export function EnhancedTriageResult({ result, patientData, onNewAssessment }: EnhancedTriageResultProps) {
    const [isExporting, setIsExporting] = useState(false);
    const { language } = useLanguageStore();
    const t = translations[language];

    const getSeverityConfig = (severity: string) => {
        switch (severity) {
            case 'Emergency':
                return {
                    color: 'bg-destructive text-destructive-foreground border-destructive',
                    icon: AlertTriangle,
                    gradient: 'from-destructive/20 to-destructive/5',
                    pulse: true
                };
            case 'Urgent':
                return {
                    color: 'bg-warning text-warning-foreground border-warning',
                    icon: AlertCircle,
                    gradient: 'from-warning/20 to-warning/5',
                    pulse: false
                };
            case 'Moderate':
                return {
                    color: 'bg-primary text-primary-foreground border-primary',
                    icon: Clock,
                    gradient: 'from-primary/20 to-primary/5',
                    pulse: false
                };
            case 'Mild':
                return {
                    color: 'bg-success text-success-foreground border-success',
                    icon: CheckCircle2,
                    gradient: 'from-success/20 to-success/5',
                    pulse: false
                };
            default:
                return {
                    color: 'bg-muted text-muted-foreground',
                    icon: AlertCircle,
                    gradient: 'from-muted/20 to-muted/5',
                    pulse: false
                };
        }
    };

    const config = getSeverityConfig(result.severity);
    const Icon = config.icon;

    const handleFindClinic = () => {
        toast.info(t.chat.triage.clinicToast, {
            description: t.chat.triage.clinicDesc
        });
        // In real app: window.open with maps API
    };

    const handleBookAppointment = () => {
        toast.info(t.chat.triage.appointmentToast, {
            description: t.chat.triage.appointmentDesc
        });
    };

    const handleEmailDoctor = async () => {
        toast.success(t.chat.triage.emailToast, {
            description: t.chat.triage.emailDesc
        });
        // In real app: generate mailto link with full report
    };

    const handleDownloadPDF = async () => {
        setIsExporting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate PDF generation
            toast.success(t.chat.triage.downloadToast, {
                description: t.chat.triage.downloadDesc
            });
        } finally {
            setIsExporting(false);
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: t.chat.triage.shareTitle,
                text: `Triage result for ${patientData.chiefComplaint}`,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success(t.chat.triage.shareToast);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            <Card className={cn('overflow-hidden border-2', config.color.includes('border-'))}>
                {/* Header with gradient */}
                <div className={cn('bg-gradient-to-r p-6', config.gradient)}>
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                'p-3 rounded-full',
                                config.color,
                                config.pulse && 'animate-pulse'
                            )}>
                                <Icon className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-1">
                                    {t.chat.triage.title}
                                </h3>
                                <Badge className={config.color}>
                                    {result.severity}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <p className="mt-4 text-foreground/90 font-medium">
                        {result.recommendation}
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="p-4 bg-card border-t">
                    <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <span className="text-primary">⚡</span>
                        {t.chat.triage.quickActions}:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        {result.severity !== 'Mild' && (
                            <Button
                                variant="default"
                                size="sm"
                                onClick={handleFindClinic}
                                className="justify-start"
                            >
                                <MapPin className="h-4 w-4 mr-2" />
                                {t.chat.triage.findClinics}
                            </Button>
                        )}
                        {result.severity !== 'Emergency' && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleBookAppointment}
                                className="justify-start"
                            >
                                <Calendar className="h-4 w-4 mr-2" />
                                {t.chat.triage.bookAppointment}
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleEmailDoctor}
                            className="justify-start"
                        >
                            <Mail className="h-4 w-4 mr-2" />
                            {t.chat.triage.emailDoctor}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDownloadPDF}
                            disabled={isExporting}
                            className="justify-start"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            {isExporting ? t.chat.triage.generating : t.chat.triage.downloadPdf}
                        </Button>
                        {result.severity === 'Emergency' && (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => window.location.href = 'tel:911'}
                                className="col-span-2 justify-start font-semibold"
                            >
                                <Phone className="h-4 w-4 mr-2" />
                                {t.chat.triage.callEmergency}
                            </Button>
                        )}
                    </div>
                </div>

                {/* While You Wait Tips */}
                {result.whileYouWait && result.whileYouWait.length > 0 && (
                    <div className="p-4 bg-muted/30 border-t">
                        <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                            <span>💡</span>
                            {t.chat.triage.whileYouWait}:
                        </p>
                        <ul className="space-y-1.5 text-sm text-muted-foreground">
                            {result.whileYouWait.map((tip, index) => (
                                <li key={index} className="flex items-start gap-2">
                                    <span className="text-primary mt-0.5">•</span>
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Footer Actions */}
                <div className="p-4 bg-card border-t flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleShare}
                        >
                            <Share2 className="h-4 w-4 mr-2" />
                            {t.chat.triage.share}
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleDownloadPDF}
                            disabled={isExporting}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            {isExporting ? t.chat.triage.exporting : t.chat.triage.exportResult}
                        </Button>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onNewAssessment}
                    >
                        {t.chat.triage.startNew}
                    </Button>
                </div>
            </Card>
        </motion.div>
    );
}
