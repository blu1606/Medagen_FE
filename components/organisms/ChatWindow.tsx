'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useChat, type Message } from '@/hooks/useChat';
import { useSessionStore } from '@/lib/sessionStore';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AnimatePresence } from 'framer-motion';
import { generateSmartReplies } from '@/components/molecules/QuickReplies';
import { ContextSummary } from '@/components/molecules/ContextSummary';
import { ChatInput } from '@/components/molecules/ChatInput';
import { EnhancedTriageResult } from '@/components/organisms/EnhancedTriageResult';
import { MessageBubble } from '@/components/molecules/MessageBubble';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ArrowLeft, MoreVertical, Loader2 } from 'lucide-react';
import { ReActFlowContainer } from '@/components/organisms/ReActFlowContainer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ChatWindowProps {
    sessionId?: string;
    initialMessages?: Message[];
}

export function ChatWindow({ sessionId, initialMessages = [] }: ChatWindowProps) {
    const router = useRouter();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { getCurrentSession, setCurrentSession, currentSessionId } = useSessionStore();
    const currentSession = getCurrentSession();

    // Sync sessionId from URL with store
    useEffect(() => {
        if (sessionId && sessionId !== currentSessionId) {
            setCurrentSession(sessionId);
        }
    }, [sessionId, currentSessionId, setCurrentSession]);

    const { messages, isLoading, triageResult, sendMessage, setMessages } = useChat({
        sessionId,
        initialMessages,
    });

    // Smart quick reply suggestions based on context
    const lastAIMessage = messages.filter(m => m.role === 'assistant').pop();
    const quickReplySuggestions = generateSmartReplies({
        lastAIMessage: lastAIMessage?.content,
        symptom: currentSession?.patientData?.chiefComplaint,
        stage: messages.length > 3 ? 'details' : 'initial'
    });

    // Dynamic Thinking Text
    const [thinkingText, setThinkingText] = useState('AI is analyzing...');
    useEffect(() => {
        if (!isLoading) return;
        const steps = [
            'Analyzing symptoms...',
            'Checking medical guidelines...',
            'Formulating response...'
        ];
        let i = 0;
        setThinkingText(steps[0]);
        const interval = setInterval(() => {
            i = (i + 1) % steps.length;
            setThinkingText(steps[i]);
        }, 2000);
        return () => clearInterval(interval);
    }, [isLoading]);

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading, triageResult]);

    // Initial greeting if empty
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([
                {
                    id: 'welcome',
                    role: 'assistant',
                    content: "Hello! I've reviewed your information. Let me ask a few follow-up questions to better understand your condition. Can you tell me more about what you're feeling?",
                    timestamp: new Date().toISOString(),
                    status: 'sent',
                },
            ]);
        }
    }, []); // Run once on mount

    const handleSend = async (message: string) => {
        if (isLoading) return;
        await sendMessage(message);
    };

    const handleNewSession = () => {
        router.push('/intake');
    };

    const handleExport = () => {
        toast.info('Export functionality coming soon');
    };

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h2 className="font-semibold">Chat Consultation</h2>
                        <p className="text-xs text-muted-foreground">
                            Session: {sessionId || 'New'}
                        </p>
                    </div>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreVertical className="h-5 w-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleNewSession}>
                            New Assessment
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleExport}>
                            Export Conversation
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Context Summary at top */}
                {currentSession?.patientData && (
                    <ContextSummary
                        chiefComplaint={currentSession.patientData.chiefComplaint}
                        duration={currentSession.patientData.duration || "Unknown"}
                        severity={currentSession.patientData.painLevel || 0}
                        triageLevel={currentSession.patientData.triageLevel || 'routine'}
                    />
                )}

                {/* Chat Messages */}
                <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                        <MessageBubble key={msg.id} message={msg} />
                    ))}
                </AnimatePresence>

                {/* ReAct Flow Visualization */}
                {currentSession && (
                    <ReActFlowContainer
                        sessionId={currentSession.id}
                        userId="current-user"
                        className="mt-4"
                    />
                )}

                {/* AI Typing Indicator */}
                {isLoading && (
                    <div className="flex gap-2">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src="/bot-avatar.png" />
                            <AvatarFallback>AI</AvatarFallback>
                        </Avatar>
                        <div className="bg-muted rounded-lg p-3">
                            <div className="flex gap-1">
                                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                        <span className="text-xs text-muted-foreground self-center animate-pulse">
                            {thinkingText}
                        </span>
                    </div>
                )}

                {/* Enhanced Triage Result */}
                {triageResult && currentSession?.patientData && (
                    <div className="mt-4">
                        <EnhancedTriageResult
                            result={{
                                severity: (
                                    triageResult.triage_level === 'emergency' ? 'Emergency' :
                                        triageResult.triage_level === 'urgent' ? 'Urgent' :
                                            triageResult.triage_level === 'routine' ? 'Moderate' : 'Mild'
                                ) as any,
                                recommendation: triageResult.recommendation.action + ' - ' + triageResult.recommendation.timeframe,
                                whileYouWait: [
                                    triageResult.recommendation.home_care_advice,
                                    'Monitor for warning signs: ' + triageResult.recommendation.warning_signs,
                                    'Stay hydrated and rest',
                                ]
                            }}
                            patientData={currentSession.patientData}
                            onNewAssessment={handleNewSession}
                        />
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="sticky bottom-0 z-20">
                {!triageResult && (
                    <ChatInput
                        onSend={handleSend}
                        disabled={isLoading}
                        suggestedReplies={isLoading ? [] : quickReplySuggestions}
                    />
                )}
            </div>
        </div>
    );
}
