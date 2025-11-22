"use client";

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ChatInputProps {
    onSend: (message: string) => void;
    disabled?: boolean;
    placeholder?: string;
    suggestedReplies?: string[];
    className?: string;
}

export function ChatInput({
    onSend,
    disabled = false,
    placeholder = "Type your message...",
    suggestedReplies = [],
    className
}: ChatInputProps) {
    const [message, setMessage] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSend = () => {
        if (message.trim()) {
            onSend(message);
            setMessage('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleReplyClick = (reply: string) => {
        onSend(reply);
    };

    return (
        <div className={cn("p-4 bg-background border-t", className)}>
            {/* Quick Replies */}
            <AnimatePresence>
                {suggestedReplies.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="flex gap-2 overflow-x-auto pb-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                    >
                        {suggestedReplies.map((reply, index) => (
                            <motion.button
                                key={index}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleReplyClick(reply)}
                                className="whitespace-nowrap px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors border border-primary/20"
                                disabled={disabled}
                            >
                                {reply}
                            </motion.button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex gap-2">
                <Input
                    ref={inputRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled}
                    className="flex-1"
                    autoComplete="off"
                />
                <Button
                    onClick={handleSend}
                    disabled={disabled || !message.trim()}
                    size="icon"
                >
                    <Send className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
