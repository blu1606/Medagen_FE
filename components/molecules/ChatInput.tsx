"use client";

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Image as ImageIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ChatInputProps {
    onSend: (message: string, image?: File) => void;
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
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSend = () => {
        if (message.trim() || selectedImage) {
            onSend(message, selectedImage || undefined);
            setMessage('');
            setSelectedImage(null);
            setImagePreview(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }

            // Validate file size (max 10MB)
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                alert('Image size must be less than 10MB');
                return;
            }

            setSelectedImage(file);
            const preview = URL.createObjectURL(file);
            setImagePreview(preview);
        }
    };

    const handleRemoveImage = () => {
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
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

            {/* Image Preview */}
            <AnimatePresence>
                {selectedImage && imagePreview && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-2 relative inline-block"
                    >
                        <div className="relative">
                            <img
                                src={imagePreview}
                                alt="Selected"
                                className="h-20 rounded-md object-cover"
                            />
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute -top-2 -right-2 h-6 w-6"
                                onClick={handleRemoveImage}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{selectedImage.name}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex items-center gap-2">
                {/* Image Upload Button */}
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={disabled}
                    onClick={() => fileInputRef.current?.click()}
                    title="Upload image"
                >
                    <ImageIcon className="h-4 w-4" />
                </Button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageSelect}
                />

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
                    disabled={disabled || (!message.trim() && !selectedImage)}
                    size="icon"
                >
                    <Send className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
