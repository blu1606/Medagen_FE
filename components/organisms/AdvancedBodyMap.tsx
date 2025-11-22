"use client";

import { useState, useCallback, useEffect } from 'react';
import Body from '@mjcdev/react-body-highlighter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguageStore } from '@/store/languageStore';
import { translations } from '@/lib/translations';

interface AdvancedBodyMapProps {
    selectedParts: string[];
    onChange: (parts: string[]) => void;
    className?: string;
    side?: 'front' | 'back';
    onSideChange?: (side: 'front' | 'back') => void;
}

// Muscle name mapping for better display


export function AdvancedBodyMap({ selectedParts, onChange, className, side: controlledSide, onSideChange }: AdvancedBodyMapProps) {
    const [internalSide, setInternalSide] = useState<'front' | 'back'>('front');
    const [, forceUpdate] = useState({});
    const { language } = useLanguageStore();
    const t = translations[language];

    // Use controlled side if provided, otherwise use internal state
    const side = controlledSide !== undefined ? controlledSide : internalSide;
    const setSide = (newSide: 'front' | 'back') => {
        if (onSideChange) {
            onSideChange(newSide);
        } else {
            setInternalSide(newSide);
        }
    };

    useEffect(() => {
        console.log('AdvancedBodyMap mounted');
        console.log('Body component:', Body);
        console.log('Current side:', side);
        console.log('Selected parts:', selectedParts);
    }, [side, selectedParts]);

    // Convert selectedParts to the format expected by the library
    // Library expects: { slug: string, intensity: number, side?: 'left' | 'right' }
    const data = selectedParts.map(part => ({
        slug: part as any,
        intensity: 2
    }));

    console.log('Rendering with data:', data);

    // Handle body part click according to library API
    const handleBodyPartClick = useCallback((bodyPart: any, clickedSide?: 'left' | 'right') => {
        console.log('Body part clicked:', bodyPart, 'Side:', clickedSide);

        const partId = bodyPart?.slug?.toLowerCase() || '';

        if (!partId) {
            console.warn('No slug found in bodyPart:', bodyPart);
            return;
        }

        if (selectedParts.includes(partId)) {
            console.log('Removing part:', partId);
            onChange(selectedParts.filter(p => p !== partId));
        } else {
            console.log('Adding part:', partId);
            onChange([...selectedParts, partId]);
        }

        // Force a re-render without changing side
        forceUpdate({});
    }, [selectedParts, onChange]);

    const getMuscleDisplayName = (muscle: string | null) => {
        if (!muscle) return '';
        // @ts-ignore
        return t.intake.details.muscleNames[muscle] || muscle.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    return (
        <div className={cn("flex flex-col items-center w-full h-full", className)}>
            <div className="flex gap-2 mb-4 shrink-0">
                <Button
                    variant={side === 'front' ? 'default' : 'outline'}
                    onClick={() => setSide('front')}
                    size="sm"
                    className="h-8"
                >
                    {t.intake.details.bodyMap.front}
                </Button>
                <Button
                    variant={side === 'back' ? 'default' : 'outline'}
                    onClick={() => setSide('back')}
                    size="sm"
                    className="h-8"
                >
                    {t.intake.details.bodyMap.back}
                </Button>
            </div>

            <div className="relative flex-1 w-full min-h-0 flex items-center justify-center">
                <div className="h-full w-full max-w-[240px] aspect-[1/2]">
                    <Body
                        data={data}
                        side={side}
                        gender="male"
                        scale={1.2}
                        onBodyPartClick={handleBodyPartClick}
                        colors={['#e6f2ff', '#0066cc']}
                        border="#dfdfdf"
                    />
                </div>
            </div>

            <div className="mt-2 space-y-2 w-full shrink-0">
                <div className="text-xs text-muted-foreground text-center truncate px-2">
                    {selectedParts.length > 0
                        ? `${t.intake.details.bodyMap.selected}: ${selectedParts.map(p => getMuscleDisplayName(p)).join(', ')}`
                        : t.intake.details.bodyMap.tapToSelect
                    }
                </div>
            </div>

            <style jsx global>{`
                /* Enhanced hover effects for body parts */
                svg[class*="body"] path,
                svg[class*="body"] g {
                    transition: all 0.2s ease-in-out;
                    cursor: pointer;
                }

                svg[class*="body"] path:hover,
                svg[class*="body"] g:hover path {
                    filter: brightness(1.3);
                    stroke: #0066cc !important;
                    stroke-width: 2 !important;
                    opacity: 0.9;
                }

                /* Improve selected state visibility */
                svg[class*="body"] path[fill*="#0066cc"] {
                    stroke: #003d7a;
                    stroke-width: 1.5;
                }
            `}</style>
        </div>
    );
}
