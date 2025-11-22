"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import dynamic from 'next/dynamic';
import { ArrowLeft, Loader2, Check } from 'lucide-react';
import Link from 'next/link';

const AdvancedBodyMap = dynamic(
    () => import('@/components/organisms/AdvancedBodyMap').then(mod => mod.AdvancedBodyMap),
    { ssr: false }
);

import { useLanguageStore } from '@/store/languageStore';
import { translations } from '@/lib/translations';
import { useCreateSession } from '@/hooks/useStores';

type IntakeData = {
    name: string;
    age: number | '';
    medicalHistory: string;
    currentMedications: string;
    chiefComplaint: string;
    bodyParts: string[];
    painLevel: number;
    duration: string;
};

export function WizardIntake() {
    const { createSession, isLoading, error } = useCreateSession();
    const [isMounted, setIsMounted] = useState(false);
    const [data, setData] = useState<IntakeData>({
        name: '',
        age: '',
        medicalHistory: '',
        currentMedications: '',
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.name || !data.age) {
            return;
        }

        try {
            await createSession({
                name: data.name,
                age: typeof data.age === 'number' ? data.age : parseInt(data.age),
                medicalHistory: data.medicalHistory,
                currentMedications: data.currentMedications,
                bodyParts: data.bodyParts,
                painLevel: data.painLevel,
                duration: data.duration,
                chiefComplaint: data.chiefComplaint,
                triageLevel: 'routine', // Default to routine
            });
        } catch (error) {
            console.error('Failed to create session:', error);
        }
    };

    const isFormValid = data.name.trim() !== '' && data.age !== '';

    return (
        <div className="container mx-auto py-8 px-4 max-w-6xl">
            {/* Header */}
            <div className="mb-8">
                <Link href="/">
                    <Button variant="ghost" size="sm" className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {t.intake.form.backToHome}
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold">{t.intake.form.title}</h1>
                <p className="text-muted-foreground mt-2">{t.intake.form.subtitle}</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left Column - Form Fields */}
                    <div className="space-y-6">
                        {/* Personal Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">{t.intake.form.personalInfo.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">
                                        {t.intake.form.personalInfo.name.label} <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => updateData({ name: e.target.value })}
                                        placeholder={t.intake.form.personalInfo.name.placeholder}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="age">
                                        {t.intake.form.personalInfo.age.label} <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="age"
                                        type="number"
                                        min="0"
                                        max="150"
                                        value={data.age}
                                        onChange={(e) => updateData({ age: e.target.value ? parseInt(e.target.value) : '' })}
                                        placeholder={t.intake.form.personalInfo.age.placeholder}
                                        required
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Medical Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">{t.intake.form.medicalInfo.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="medicalHistory">
                                        {t.intake.form.medicalInfo.history.label}
                                    </Label>
                                    <Textarea
                                        id="medicalHistory"
                                        value={data.medicalHistory}
                                        onChange={(e) => updateData({ medicalHistory: e.target.value })}
                                        placeholder={t.intake.form.medicalInfo.history.placeholder}
                                        rows={3}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="currentMedications">
                                        {t.intake.form.medicalInfo.medications.label}
                                    </Label>
                                    <Textarea
                                        id="currentMedications"
                                        value={data.currentMedications}
                                        onChange={(e) => updateData({ currentMedications: e.target.value })}
                                        placeholder={t.intake.form.medicalInfo.medications.placeholder}
                                        rows={3}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Symptoms - Duration and Pain */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">{t.intake.form.symptoms.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="chiefComplaint">{t.intake.form.symptoms.chiefComplaint.label}</Label>
                                    <Textarea
                                        id="chiefComplaint"
                                        value={data.chiefComplaint}
                                        onChange={(e) => updateData({ chiefComplaint: e.target.value })}
                                        placeholder={t.intake.form.symptoms.chiefComplaint.placeholder}
                                        rows={3}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="duration">{t.intake.form.symptoms.duration.label}</Label>
                                    <Select value={data.duration} onValueChange={(value) => updateData({ duration: value })}>
                                        <SelectTrigger id="duration">
                                            <SelectValue placeholder={t.intake.form.symptoms.duration.label} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="today">{t.intake.form.symptoms.duration.options.today}</SelectItem>
                                            <SelectItem value="days">{t.intake.form.symptoms.duration.options.days}</SelectItem>
                                            <SelectItem value="week">{t.intake.form.symptoms.duration.options.week}</SelectItem>
                                            <SelectItem value="longer">{t.intake.form.symptoms.duration.options.longer}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>{t.intake.form.symptoms.painLevel.label}</Label>
                                    <Slider
                                        value={[data.painLevel]}
                                        onValueChange={(val) => updateData({ painLevel: val[0] })}
                                        min={0}
                                        max={10}
                                        step={1}
                                    />
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>{t.intake.form.symptoms.painLevel.noPain}</span>
                                        <span className="font-medium text-foreground">{data.painLevel} / 10</span>
                                        <span>{t.intake.form.symptoms.painLevel.worstPain}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Body Map */}
                    <div>
                        <Card className="sticky top-8">
                            <CardHeader>
                                <CardTitle className="text-lg">{t.intake.form.symptoms.bodyParts.label}</CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    {t.intake.form.symptoms.bodyParts.instruction}
                                </p>
                            </CardHeader>
                            <CardContent>
                                {isMounted && (
                                    <AdvancedBodyMap
                                        selectedParts={data.bodyParts}
                                        onChange={(parts) => updateData({ bodyParts: parts })}
                                        side={bodyMapSide}
                                        onSideChange={setBodyMapSide}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="mt-8 flex justify-center">
                    <Button
                        type="submit"
                        size="lg"
                        disabled={!isFormValid || isLoading}
                        className="min-w-[200px]"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {t.intake.form.submitting}
                            </>
                        ) : (
                            <>
                                {t.intake.form.submit} <Check className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                </div>

                {error && (
                    <div className="mt-4 text-center text-sm text-red-600 dark:text-red-400">
                        {error}
                    </div>
                )}
            </form>
        </div>
    );
}
