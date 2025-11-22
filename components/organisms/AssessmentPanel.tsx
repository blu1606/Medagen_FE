// AssessmentPanel – right‑hand panel for symptom assessment
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { X, ChevronRight, ChevronLeft, ImagePlus, Loader2 } from 'lucide-react';
import { AdvancedBodyMap } from '@/components/organisms/AdvancedBodyMap';
import { useAssessmentStore } from '@/lib/assessmentStore';
import { useImageUpload } from '@/hooks/use-image-upload';
import { assessmentService } from '@/lib/services/assessment.service';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export function AssessmentPanel({ className }: { className?: string }) {
    const [collapsed, setCollapsed] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("model");

    const toggle = () => setCollapsed(!collapsed);

    const {
        selectedParts,
        painLevel,
        duration,
        image,
        history,
        setParts,
        setPain,
        setDuration,
        setImage,
        addSnapshot,
        loadLast,
    } = useAssessmentStore();

    const imageUpload = useImageUpload();

    // Save snapshot when user clicks "Save"
    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Create snapshot and save to local history (persisted via zustand)
            const snapshot = {
                id: crypto.randomUUID(),
                selectedParts,
                painLevel,
                duration,
                image,
                timestamp: new Date().toISOString(),
            };

            // Add to local history (automatically persisted to localStorage)
            addSnapshot(snapshot);

            toast.success('Assessment saved to local storage');
        } catch (error) {
            console.error('Failed to save assessment:', error);
            toast.error('Failed to save assessment');
        } finally {
            setIsSaving(false);
        }
    };

    const handleLoad = async () => {
        setIsLoading(true);
        try {
            const data = await assessmentService.loadAssessment();

            if (data) {
                setParts(data.selectedParts || []);
                setPain(data.painLevel || 0);
                setDuration(data.duration || '');
                setImage(data.image);
                toast.success('Assessment loaded successfully');
            }
        } catch (error) {
            console.error('Failed to load assessment:', error);
            toast.error('Failed to load assessment');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={
            `flex flex-col border-l bg-muted/5 h-screen transition-all duration-300 ${collapsed ? 'w-12' : 'w-[320px]'
            } ${className || ''}`
        }>
            {/* Header */}
            <div className="flex items-center justify-between p-2 border-b">
                {!collapsed && <h3 className="font-semibold">Assessment</h3>}
                <Button variant="ghost" size="icon" onClick={toggle}>
                    {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
            </div>

            {/* Content – hidden when collapsed */}
            {!collapsed && (
                <div className="flex-1 overflow-y-auto p-2 space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <Tabs className="w-full h-full flex flex-col">
                        <TabsList className="grid w-full grid-cols-2 shrink-0">
                            <TabsTrigger value="model" activeValue={activeTab} onValueChange={setActiveTab}>Model</TabsTrigger>
                            <TabsTrigger value="assess" activeValue={activeTab} onValueChange={setActiveTab}>Assess</TabsTrigger>
                        </TabsList>

                        <TabsContent value="model" activeValue={activeTab} className="flex-1 flex flex-col min-h-0 mt-2">
                            {/* Body Map */}
                            <div className="flex-1 min-h-0 flex items-center justify-center overflow-hidden">
                                <AdvancedBodyMap
                                    selectedParts={selectedParts}
                                    onChange={(parts: string[]) => setParts(parts)}
                                    className="w-full h-full max-w-[280px] object-contain"
                                />
                            </div>
                            <div className="mt-2 text-xs text-muted-foreground text-center shrink-0">
                                Select affected areas on the model
                            </div>
                        </TabsContent>

                        <TabsContent value="assess" activeValue={activeTab} className="space-y-6">
                            {/* Pain Slider */}
                            <div className="space-y-2">
                                <Label>Pain Level</Label>
                                <Slider
                                    min={0}
                                    max={10}
                                    step={1}
                                    value={[painLevel]}
                                    onValueChange={(val) => setPain(val[0])}
                                />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>No Pain</span>
                                    <span className="font-medium text-foreground">{painLevel} / 10</span>
                                    <span>Worst Pain</span>
                                </div>
                            </div>

                            {/* Duration */}
                            <div className="space-y-2">
                                <Label>Duration</Label>
                                <Input
                                    placeholder="e.g., 2 days, 1 week"
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                />
                            </div>

                            {/* Image Upload */}
                            <div className="space-y-2">
                                <Label>Upload Image (optional)</Label>
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
                                                <span className="text-sm text-muted-foreground">Add photo</span>
                                            </div>
                                        </Button>
                                    ) : (
                                        <div className="relative flex-1 h-24 rounded-lg border overflow-hidden">
                                            <img src={imageUpload.previewUrl} alt="preview" className="w-full h-full object-cover" />
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

                            {/* Save / Load Buttons */}
                            <div className="flex gap-2 pt-4">
                                <Button variant="outline" className="flex-1" onClick={handleLoad} disabled={isLoading || isSaving}>
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Load
                                </Button>
                                <Button className="flex-1" onClick={handleSave} disabled={isLoading || isSaving}>
                                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Save
                                </Button>
                            </div>

                            {/* History */}
                            {history.length > 0 && (
                                <div className="pt-4 border-t">
                                    <h4 className="font-medium mb-2 text-sm">History</h4>
                                    <ul className="space-y-2 max-h-40 overflow-y-auto">
                                        {history.map((snap) => (
                                            <li key={snap.id} className="border p-2 rounded bg-background/50 hover:bg-accent transition-colors cursor-pointer" onClick={() => {
                                                setParts(snap.selectedParts);
                                                setPain(snap.painLevel);
                                                setDuration(snap.duration);
                                                setImage(snap.image);
                                            }}>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs font-medium">{new Date(snap.timestamp).toLocaleDateString()}</span>
                                                    <span className="text-xs text-muted-foreground">{new Date(snap.timestamp).toLocaleTimeString()}</span>
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-1 truncate">
                                                    Pain: {snap.painLevel} | {snap.selectedParts.length} areas
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            )}
        </div>
    );
}
