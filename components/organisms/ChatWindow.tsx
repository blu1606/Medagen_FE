'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { AnimatePresence } from 'framer-motion';

import { useChat, type Message } from '@/hooks/useChat';
import { useSessionStore } from '@/store/sessionStore';
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

import { GenerateReportButton } from '@/components/atoms/GenerateReportButton';
import { CompleteTriageReportCard } from '@/components/organisms/CompleteTriageReportCard';
import { generateCompleteReport } from '@/lib/triageAdapter';
import { CompleteTriageReport } from '@/lib/api/types';
import { reportService, ReportResponse } from '@/lib/services/report.service';

interface ChatWindowProps {
    sessionId?: string;
    initialMessages?: Message[];
}

export function ChatWindow({ sessionId, initialMessages = [] }: ChatWindowProps) {
    const router = useRouter();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { getCurrentSession, setCurrentSession, currentSessionId, updateSession } = useSessionStore();
    const currentSession = getCurrentSession();
    const { language } = useLanguageStore();
    const t = translations[language];

    // Triage Report State
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportData, setReportData] = useState<CompleteTriageReport | null>(null);
    const [reportMarkdown, setReportMarkdown] = useState<string | null>(null);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);

    // Fetch sessions on mount - DISABLED: Backend doesn't have /api/sessions endpoint
    // This was causing sessions created from intake to be lost due to 404 error
    // useEffect(() => {
    //     fetchSessions();
    // }, [fetchSessions]);

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


    // Show greeting message for new sessions
    useEffect(() => {
        const hasSessionData = currentSession?.patientData;
        const hasNoMessages = messages.length === 0;

        if (sessionId && hasSessionData && hasNoMessages) {
            // Show client-side greeting message (not from server)
            setMessages([
                {
                    id: 'greeting',
                    role: 'assistant',
                    content: t.chat.welcome,
                    timestamp: new Date().toISOString(),
                    status: 'sent',
                },
            ]);
        } else if (!sessionId || !hasSessionData) {
            // Show welcome message for sessions without patient data
            if (messages.length === 0 && !sessionId) {
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
        }
    }, [sessionId, currentSession, messages.length]);

    const handleSend = async (message: string, image?: File) => {
        if (isLoading) return;

        // Simply send the message as-is, no context prepending
        await sendMessage(message, image);
    };

    const handleNewSession = () => {
        router.push('/intake');
    };

    const handleExport = () => {
        toast.info(t.chat.header.exportComingSoon);
    };

    const handleGenerateReport = async () => {
        // Use session ID from triageResult (backend response) if available, otherwise use sessionId from props
        const reportSessionId = triageResult?.session_id || sessionId;

        if (!reportSessionId) {
            toast.error('Session ID is required to generate report');
            return;
        }

        setIsGeneratingReport(true);
        try {
            toast.info('Generating comprehensive report...');

            // Get full report from backend API using the correct session ID
            const apiReport = await reportService.getReport(reportSessionId, 'full');

            // Store markdown for display in the markdown tab
            setReportMarkdown(apiReport.report.report_markdown);

            // Generate complete report with local data + API data
            if (triageResult) {
                const localReport = generateCompleteReport(triageResult, reportSessionId);
                setReportData(localReport);
                toast.success('Report generated successfully!');
            } else {
                // If no triageResult, still show the markdown from API
                toast.success('Report generated from session data');
            }

            setShowReportModal(true);
        } catch (error: any) {
            console.error('Failed to generate report from API:', error);

            // Fallback to local generation if API fails
            if (triageResult && reportSessionId) {
                toast.warning('API unavailable - using local report generation');
                const report = generateCompleteReport(triageResult, reportSessionId);
                setReportData(report);
                setShowReportModal(true);
            } else {
                toast.error('Failed to generate report. Please try again.');
            }
        } finally {
            setIsGeneratingReport(false);
        }
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
        const messageParts: string[] = [];

        if (selectedParts.length > 0) {
            const partsText = selectedParts.length === 1
                ? selectedParts[0]
                : selectedParts.slice(0, -1).join(', ') + ' and ' + selectedParts[selectedParts.length - 1];
            messageParts.push(`I'm experiencing symptoms in my ${partsText}.`);
        }

        if (painLevel > 0) {
            let painDescription = painLevel <= 3 ? 'mild' : painLevel <= 6 ? 'moderate' : 'severe';
            messageParts.push(`The pain level is ${painLevel}/10 (${painDescription}).`);
        }

        if (duration) {
            messageParts.push(`This has been going on for ${duration}.`);
        }

        if (image) {
            messageParts.push(`I've attached a photo of the affected area.`);
        }

        const messageContent = messageParts.join(' ');

        if (messageContent || image) {
            await sendMessage(messageContent, image);
            setShowAssessmentDraft(false);
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

                {/* Triage Report Button */}
                {triageResult && !isLoading && (
                    <div className="flex justify-center mt-4 animate-in fade-in slide-in-from-bottom-4">
                        <GenerateReportButton
                            onClick={handleGenerateReport}
                            isLoading={isGeneratingReport}
                            className="shadow-md hover:shadow-lg transition-all"
                        />
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area with Assessment Popup */}
            <div className="sticky bottom-0 z-20 flex flex-col">
                {/* Assessment Draft Popup - Moved to Assessment Panel */}
                {/* <AnimatePresence>
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
                </AnimatePresence> */}

                <EnhancedChatInput
                    onSend={handleSend}
                    disabled={isLoading}
                    suggestedReplies={isLoading ? [] : quickReplySuggestions}
                    placeholder={t.chat.input.placeholder}
                />
            </div>

            {/* Triage Report Modal */}
            <CompleteTriageReportCard
                report={reportData}
                markdown={reportMarkdown}
                open={showReportModal}
                onOpenChange={setShowReportModal}
            />
        </div>
    );
}
