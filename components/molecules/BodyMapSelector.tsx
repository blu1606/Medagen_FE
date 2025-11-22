"use client";

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface BodyMapSelectorProps {
    selectedParts: string[];
    onChange: (parts: string[]) => void;
    className?: string;
}

// Detailed anatomical paths (Stylized)
const BODY_PARTS = [
    // Head & Neck
    { id: 'head', name: 'Head', path: 'M95 20 Q100 15 105 20 Q115 30 115 45 Q115 60 100 65 Q85 60 85 45 Q85 30 95 20 Z' },
    { id: 'neck', name: 'Neck', path: 'M90 60 Q100 62 110 60 L115 75 Q100 80 85 75 Z' },

    // Upper Body - Front
    { id: 'traps', name: 'Traps', path: 'M85 75 L65 85 L135 85 L115 75 Q100 80 85 75 Z' },
    { id: 'shoulders', name: 'Shoulders', path: 'M65 85 L45 100 L55 120 L70 95 Z M135 85 L155 100 L145 120 L130 95 Z' },
    { id: 'chest', name: 'Pectorals', path: 'M70 95 L130 95 L125 130 Q100 135 75 130 Z' },
    { id: 'biceps', name: 'Biceps', path: 'M55 120 L45 150 L60 155 L70 130 Z M145 120 L155 150 L140 155 L130 130 Z' },
    { id: 'forearms', name: 'Forearms', path: 'M45 150 L35 190 L50 195 L60 155 Z M155 150 L165 190 L150 195 L140 155 Z' },
    { id: 'abs', name: 'Abdominals', path: 'M80 130 L120 130 L115 180 L85 180 Z' },
    { id: 'obliques', name: 'Obliques', path: 'M75 130 L80 180 L70 175 L65 140 Z M125 130 L120 180 L130 175 L135 140 Z' },

    // Lower Body - Front
    { id: 'quads', name: 'Quadriceps', path: 'M70 180 L130 180 L125 260 L100 250 L75 260 Z' },
    { id: 'calves', name: 'Calves', path: 'M75 260 L100 250 L125 260 L120 330 L100 320 L80 330 Z' },
];

export function BodyMapSelector({ selectedParts, onChange, className }: BodyMapSelectorProps) {
    const [hoveredPart, setHoveredPart] = useState<string | null>(null);

    const togglePart = (id: string) => {
        if (selectedParts.includes(id)) {
            onChange(selectedParts.filter(p => p !== id));
        } else {
            onChange([...selectedParts, id]);
        }
    };

    return (
        <div className={cn("relative w-full max-w-[300px] aspect-[1/2] mx-auto", className)}>
            <svg viewBox="0 0 200 400" className="w-full h-full drop-shadow-2xl filter">
                <defs>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                {/* Silhouette Background */}
                <path
                    d="M95 20 Q100 15 105 20 Q115 30 115 45 Q115 60 100 65 Q85 60 85 45 Q85 30 95 20 Z M90 60 Q100 62 110 60 L115 75 L135 85 L155 100 L165 190 L150 195 L140 155 L130 130 L125 130 L120 180 L130 175 L125 260 L120 330 L100 320 L80 330 L75 260 L70 175 L80 180 L75 130 L70 130 L60 155 L50 195 L35 190 L45 100 L65 85 L85 75 Z"
                    className="fill-muted/20 stroke-none"
                />

                {BODY_PARTS.map((part) => {
                    const isSelected = selectedParts.includes(part.id);
                    const isHovered = hoveredPart === part.id;

                    return (
                        <motion.path
                            key={part.id}
                            d={part.path}
                            onClick={() => togglePart(part.id)}
                            onMouseEnter={() => setHoveredPart(part.id)}
                            onMouseLeave={() => setHoveredPart(null)}
                            initial={false}
                            animate={{
                                fill: isSelected ? 'var(--primary)' : isHovered ? 'var(--primary)' : '#e2e8f0',
                                opacity: isSelected ? 1 : isHovered ? 0.6 : 1,
                                scale: isSelected || isHovered ? 1.02 : 1,
                            }}
                            transition={{ duration: 0.2 }}
                            className={cn(
                                "cursor-pointer stroke-background stroke-[1.5px] transition-colors",
                                isSelected ? "fill-primary" : "fill-muted-foreground/20"
                            )}
                            style={{ transformOrigin: 'center' }}
                        />
                    );
                })}
            </svg>

            {/* Floating Label */}
            <AnimatePresence>
                {hoveredPart && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-4 left-1/2 -translate-x-1/2 bg-popover/90 backdrop-blur px-3 py-1.5 rounded-full shadow-lg border text-xs font-medium pointer-events-none z-10"
                    >
                        {BODY_PARTS.find(p => p.id === hoveredPart)?.name}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="text-center mt-6 text-sm text-muted-foreground">
                {selectedParts.length === 0 ? (
                    <span className="animate-pulse">Tap on the body map to select pain areas</span>
                ) : (
                    <div className="flex flex-wrap justify-center gap-1">
                        {selectedParts.map(id => (
                            <span key={id} className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                                {BODY_PARTS.find(p => p.id === id)?.name}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
