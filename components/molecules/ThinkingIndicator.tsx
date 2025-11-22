"use client";

import React from 'react';
import { motion } from 'framer-motion';

export function ThinkingIndicator() {
    return (
        <div className="flex gap-1 items-center p-2">
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    className="w-2 h-2 bg-primary/40 rounded-full"
                    animate={{
                        y: ["0%", "-50%", "0%"],
                        opacity: [0.4, 1, 0.4]
                    }}
                    transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        delay: i * 0.2,
                        ease: "easeInOut"
                    }}
                />
            ))}
            <span className="ml-2 text-xs text-muted-foreground animate-pulse">AI is analyzing...</span>
        </div>
    );
}
