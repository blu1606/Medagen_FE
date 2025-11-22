"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import dynamic from 'next/dynamic';
import { ArrowRight, Check, ShieldAlert, Clock, Activity, Loader2, ImagePlus, X } from 'lucide-react';

const AdvancedBodyMap = dynamic(
    () => import('@/components/organisms/AdvancedBodyMap').then(mod => mod.AdvancedBodyMap),
    { ssr: false }
);
import { cn } from '@/lib/utils';
import { useLanguageStore } from '@/store/languageStore';
import { translations } from '@/lib/translations';
import { useCreateSession } from '@/hooks/useStores';
import { useImageUpload } from '@/hooks/use-image-upload';

// Types
type IntakeData = {
    triageLevel: 'emergency' | 'urgent' | 'routine' | null;
    chiefComplaint: string;
    bodyParts: string[];
    painLevel: number;
    duration: string;
    symptomImage?: string;
};

export function WizardIntake() {
    const { createSession, isLoading, error } = useCreateSession();
    const [step, setStep] = useState(0);
    const [isMounted, setIsMounted] = useState(false);
    const [data, setData] = useState<IntakeData>({
        triageLevel: null,
        chiefComplaint: '',
        bodyParts: [],
        painLevel: 0,
        duration: '',
    });
    const [bodyMapSide, setBodyMapSide] = useState<'front' | 'back'>('front');
    const { language } = useLanguageStore();
    const t = translations[language];

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const updateData = (updates: Partial<IntakeData>) => {
        setData(prev => ({ ...prev, ...updates }));
    };

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    const handleComplete = async () => {
        try {
            await createSession({
                name: "Guest User", // Default for now
                age: 30, // Default
                chiefComplaint: data.chiefComplaint,
                duration: data.duration,
                painLevel: data.painLevel,
                triageLevel: data.triageLevel || 'routine',
                bodyParts: data.bodyParts
            });
            // Navigation handled by useCreateSession hook
        } catch (error) {
            console.error('Failed to create session:', error);
        }
    };

    const handleEmergency = async () => {
        try {
            await createSession({
                name: "Guest User",
                age: 30,
                chiefComplaint: "Emergency Triage Selected",
                triageLevel: 'emergency',
                painLevel: 10,
                duration: 'Acute'
            });
            // Navigation handled by useCreateSession hook
        } catch (error) {
            console.error('Failed to create emergency session:', error);
        }
    };

    // Step 0: Triage Assessment
    const StepTriage = () => (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">{t.intake.triage.title}</h2>
                <p className="text-muted-foreground">{t.intake.triage.subtitle}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card
                    className="cursor-pointer hover:border-emergency hover:bg-emergency/5 transition-all"
                    onClick={handleEmergency}
                >
                    <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-emergency/10 flex items-center justify-center text-emergency">
                            <ShieldAlert size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-emergency">{t.intake.triage.emergency.title}</h3>
                            <p className="text-sm text-muted-foreground mt-2">{t.intake.triage.emergency.description}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card
                    className={cn(
                        "cursor-pointer hover:border-urgent hover:bg-urgent/5 transition-all",
                        data.triageLevel === 'urgent' && "border-urgent bg-urgent/5 ring-2 ring-urgent"
                    )}
                    onClick={() => {
                        updateData({ triageLevel: 'urgent' });
                        nextStep();
                    }}
                >
                    <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-urgent/10 flex items-center justify-center text-urgent">
                            <Clock size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-urgent">{t.intake.triage.urgent.title}</h3>
                            <p className="text-sm text-muted-foreground mt-2">{t.intake.triage.urgent.description}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card
                    className={cn(
                        "cursor-pointer hover:border-primary hover:bg-primary/5 transition-all",
                        data.triageLevel === 'routine' && "border-primary bg-primary/5 ring-2 ring-primary"
                    )}
                    onClick={() => {
                        updateData({ triageLevel: 'routine' });
                        nextStep();
                    }}
                >
                    <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <Activity size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-primary">{t.intake.triage.routine.title}</h3>
                            <p className="text-sm text-muted-foreground mt-2">{t.intake.triage.routine.description}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );

    // Step 1: Chief Complaint
    const imageUpload = useImageUpload();

    const handleComplaintKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && data.chiefComplaint) {
            nextStep();
        }
    };

    const StepComplaint = () => (
        <div className="space-y-6 max-w-md mx-auto">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">{t.intake.complaint.title}</h2>
                <p className="text-muted-foreground">{t.intake.complaint.subtitle}</p>
            </div>

            <div className="space-y-4">
                <Input
                    placeholder={t.intake.complaint.placeholder}
                    className="text-lg h-12"
                    value={data.chiefComplaint}
                    onChange={(e) => updateData({ chiefComplaint: e.target.value })}
                    onKeyPress={handleComplaintKeyPress}
                    autoFocus
                />

                {/* Image Upload Section */}
                <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">{t.intake.complaint.uploadImage}</Label>
                    <div className="flex items-center gap-3">
                        <input
                            ref={imageUpload.fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={imageUpload.handleFileChange}
                            className="hidden"
                        />
                        {!imageUpload.previewUrl ? (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={imageUpload.handleThumbnailClick}
                                className="flex-1 h-24 border-dashed"
                            >
                                <div className="flex flex-col items-center gap-2">
                                    <ImagePlus className="h-6 w-6 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">{t.intake.complaint.addPhoto}</span>
                                </div>
                            </Button>
                        ) : (
                            <div className="relative flex-1 h-24 rounded-lg border overflow-hidden">
                                <img
                                    src={imageUpload.previewUrl}
                                    alt="Symptom preview"
                                    className="w-full h-full object-cover"
                                />
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2 h-6 w-6"
                                    onClick={imageUpload.handleRemove}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                    {imageUpload.fileName && (
                        <p className="text-xs text-muted-foreground">{imageUpload.fileName}</p>
                    )}
                </div>

                <div className="flex gap-4">
                    <Button
                        variant="outline"
                        onClick={prevStep}
                        className="flex-1 h-12 text-lg"
                    >
                        {t.intake.complaint.back}
                    </Button>
                    <Button
                        className="flex-1 h-12 text-lg"
                        disabled={!data.chiefComplaint}
                        onClick={nextStep}
                    >
                        {t.intake.complaint.next} <ArrowRight className="ml-2" />
                    </Button>
                </div>
            </div>
        </div>
    );

    // Step 2: Body Map & Details
    const StepDetails = () => (
        <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="space-y-6">
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold">{t.intake.details.title}</h2>
                    <p className="text-muted-foreground">{t.intake.details.subtitle}</p>
                </div>
                <div className="flex justify-center py-4">
                    {isMounted && (
                        <AdvancedBodyMap
                            selectedParts={data.bodyParts}
                            onChange={(parts) => updateData({ bodyParts: parts })}
                            className="w-full max-w-md"
                            side={bodyMapSide}
                            onSideChange={setBodyMapSide}
                        />
                    )}
                </div>
            </div>

            <div className="space-y-6 pt-4">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>{t.intake.details.duration.label}</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {[t.intake.details.duration.options.today, t.intake.details.duration.options.days, t.intake.details.duration.options.week, t.intake.details.duration.options.longer].map((opt) => (
                                <Button
                                    key={opt}
                                    variant={data.duration === opt ? "default" : "outline"}
                                    onClick={() => updateData({ duration: opt })}
                                    className="w-full"
                                >
                                    {opt}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>{t.intake.details.painLevel}</Label>
                        <div className="flex items-center gap-4">
                            <span className="text-2xl">😊</span>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={data.painLevel}
                                onChange={(e) => updateData({ painLevel: parseInt(e.target.value) })}
                                className="w-full accent-primary h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                            />
                            <span className="text-2xl">😫</span>
                        </div>
                        <div className="text-center font-bold text-lg text-primary">{data.painLevel}</div>
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <Button variant="outline" onClick={prevStep} className="flex-1" disabled={isLoading}>{t.intake.complaint.back}</Button>
                    <Button onClick={handleComplete} className="flex-1" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {t.intake.details.creatingSession}
                            </>
                        ) : (
                            <>
                                {t.intake.details.startAssessment} <Check className="ml-2" />
                            </>
                        )}
                    </Button>
                </div>
                {error && (
                    <div className="text-sm text-red-600 dark:text-red-400 mt-2">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );

    const steps = [StepTriage, StepComplaint, StepDetails];
    const CurrentStepComponent = steps[step];

    return (
        <div className="w-full max-w-4xl mx-auto p-4 min-h-[600px] flex flex-col justify-center">
            {/* Progress Bar */}
            <div className="mb-8">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>{t.intake.steps.triage}</span>
                    <span>{t.intake.steps.complaint}</span>
                    <span>{t.intake.steps.details}</span>
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    <CurrentStepComponent />
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
