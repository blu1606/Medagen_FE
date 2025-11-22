import { useEffect, useRef, useState, useCallback } from 'react';
import { MedagenWebSocketClient } from '@/lib/websocket-client';

interface UseWebSocketOptions {
    onConnect?: () => void;
    onDisconnect?: () => void;
    onError?: (error: Error) => void;
    maxReconnectAttempts?: number;
}

export function useWebSocket(
    url: string,
    sessionId: string,
    options: UseWebSocketOptions = {}
) {
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const clientRef = useRef<MedagenWebSocketClient | null>(null);
    const handlersRef = useRef<Map<string, (data: any) => void>>(new Map());

    useEffect(() => {
        if (!url || !sessionId) {
            console.warn('WebSocket URL or sessionId is missing');
            return;
        }

        const client = new MedagenWebSocketClient(
            url,
            sessionId,
            options.maxReconnectAttempts
        );

        clientRef.current = client;

        // Register existing handlers
        handlersRef.current.forEach((handler, messageType) => {
            client.on(messageType, handler);
        });

        // Connect
        client
            .connect()
            .then(() => {
                setIsConnected(true);
                setError(null);
                options.onConnect?.();
            })
            .catch((err) => {
                const error = err instanceof Error ? err : new Error(String(err));
                setError(error);
                setIsConnected(false);
                options.onError?.(error);
            });

        // Cleanup on unmount
        return () => {
            setIsConnected(false);
            client.disconnect();
            options.onDisconnect?.();
        };
    }, [url, sessionId]); // Intentionally omitting options to avoid reconnects

    const on = useCallback((messageType: string, handler: (data: any) => void) => {
        handlersRef.current.set(messageType, handler);
        clientRef.current?.on(messageType, handler);
    }, []);

    const off = useCallback((messageType: string) => {
        handlersRef.current.delete(messageType);
        clientRef.current?.off(messageType);
    }, []);

    const send = useCallback((message: any) => {
        clientRef.current?.send(message);
    }, []);

    return {
        isConnected,
        error,
        on,
        off,
        send,
        client: clientRef.current
    };
}
