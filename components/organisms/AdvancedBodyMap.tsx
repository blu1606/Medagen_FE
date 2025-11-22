"use client";

import React, { useState, useCallback } from 'react';
import Model from '@mjcdev/react-body-highlighter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AdvancedBodyMapProps {
    selectedParts: string[];
    onChange: (parts: string[]) => void;
    className?: string;
}

// Muscle name mapping for better display
const MUSCLE_NAMES: Record<string, string> = {
    'trapezius': 'Trapezius',
    'upper-back': 'Upper Back',
    'lower-back': 'Lower Back',
    'chest': 'Chest',
    'biceps': 'Biceps',
    'triceps': 'Triceps',
    'forearm': 'Forearm',
    'back-deltoids': 'Rear Shoulder',
    'front-deltoids': 'Front Shoulder',
    'abs': 'Abdominals',
    'obliques': 'Obliques',
    'adductor': 'Inner Thigh',
    'hamstring': 'Hamstrings',
    'quadriceps': 'Quadriceps',
    'abductors': 'Outer Thigh',
    'calves': 'Calves',
    'gluteal': 'Glutes',
    'head': 'Head',
    'neck': 'Neck',
    'knees': 'Knees',
    'left-soleus': 'Left Calf',
    'right-soleus': 'Right Calf',
};

export function AdvancedBodyMap({ selectedParts, onChange, className }: AdvancedBodyMapProps) {
    const [type, setType] = useState<'anterior' | 'posterior'>('anterior');
    const [hoveredMuscle, setHoveredMuscle] = useState<string | null>(null);

    const handleClick = useCallback(({ muscle }: { muscle: string }) => {
        const muscleId = muscle.toLowerCase();

        if (selectedParts.includes(muscleId)) {
            onChange(selectedParts.filter(p => p !== muscleId));
        } else {
            onChange([...selectedParts, muscleId]);
        }
    }, [selectedParts, onChange]);

    const handleHover = useCallback(({ muscle }: { muscle: string }) => {
        setHoveredMuscle(muscle ? muscle.toLowerCase() : null);
    }, []);

    const data = selectedParts.map(part => ({
        name: part,
        frequency: 2
    }));

    // Cast Model to any to avoid type errors with the library
    const BodyModel = Model as any;

    const getMuscleDisplayName = (muscle: string | null) => {
        if (!muscle) return '';
        return MUSCLE_NAMES[muscle] || muscle.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    return (
        <Card className={cn("p-4 flex flex-col items-center bg-background/50 backdrop-blur-sm", className)}>
            <div className="flex gap-2 mb-4 w-full justify-center">
                <Button
                    variant={type === 'anterior' ? 'default' : 'outline'}
                    onClick={() => setType('anterior')}
                    size="sm"
                >
                    Front
                </Button>
                <Button
                    variant={type === 'posterior' ? 'default' : 'outline'}
                    onClick={() => setType('posterior')}
                    size="sm"
                >
                    Back
                </Button>
            </div>

            <div className="relative w-full max-w-[300px] aspect-[1/2]">
                <BodyModel
                    type={type}
                    data={data}
                    style={{ width: '100%', height: '100%', cursor: 'pointer' }}
                    onClick={handleClick}
                    onMouseOver={handleHover}
                    highlightedColors={['#e6f2ff', '#0066cc']}
                />

                {/* Hover tooltip */}
                {hoveredMuscle && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground px-3 py-2 rounded-md shadow-lg text-sm font-medium whitespace-nowrap z-10">
                        {getMuscleDisplayName(hoveredMuscle)}
                    </div>
                )}
            </div>

            <div className="mt-4 space-y-2 w-full">
                <div className="text-xs text-muted-foreground text-center">
                    {selectedParts.length > 0
                        ? `Selected: ${selectedParts.map(p => getMuscleDisplayName(p)).join(', ')}`
                        : 'Tap on muscles to select/deselect'
                    }
                </div>
            </div>

            <style jsx global>{`
                [data-name] {
                    transition: all 0.2s ease-in-out;
                }
                [data-name]:hover {
                    filter: brightness(1.2);
                    stroke: #0066cc;
                    stroke-width: 2;
                }
            `}</style>
        </Card>
    );
}
