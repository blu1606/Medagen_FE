// AssessmentPanel – right‑hand panel for displaying symptom assessment (read-only)
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { AdvancedBodyMap } from '@/components/organisms/AdvancedBodyMap';
import { useSessionStore } from '@/store/sessionStore';
import { useLanguageStore } from '@/store/languageStore';
import { translations } from '@/lib/translations';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export function AssessmentPanel({ className }: { className?: string }) {
    const [collapsed, setCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState("model");
    const [bodyMapSide, setBodyMapSide] = useState<'front' | 'back'>('front');
    const { language } = useLanguageStore();
    const t = translations[language];

    const toggle = () => setCollapsed(!collapsed);

    // Read data from session store (intake data), not assessment store
    const { getCurrentSession } = useSessionStore();
    const currentSession = getCurrentSession();
    const patientData = currentSession?.patientData;

    // Extract values from patient data
    const selectedParts = patientData?.bodyParts || [];
    const painLevel = patientData?.painLevel || 0;
    const duration = patientData?.duration || '';

    return (
        <div className={
            `flex flex-col border-l bg-muted/5 h-screen transition-all duration-300 ${collapsed ? 'w-12' : 'w-[320px]'
            } ${className || ''}`
        }>
            {/* Header */}
            <div className="flex items-center justify-between p-2 border-b">
                {!collapsed && <h3 className="font-semibold">{t.intake.details.assessmentPanel.title}</h3>}
                <Button variant="ghost" size="icon" onClick={toggle}>
                    {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
            </div>

            {/* Content – hidden when collapsed */}
            {!collapsed && (
                <div className="flex-1 overflow-y-auto p-2 space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <Tabs className="w-full h-full flex flex-col">
                        <TabsList className="grid w-full grid-cols-2 shrink-0">
                            <TabsTrigger value="model" activeValue={activeTab} onValueChange={setActiveTab}>{t.intake.details.assessmentPanel.tabs.model}</TabsTrigger>
                            <TabsTrigger value="assess" activeValue={activeTab} onValueChange={setActiveTab}>{t.intake.details.assessmentPanel.tabs.assess}</TabsTrigger>
                        </TabsList>

                        <TabsContent value="model" activeValue={activeTab} className="flex-1 flex flex-col min-h-0 mt-2">
                            {/* Body Map - Read Only (but can toggle front/back) */}
                            <div className="flex-1 min-h-0 flex items-center justify-center overflow-hidden">
                                <AdvancedBodyMap
                                    selectedParts={selectedParts}
                                    onChange={() => { }} // Read-only - no selection changes allowed
                                    side={bodyMapSide}
                                    onSideChange={setBodyMapSide}
                                    className="w-full h-full max-w-[280px] object-contain"
                                />
                            </div>
                            <div className="mt-2 text-xs text-muted-foreground text-center shrink-0">
                                {selectedParts.length > 0
                                    ? `${t.intake.details.bodyMap.selectAreas}: ${selectedParts.join(', ')}`
                                    : t.intake.details.bodyMap.selectAreas
                                }
                            </div>
                        </TabsContent>

                        <TabsContent value="assess" activeValue={activeTab} className="space-y-4">
                            {/* Patient Info */}
                            {(patientData?.name || patientData?.age) && (
                                <div className="space-y-2">
                                    <div className="font-medium text-sm">{t.intake.details.assessmentPanel.patientInfo.title}</div>
                                    <div className="p-3 border rounded-lg bg-muted/50 space-y-1">
                                        {patientData?.name && (
                                            <div className="text-sm">
                                                <span className="font-medium">{t.intake.details.assessmentPanel.patientInfo.name}:</span> {patientData.name}
                                            </div>
                                        )}
                                        {patientData?.age && (
                                            <div className="text-sm">
                                                <span className="font-medium">{t.intake.form.personalInfo.age.label}:</span> {patientData.age} {t.intake.details.assessmentPanel.patientInfo.age}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Chief Complaint */}
                            {patientData?.chiefComplaint && (
                                <div className="space-y-2">
                                    <div className="font-medium text-sm">{t.intake.details.assessmentPanel.chiefComplaint.title}</div>
                                    <div className="p-3 border rounded-lg bg-muted/50">
                                        <div className="text-sm whitespace-pre-wrap">
                                            {patientData.chiefComplaint}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Pain Level */}
                            <div className="space-y-2">
                                <div className="font-medium text-sm">{t.intake.details.assessmentPanel.painLevel.label}</div>
                                <div className="p-4 border rounded-lg bg-muted/50">
                                    <div className="text-2xl font-bold text-center">{painLevel} / 10</div>
                                    <div className="text-xs text-muted-foreground text-center mt-1">
                                        {painLevel === 0 && t.intake.details.assessmentPanel.painLevel.noPain}
                                        {painLevel > 0 && painLevel <= 3 && 'Nhẹ'}
                                        {painLevel > 3 && painLevel <= 6 && 'Trung bình'}
                                        {painLevel > 6 && 'Nặng'}
                                    </div>
                                </div>
                            </div>

                            {/* Duration */}
                            <div className="space-y-2">
                                <div className="font-medium text-sm">{t.intake.details.assessmentPanel.duration.label}</div>
                                <div className="p-3 border rounded-lg bg-muted/50">
                                    <div className="text-sm">
                                        {duration || <span className="text-muted-foreground italic">{t.intake.details.assessmentPanel.duration.notSpecified}</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Medical History */}
                            {patientData?.medicalHistory && (
                                <div className="space-y-2">
                                    <div className="font-medium text-sm">{t.intake.details.assessmentPanel.medicalHistory.title}</div>
                                    <div className="p-3 border rounded-lg bg-muted/50">
                                        <div className="text-sm whitespace-pre-wrap">
                                            {patientData.medicalHistory}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Current Medications */}
                            {patientData?.currentMedications && (
                                <div className="space-y-2">
                                    <div className="font-medium text-sm">{t.intake.details.assessmentPanel.currentMedications.title}</div>
                                    <div className="p-3 border rounded-lg bg-muted/50">
                                        <div className="text-sm whitespace-pre-wrap">
                                            {patientData.currentMedications}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Info Note */}
                            <div className="text-xs text-muted-foreground p-3 bg-accent/20 rounded-lg border border-accent">
                                <p className="font-medium mb-1">{t.intake.details.assessmentPanel.infoNote.title}</p>
                                <p>{t.intake.details.assessmentPanel.infoNote.description}</p>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            )}
        </div>
    );
}

