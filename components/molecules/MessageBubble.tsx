import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { useLanguageStore } from '@/store/languageStore';
import { translations } from '@/lib/translations';

interface MessageBubbleProps {
    message: {
        id: string;
        role: 'user' | 'assistant';
        content: string;
        image_url?: string;
        timestamp: string;
        status?: 'sending' | 'sent' | 'error';
    };
    patientName?: string;
}

export function MessageBubble({ message, patientName }: MessageBubbleProps) {
    const isUser = message.role === 'user';
    const { language } = useLanguageStore();
    const t = translations[language];
    const defaultPatientName = patientName || t.chat.defaultUserName;

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3 }}
            className={cn(
                'flex gap-2',
                isUser ? 'justify-end' : 'justify-start'
            )}
        >
            {!isUser && (
                <Avatar className="h-8 w-8">
                    <AvatarImage src="/bot-avatar.png" />
                    <AvatarFallback>AI</AvatarFallback>
                </Avatar>
            )}

            <div className={cn(
                'max-w-[75%] rounded-lg p-3 shadow-sm',
                isUser
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
            )}>
                {isUser ? (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                ) : (
                    <div className="text-sm prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeHighlight]}
                            components={{
                                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                ul: ({ children }) => <ul className="mb-2 ml-4 list-disc">{children}</ul>,
                                ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal">{children}</ol>,
                                li: ({ children }) => <li className="mb-1">{children}</li>,
                                code: ({ inline, children, ...props }: any) =>
                                    inline ? (
                                        <code className="px-1 py-0.5 rounded bg-muted-foreground/20 text-xs font-mono" {...props}>
                                            {children}
                                        </code>
                                    ) : (
                                        <code className="block p-2 rounded bg-muted-foreground/10 text-xs font-mono overflow-x-auto" {...props}>
                                            {children}
                                        </code>
                                    ),
                                pre: ({ children }) => <pre className="mb-2 overflow-x-auto">{children}</pre>,
                                h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                                h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
                                h3: ({ children }) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
                                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                                em: ({ children }) => <em className="italic">{children}</em>,
                                a: ({ children, href }) => (
                                    <a href={href} className="text-primary underline hover:text-primary/80" target="_blank" rel="noopener noreferrer">
                                        {children}
                                    </a>
                                ),
                            }}
                        >
                            {message.content}
                        </ReactMarkdown>
                    </div>
                )}

                {/* Image Display with Lightbox */}
                {message.image_url && (
                    <div className="mt-2">
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="relative group cursor-pointer"
                            onClick={() => {
                                // Open image in new tab for lightbox effect
                                window.open(message.image_url, '_blank');
                            }}
                        >
                            <img
                                src={message.image_url}
                                alt="Uploaded image"
                                className="rounded-md max-w-full max-h-64 object-cover border border-border shadow-sm transition-all group-hover:shadow-md"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-md flex items-center justify-center">
                                <span className="text-white text-xs opacity-0 group-hover:opacity-100 bg-black/50 px-2 py-1 rounded">
                                    Click to view full size
                                </span>
                            </div>
                        </motion.div>
                    </div>
                )}

                <div className="flex items-center justify-between mt-1 gap-2">
                    <time className="text-xs opacity-70">
                        {format(new Date(message.timestamp), 'p')}
                    </time>

                    {isUser && message.status === 'sending' && (
                        <Loader2 className="h-3 w-3 animate-spin" />
                    )}
                    {isUser && message.status === 'sent' && (
                        <Check className="h-3 w-3" />
                    )}
                    {isUser && message.status === 'error' && (
                        <AlertCircle className="h-3 w-3 text-destructive" />
                    )}
                </div>
            </div>

            {isUser && (
                <Avatar className="h-8 w-8">
                    <AvatarFallback>{getInitials(defaultPatientName)}</AvatarFallback>
                </Avatar>
            )}
        </motion.div>
    );
}
