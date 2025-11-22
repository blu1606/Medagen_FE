"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, MessageSquare, ChevronLeft, ChevronRight, Trash2, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { format, isToday, isYesterday, subDays, isAfter } from 'date-fns';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useSessionStore } from '@/lib/sessionStore';
import { useLanguageStore } from '@/store/languageStore';
import { translations } from '@/lib/translations';

interface SessionSidebarProps {
    className?: string;
}

export function SessionSidebar({ className }: SessionSidebarProps) {
    const router = useRouter();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { sessions, deleteSession, currentSessionId } = useSessionStore();
    const { language } = useLanguageStore();
    const t = translations[language];

    const toggleCollapse = () => setIsCollapsed(!isCollapsed);

    const handleNewChat = () => {
        router.push('/intake');
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        deleteSession(id);
    };

    const groupSessions = (sessions: any[]) => {
        const groups = {
            today: [] as any[],
            yesterday: [] as any[],
            last7Days: [] as any[],
            older: [] as any[],
        };

        const sevenDaysAgo = subDays(new Date(), 7);

        sessions.forEach(session => {
            const date = new Date(session.timestamp);
            if (isToday(date)) {
                groups.today.push(session);
            } else if (isYesterday(date)) {
                groups.yesterday.push(session);
            } else if (isAfter(date, sevenDaysAgo)) {
                groups.last7Days.push(session);
            } else {
                groups.older.push(session);
            }
        });

        return groups;
    };

    const groupedSessions = groupSessions(sessions);

    const SessionItem = ({ session }: { session: any }) => (
        <div
            className={cn(
                "group flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors relative",
                isCollapsed ? "justify-center" : "",
                currentSessionId === session.id ? "bg-muted" : ""
            )}
            onClick={() => router.push(`/chat?session=${session.id}`)}
        >
            <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />

            {!isCollapsed && (
                <div className="flex-1 overflow-hidden">
                    <div className="font-medium truncate text-sm">{session.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{session.lastMessage}</div>
                </div>
            )}

            {!isCollapsed && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <MoreHorizontal className="h-3 w-3" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem className="text-destructive" onClick={(e) => handleDelete(session.id, e as any)}>
                            <Trash2 className="mr-2 h-4 w-4" /> {t.sidebar.delete}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
    );

    return (
        <div
            className={cn(
                "flex flex-col border-r bg-muted/10 h-screen transition-all duration-300 ease-in-out",
                isCollapsed ? "w-[60px]" : "w-[280px]",
                className
            )}
        >
            <div className="p-4 border-b flex items-center justify-between">
                {!isCollapsed && <span className="font-semibold">{t.sidebar.history}</span>}
                <Button variant="ghost" size="icon" onClick={toggleCollapse} className="h-8 w-8">
                    {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
            </div>

            <div className="p-2">
                <Button
                    className={cn("w-full justify-start gap-2", isCollapsed ? "px-2 justify-center" : "")}
                    onClick={handleNewChat}
                >
                    <Plus className="h-4 w-4" />
                    {!isCollapsed && t.sidebar.newChat}
                </Button>
            </div>

            <ScrollArea className="flex-1 px-2">
                <div className="space-y-4 py-2">
                    {Object.entries(groupedSessions).map(([key, group]) => {
                        if (group.length === 0) return null;
                        const labelMap: Record<string, string> = {
                            today: t.sidebar.today,
                            yesterday: t.sidebar.yesterday,
                            last7Days: t.sidebar.previous7Days,
                            older: t.sidebar.older
                        };
                        return (
                            <div key={key}>
                                {!isCollapsed && (
                                    <h3 className="px-2 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        {labelMap[key] || key}
                                    </h3>
                                )}
                                <div className="space-y-1">
                                    {group.map((session, index) => (
                                        <SessionItem key={`${session.id}-${index}`} session={session} />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </ScrollArea>
        </div>
    );
}
