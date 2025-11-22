'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { AnimatePresence } from 'framer-motion';

import { useChat, type Message } from '@/hooks/useChat';
import { useSessionStore } from '@/lib/sessionStore';
import { useAssessmentStore } from '@/lib/assessmentStore';
import { useLanguageStore } from '@/store/languageStore';
import { translations } from '@/lib/translations';

import { generateSmartReplies } from '@/components/molecules/QuickReplies';
import { ContextSummary } from '@/components/molecules/ContextSummary';
import { ChatInput } from '@/components/molecules/ChatInput';
import { EnhancedTriageResult } from '@/components/organisms/EnhancedTriageResult';
import { MessageBubble } from '@/components/molecules/MessageBubble';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ArrowLeft, MoreVertical, Loader2 } from 'lucide-react';
import { ReActFlowContainer } from '@/components/organisms/ReActFlowContainer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { EnhancedChatInput } from '../molecules/EnhancedChatInput';

interface ChatWindowProps {
    sessionId?: string;
    initialMessages?: Message[];
}

export function ChatWindow({ sessionId, initialMessages = [] }: ChatWindowProps) {
    const router = useRouter();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { getCurrentSession, setCurrentSession, currentSessionId } = useSessionStore();
    const currentSession = getCurrentSession();
    const { language } = useLanguageStore();
    const t = translations[language];

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
        stage: messages.length > 3 ? 'details' : 'initial',
        t: t.chat
    });

    // Dynamic Thinking Text
    const [thinkingText, setThinkingText] = useState('AI is analyzing...');
    useEffect(() => {
        if (!isLoading) return;
        const steps = [
            t.chat.thinking.analyzing,
            t.chat.thinking.checking,
            t.chat.thinking.formulating
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
                    content: t.chat.welcome,
                    timestamp: new Date().toISOString(),
                    status: 'sent',
                },
            ]);
        }
    }, []);

    const handleSend = async (message: string, image?: File) => {
        if (isLoading) return;
        await sendMessage(message, image);
    };

    const handleNewSession = () => {
        router.push('/intake');
    };

    const handleExport = () => {
        toast.info(t.chat.header.exportComingSoon);
    };

    // --- Assessment Store Draft Logic ---
    const { selectedParts, painLevel, duration, image, setParts, setPain, setDuration } = useAssessmentStore();
    const [showAssessmentDraft, setShowAssessmentDraft] = useState(false);

    // Sync session patient data to assessment store on load
    useEffect(() => {
        if (currentSession?.patientData) {
            const { bodyParts, painLevel: sessionPain, duration: sessionDuration } = currentSession.patientData;

            // Only sync if assessment store is empty (avoid overwriting user changes)
            if (selectedParts.length === 0 && bodyParts && bodyParts.length > 0) {
                setParts(bodyParts);
            }
            if (painLevel === 0 && sessionPain) {
                setPain(sessionPain);
            }
            if (!duration && sessionDuration) {
                setDuration(sessionDuration);
            }
        }
    }, [currentSession]);

    // Show draft popup when assessment data changes (and is not empty)
    useEffect(() => {
        const hasData = selectedParts.length > 0 || painLevel > 0 || duration.length > 0 || !!image;
        setShowAssessmentDraft(hasData);
    }, [selectedParts, painLevel, duration, image]);

    const handleAttachAssessment = async () => {
        // Construct a message with the assessment data
        const parts = selectedParts.length ? `Parts: ${selectedParts.join(', ')}` : '';
        const pain = `${t.chat.assessment.pain} level: ${painLevel}`;
        const dur = duration ? `${t.chat.assessment.duration}: ${duration}` : '';
        const img = image ? 'Image attached' : '';
        const content = [parts, pain, dur, img].filter(Boolean).join(' | ');

        if (content) {
            await sendMessage(`[Assessment Update] ${content}`);
            // Optional: Clear draft or just keep it? 
            // For now, we keep it in the panel but maybe hide the popup?
            // Let's just send it.
        }
    };

    return (
        <div className="flex flex-col h-full bg-background relative">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h2 className="font-semibold">{t.chat.header.title}</h2>
                    </div>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreVertical className="h-5 w-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleNewSession}>{t.chat.header.newAssessment}</DropdownMenuItem>
                        <DropdownMenuItem onClick={handleExport}>{t.chat.header.export}</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Context Summary - Disabled (shown in AssessmentPanel instead) */}
                {/* {currentSession?.patientData && (
                    <ContextSummary
                        chiefComplaint={currentSession.patientData.chiefComplaint}
                        duration={currentSession.patientData.duration || "Unknown"}
                        severity={currentSession.patientData.painLevel || 0}
                        triageLevel={currentSession.patientData.triageLevel || 'routine'}
                    />
                )} */}

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
                        <span className="text-xs text-muted-foreground self-center animate-pulse">{thinkingText}</span>
                    </div>
                )}

                {/* Enhanced Triage Result - Disabled (should be triggered by user request or model) */}
                {/* {triageResult && currentSession?.patientData && (
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
                )} */}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area with Assessment Popup */}
            <div className="sticky bottom-0 z-20 flex flex-col">
                {/* Assessment Draft Popup */}
                <AnimatePresence>
                    {showAssessmentDraft && (
                        <div className="mx-4 mb-2 p-3 bg-accent/50 backdrop-blur-md border rounded-lg shadow-lg flex items-center justify-between animate-in slide-in-from-bottom-2 fade-in duration-300">
                            <div className="flex flex-col text-sm">
                                <span className="font-medium text-foreground">{t.chat.assessment.pending}</span>
                                <span className="text-xs text-muted-foreground">
                                    {selectedParts.length} {t.chat.assessment.areas} • {t.chat.assessment.pain}: {painLevel} • {duration || t.chat.assessment.noDuration}
                                </span>
                            </div>
                            <Button size="sm" onClick={handleAttachAssessment} className="ml-4">
                                {t.chat.assessment.send}
                            </Button>
                        </div>
                    )}
                </AnimatePresence>

                <EnhancedChatInput
                    onSend={handleSend}
                    disabled={isLoading}
                    suggestedReplies={isLoading ? [] : quickReplySuggestions}
                    placeholder={t.chat.input.placeholder}
                />
            </div>
        </div>
    );
}
