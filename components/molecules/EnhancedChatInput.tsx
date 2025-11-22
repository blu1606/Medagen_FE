"use client";

import React, { useState, useRef } from 'react';
import { Button } from '@/components/button';
import { Textarea } from '@/components/textarea';
import { Card, CardContent } from '@/components/card';
import { Toggle } from '@/components/ui/toggle';
import { Send, Paperclip, X, ImageIcon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface EnhancedChatInputProps {
    onSend: (message: string, image?: File) => void;
    disabled?: boolean;
    placeholder?: string;
    suggestedReplies?: string[];
    className?: string;
}

export function EnhancedChatInput({
    onSend,
    disabled = false,
    placeholder = "Type your message...",
    suggestedReplies = [],
    className
}: EnhancedChatInputProps) {
    const [message, setMessage] = useState('');
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSend = () => {
        if ((message.trim() || selectedImage) && !disabled) {
            onSend(message, selectedImage || undefined);
            setMessage('');
            handleRemoveImage();
            // Auto-resize textarea
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }
    };

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            alert('Image size must be less than 10MB');
            return;
        }

        setIsUploadingImage(true);
        try {
            setSelectedImage(file);
            const preview = URL.createObjectURL(file);
            setImagePreview(preview);
        } finally {
            setIsUploadingImage(false);
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

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleReplyClick = (reply: string) => {
        onSend(reply);
    };

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value);
        // Auto-resize textarea
        e.target.style.height = 'auto';
        e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
    };

    return (
        <div className={cn("flex items-center flex-col gap-2 w-full", className)}>
            {/* Quick Replies */}
            <AnimatePresence>
                {suggestedReplies.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="flex gap-2 overflow-x-auto pb-2 w-full scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border"
                    >
                        {suggestedReplies.map((reply, index) => (
                            <motion.button
                                key={index}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleReplyClick(reply)}
                                className="whitespace-nowrap px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors border border-primary/20 flex-shrink-0"
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
                        className="w-full"
                    >
                        <Card className="w-full">
                            <CardContent className="p-3">
                                <div className="relative inline-block">
                                    <img
                                        src={imagePreview}
                                        alt="Selected"
                                        className="h-24 rounded-md object-cover border border-border"
                                    />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-lg"
                                        onClick={handleRemoveImage}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2 truncate max-w-[200px]">
                                    {selectedImage.name}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Input Card */}
            <Card className="w-full rounded-card shadow-sm border-border">
                <CardContent className="p-0">
                    <div className="w-full">
                        <Textarea
                            ref={textareaRef}
                            placeholder={placeholder}
                            value={message}
                            onChange={handleTextareaChange}
                            onKeyDown={handleKeyDown}
                            disabled={disabled}
                            size="fixed"
                            className="flex-grow border-none ring-0 outline-none shadow-none focus:border-none focus:ring-0 focus:outline-none focus:shadow-none hover:border-none hover:ring-0 hover:outline-none hover:shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 resize-none bg-transparent min-h-[60px] max-h-[200px]"
                            style={{
                                overflow: message.length > 100 ? 'auto' : 'hidden',
                                height: 'auto'
                            }}
                        />
                    </div>

                    <div className="w-full flex items-center justify-between gap-2 px-3 pb-3">
                        <div className="flex items-center justify-center gap-2">
                            {/* Image Upload Button */}
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="rounded-md"
                                disabled={disabled || isUploadingImage}
                                onClick={() => fileInputRef.current?.click()}
                                title="Upload image"
                            >
                                {isUploadingImage ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : selectedImage ? (
                                    <ImageIcon className="size-4 text-primary" />
                                ) : (
                                    <Paperclip className="size-4" />
                                )}
                            </Button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageSelect}
                            />
                        </div>

                        <div className="flex items-center justify-center gap-1">
                            <Button
                                onClick={handleSend}
                                disabled={disabled || (!message.trim() && !selectedImage)}
                                size="icon"
                                className="rounded-md"
                            >
                                <Send className="size-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
