import { type Variants } from 'framer-motion';

// Animation variants for ReAct flow components
export const animationVariants = {
    thought: {
        hidden: { opacity: 0, x: -20, scale: 0.95 },
        visible: {
            opacity: 1,
            x: 0,
            scale: 1,
            transition: {
                duration: 0.3,
                ease: 'easeOut'
            }
        },
        exit: {
            opacity: 0,
            x: 20,
            transition: { duration: 0.2 }
        }
    } as Variants,

    tool: {
        hidden: { opacity: 0, scale: 0.8, y: 20 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                duration: 0.4,
                ease: 'backOut',
                delay: 0.1
            }
        }
    } as Variants,

    observation: {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.3,
                staggerChildren: 0.1
            }
        }
    } as Variants,

    redFlag: {
        hidden: { opacity: 0, scale: 0.9 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.5,
                type: 'spring',
                bounce: 0.4
            }
        }
    } as Variants
};

// Helper to format duration in milliseconds to human-readable
export function formatDuration(ms: number): string {
    if (ms < 1000) {
        return `${ms}ms`;
    }
    return `${(ms / 1000).toFixed(2)}s`;
}

// Helper to get confidence color class
export function getConfidenceColor(confidence: number): string {
    if (confidence >= 0.8) return 'text-green-600 dark:text-green-400';
    if (confidence >= 0.5) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
}

// Helper to get confidence background color
export function getConfidenceBgColor(confidence: number): string {
    if (confidence >= 0.8) return 'bg-green-500';
    if (confidence >= 0.5) return 'bg-yellow-500';
    return 'bg-red-500';
}

// Helper to get confidence interpretation
export function getConfidenceInterpretation(confidence: number): string {
    if (confidence >= 0.8) return 'High confidence - Model is very certain';
    if (confidence >= 0.5) return 'Medium confidence - Consider additional factors';
    return 'Low confidence - Seek professional opinion';
}

// Validate WebSocket message format
export function isValidReActMessage(message: any): boolean {
    const validTypes = [
        'thought',
        'action_start',
        'action_complete',
        'action_error',
        'observation',
        'final_answer'
    ];

    return (
        typeof message === 'object' &&
        message !== null &&
        'type' in message &&
        validTypes.includes(message.type) &&
        'timestamp' in message &&
        typeof message.timestamp === 'string'
    );
}

// Simple hash function for A/B testing
export function simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
}

// Check if feature is enabled
export function isFeatureEnabled(flag: string): boolean {
    // Read from environment variables
    const envKey = `NEXT_PUBLIC_${flag.toUpperCase()}`;
    return process.env[envKey] === 'true';
}

// Get user initials from name
export function getInitials(name: string): string {
    return name
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

// Format timestamp to locale time
export function formatTimestamp(timestamp: string, locale = 'vi-VN'): string {
    try {
        const date = new Date(timestamp);
        return date.toLocaleTimeString(locale, {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    } catch {
        return '';
    }
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '...';
}
