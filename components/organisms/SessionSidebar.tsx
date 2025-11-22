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

// Mock data type - replace with real type from store
type Session = {
    id: string;
    title: string;
    date: Date;
    preview: string;
};

// Mock data generator
const generateMockSessions = (): Session[] => {
    return [
        { id: '1', title: 'Severe Headache', date: new Date(), preview: 'Pain level 8/10 behind eyes...' },
        { id: '2', title: 'Skin Rash', date: subDays(new Date(), 1), preview: 'Red itchy patch on arm...' },
        { id: '3', title: 'Fever & Chills', date: subDays(new Date(), 3), preview: 'Temperature 39°C...' },
        { id: '4', title: 'Back Pain', date: subDays(new Date(), 10), preview: 'Lower back pain after lifting...' },
    ];
};

interface SessionSidebarProps {
    className?: string;
}

export function SessionSidebar({ className }: SessionSidebarProps) {
    const router = useRouter();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [sessions, setSessions] = useState<Session[]>(generateMockSessions());

    const toggleCollapse = () => setIsCollapsed(!isCollapsed);

    const handleNewChat = () => {
        router.push('/intake');
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSessions(prev => prev.filter(s => s.id !== id));
    };

    const groupSessions = (sessions: Session[]) => {
        const groups = {
            today: [] as Session[],
            yesterday: [] as Session[],
            last7Days: [] as Session[],
            older: [] as Session[],
        };

        const sevenDaysAgo = subDays(new Date(), 7);

        sessions.forEach(session => {
            if (isToday(session.date)) {
                groups.today.push(session);
            } else if (isYesterday(session.date)) {
                groups.yesterday.push(session);
            } else if (isAfter(session.date, sevenDaysAgo)) {
                groups.last7Days.push(session);
            } else {
                groups.older.push(session);
            }
        });

        return groups;
    };

    const groupedSessions = groupSessions(sessions);

    const SessionItem = ({ session }: { session: Session }) => (
        <div
            className={cn(
                "group flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors relative",
                isCollapsed ? "justify-center" : ""
            )}
            onClick={() => router.push(`/chat?id=${session.id}`)}
        >
            <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />

            {!isCollapsed && (
                <div className="flex-1 overflow-hidden">
                    <div className="font-medium truncate text-sm">{session.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{session.preview}</div>
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
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
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
                {!isCollapsed && <span className="font-semibold">History</span>}
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
                    {!isCollapsed && "New Chat"}
                </Button>
            </div>

            <ScrollArea className="flex-1 px-2">
                <div className="space-y-4 py-2">
                    {Object.entries(groupedSessions).map(([key, group]) => {
                        if (group.length === 0) return null;
                        return (
                            <div key={key}>
                                {!isCollapsed && (
                                    <h3 className="px-2 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        {key === 'last7Days' ? 'Previous 7 Days' : key}
                                    </h3>
                                )}
                                <div className="space-y-1">
                                    {group.map(session => (
                                        <SessionItem key={session.id} session={session} />
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
