// WebSocket client for Medagen chat
export class MedagenWebSocketClient {
    private ws: WebSocket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts: number;
    private reconnectDelay = 1000;
    private messageHandlers: Map<string, (data: any) => void> = new Map();
    private isManualClose = false;

    constructor(
        private url: string,
        private sessionId: string,
        maxReconnectAttempts = 5
    ) {
        this.maxReconnectAttempts = maxReconnectAttempts;
    }

    async connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            const wsUrl = `${this.url}?session=${this.sessionId}`;

            try {
                this.ws = new WebSocket(wsUrl);
            } catch (error) {
                reject(error);
                return;
            }

            this.ws.onopen = () => {
                console.log('✅ WebSocket connected to:', wsUrl);
                this.reconnectAttempts = 0;
                this.isManualClose = false;
                resolve();
            };

            this.ws.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
                reject(error);
            };

            this.ws.onclose = (event) => {
                console.log('📡 WebSocket closed:', event.code, event.reason);

                if (!this.isManualClose) {
                    this.attemptReconnect();
                }
            };

            this.ws.onmessage = (event) => {
                this.handleMessage(event);
            };
        });
    }

    private handleMessage(event: MessageEvent): void {
        try {
            const data = JSON.parse(event.data);
            const handler = this.messageHandlers.get(data.type);

            if (handler) {
                handler(data);
            } else {
                console.warn('⚠️ No handler for message type:', data.type);
            }
        } catch (error) {
            console.error('❌ Failed to parse WebSocket message:', error);
        }
    }

    on(messageType: string, handler: (data: any) => void): void {
        this.messageHandlers.set(messageType, handler);
    }

    off(messageType: string): void {
        this.messageHandlers.delete(messageType);
    }

    send(message: any): void {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        } else {
            console.error('❌ WebSocket not connected. ReadyState:', this.ws?.readyState);
        }
    }

    private attemptReconnect(): void {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = this.reconnectDelay * this.reconnectAttempts;

            console.log(
                `🔄 Reconnecting in ${delay}ms... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
            );

            setTimeout(() => {
                this.connect().catch(error => {
                    console.error('Reconnection failed:', error);
                });
            }, delay);
        } else {
            console.error('❌ Max reconnect attempts reached. Giving up.');
        }
    }

    disconnect(): void {
        this.isManualClose = true;

        if (this.ws) {
            this.ws.close(1000, 'Client disconnect');
            this.ws = null;
        }

        this.messageHandlers.clear();
    }

    get isConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN;
    }

    get readyState(): number | undefined {
        return this.ws?.readyState;
    }
}
