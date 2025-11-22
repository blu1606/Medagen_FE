"use client";

import * as React from "react";

interface SliderProps {
    /** Minimum value (default 0) */
    min?: number;
    /** Maximum value (default 10) */
    max?: number;
    /** Step size (default 1) */
    step?: number;
    /** Current value as an array (single‑value slider) */
    value: number[];
    /** Callback when the value changes */
    onValueChange: (value: number[]) => void;
}

/**
 * Simple wrapper around an HTML range input.
 * It mimics the API of the Shadcn Slider so the existing
 * AssessmentPanel code works without any further changes.
 */
export function Slider({
    min = 0,
    max = 10,
    step = 1,
    value,
    onValueChange,
}: SliderProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = Number(e.target.value);
        onValueChange([newVal]);
    };

    return (
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value[0]}
            onChange={handleChange}
            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
        />
    );
}
