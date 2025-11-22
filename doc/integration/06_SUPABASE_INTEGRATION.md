# Supabase Integration Guide

## 📋 Mục lục

- [Tổng quan](#tổng-quan)
- [Schema Supabase](#schema-supabase)
- [Dữ liệu cần sync và display](#dữ-liệu-cần-sync-và-display)
- [Thiết lập Supabase Client](#thiết-lập-supabase-client)
- [Real-time Subscriptions](#real-time-subscriptions)
- [Data Synchronization Patterns](#data-synchronization-patterns)
- [Implementation Examples](#implementation-examples)
- [Best Practices](#best-practices)
- [Security & RLS](#security--rls)

## Tổng quan

Supabase là backend-as-a-service chính của Medagen, cung cấp:
- **PostgreSQL Database** - Lưu trữ sessions, conversations, medical data
- **Real-time Subscriptions** - Cập nhật real-time cho conversations
- **Row Level Security (RLS)** - Bảo mật dữ liệu theo user
- **Storage** - Lưu trữ hình ảnh medical (nếu cần)

Frontend cần tích hợp Supabase để:
1. Đồng bộ conversation sessions và history
2. Hiển thị real-time updates khi có message mới
3. Quản lý user sessions và authentication
4. Cache và sync dữ liệu medical knowledge (nếu cần)

## Schema Supabase

### Bảng chính liên quan đến Frontend

#### 1. `conversation_sessions`
Lưu trữ các session hội thoại của user.

```sql
- id: uuid (PK)
- user_id: text (NOT NULL)
- created_at: timestamptz
- updated_at: timestamptz
```

**Mục đích**: Quản lý danh sách sessions, hiển thị trong SessionSidebar.

#### 2. `conversation_history`
Lưu trữ từng message trong conversation.

```sql
- id: uuid (PK)
- session_id: uuid (FK → conversation_sessions.id)
- user_id: text (NOT NULL)
- role: text ('user' | 'assistant')
- content: text (NOT NULL)
- image_url: text (nullable)
- triage_result: jsonb (nullable)
- created_at: timestamptz
```

**Mục đích**: Hiển thị chat messages trong ChatWindow, sync real-time.

#### 3. `sessions` (Triage Sessions)
Lưu trữ thông tin triage ban đầu từ intake form.

```sql
- id: uuid (PK)
- user_id: text (NOT NULL)
- input_text: text (NOT NULL)
- image_url: text (nullable)
- triage_level: text (NOT NULL)
- triage_result: jsonb (NOT NULL)
- location: jsonb (nullable)
- created_at: timestamptz
```

**Mục đích**: Hiển thị triage results, có thể link với conversation_sessions.

#### 4. `diseases`
Danh sách bệnh lý (reference data).

```sql
- id: uuid (PK)
- specialty_id: uuid (FK → specialties.id)
- name: text
- synonyms: text[]
- icd10_code: text
- description: text
- created_at: timestamptz
```

**Mục đích**: Có thể dùng để search/autocomplete (optional).

#### 5. `specialties`
Chuyên khoa y tế.

```sql
- id: uuid (PK)
- name: text (UNIQUE)
- name_en: text
- description: text
- created_at: timestamptz
```

**Mục đích**: Filter/search theo chuyên khoa (optional).

#### 6. `medical_knowledge_chunks` & `guideline_chunks`
Dữ liệu RAG, thường không cần sync trực tiếp lên frontend (backend xử lý).

## Dữ liệu cần sync và display

### ✅ Priority 1: Core Functionality

#### 1. Conversation Sessions List
**Table**: `conversation_sessions`
**Component**: `SessionSidebar`
**Sync Strategy**: 
- Fetch on mount
- Real-time subscription cho new sessions
- Cache trong Zustand store

**Data to display**:
```typescript
interface ConversationSession {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  // Computed fields:
  title: string; // From first message or triage
  preview: string; // Last message preview
  message_count: number;
}
```

#### 2. Conversation History (Messages)
**Table**: `conversation_history`
**Component**: `ChatWindow`
**Sync Strategy**:
- Fetch on session load
- Real-time subscription cho new messages
- Optimistic updates khi send message

**Data to display**:
```typescript
interface ConversationMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  image_url?: string;
  triage_result?: TriageResult;
  created_at: string;
}
```

#### 3. Triage Results
**Table**: `sessions` (triage sessions)
**Component**: `EnhancedTriageResult`, `TriageResultCard`
**Sync Strategy**:
- Fetch khi load session
- Có thể link với conversation_sessions qua user_id + timestamp

**Data to display**:
```typescript
interface TriageSession {
  id: string;
  user_id: string;
  input_text: string;
  image_url?: string;
  triage_level: 'emergency' | 'urgent' | 'routine' | 'self_care';
  triage_result: {
    severity: string;
    recommendation: string;
    red_flags: string[];
    suspected_conditions: Array<{name: string; confidence: string}>;
    // ... more fields
  };
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  created_at: string;
}
```

### ⚠️ Priority 2: Optional Enhancements

#### 4. Diseases & Specialties (Reference Data)
**Tables**: `diseases`, `specialties`
**Use Case**: 
- Autocomplete trong intake form
- Filter/search trong medical knowledge
- Display disease info trong chat

**Sync Strategy**: 
- Fetch once on app load, cache
- Hoặc fetch on-demand khi cần

#### 5. User Profile & Preferences
**Table**: `profiles` (nếu có, hoặc dùng Supabase Auth)
**Use Case**: User settings, preferences

## Thiết lập Supabase Client

### 1. Cấu hình Environment Variables

File: `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Supabase Client Setup

File: `frontend/lib/supabase.ts` (đã có sẵn)

```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';

// Client-side Supabase client (for components)
export const createSupabaseClient = () => {
    return createClientComponentClient();
};

// Standalone client (for utility functions)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 3. TypeScript Types

Tạo file: `frontend/lib/supabase-types.ts`

```typescript
// Generate types từ Supabase CLI:
// npx supabase gen types typescript --project-id your-project-id > lib/supabase-types.ts

// Hoặc định nghĩa manual:
export interface Database {
  public: {
    Tables: {
      conversation_sessions: {
        Row: {
          id: string;
          user_id: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      conversation_history: {
        Row: {
          id: string;
          session_id: string | null;
          user_id: string;
          role: 'user' | 'assistant';
          content: string;
          image_url: string | null;
          triage_result: any | null;
          created_at: string | null;
        };
        // ... Insert, Update types
      };
      // ... other tables
    };
  };
}
```

## Real-time Subscriptions

### 1. Subscribe to New Messages

```typescript
// hooks/useConversationSubscription.ts
import { useEffect } from 'react';
import { createSupabaseClient } from '@/lib/supabase';
import { useConversationStore } from '@/store/conversationStore';

export function useConversationSubscription(sessionId: string | undefined) {
  const { addMessage } = useConversationStore();

  useEffect(() => {
    if (!sessionId) return;

    const supabase = createSupabaseClient();
    
    const channel = supabase
      .channel(`conversation:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversation_history',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          const newMessage = payload.new as ConversationMessage;
          addMessage(sessionId, newMessage);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, addMessage]);
}
```

### 2. Subscribe to New Sessions

```typescript
// hooks/useSessionsSubscription.ts
import { useEffect } from 'react';
import { createSupabaseClient } from '@/lib/supabase';
import { useSessionStore } from '@/store/sessionStore';

export function useSessionsSubscription(userId: string | undefined) {
  const { addSession } = useSessionStore();

  useEffect(() => {
    if (!userId) return;

    const supabase = createSupabaseClient();
    
    const channel = supabase
      .channel(`sessions:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversation_sessions',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newSession = payload.new as ConversationSession;
          addSession(newSession);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, addSession]);
}
```

## Data Synchronization Patterns

### Pattern 1: Fetch on Mount + Real-time Updates

**Use Case**: Conversation messages, session list

```typescript
// components/organisms/ChatWindow.tsx
'use client';

import { useEffect } from 'react';
import { createSupabaseClient } from '@/lib/supabase';
import { useConversationStore } from '@/store/conversationStore';
import { useConversationSubscription } from '@/hooks/useConversationSubscription';

export function ChatWindow({ sessionId }: { sessionId: string }) {
  const { messages, loadMessages } = useConversationStore();
  
  // Fetch initial messages
  useEffect(() => {
    if (sessionId) {
      loadMessages(sessionId);
    }
  }, [sessionId, loadMessages]);

  // Subscribe to real-time updates
  useConversationSubscription(sessionId);

  // ... render messages
}
```

### Pattern 2: Optimistic Updates + Sync

**Use Case**: Sending messages

```typescript
// store/conversationStore.ts
async sendMessage(sessionId: string, content: string) {
  // 1. Optimistic update
  const tempMessage: Message = {
    id: `temp-${Date.now()}`,
    role: 'user',
    content,
    created_at: new Date().toISOString(),
    status: 'sending',
  };
  
  set((state) => ({
    messagesBySession: {
      ...state.messagesBySession,
      [sessionId]: [...(state.messagesBySession[sessionId] || []), tempMessage],
    },
  }));

  try {
    // 2. Send to backend API (not Supabase directly)
    const response = await api.post(`/api/conversations/${sessionId}/send`, {
      content,
    });

    // 3. Update with real message from backend
    // Backend sẽ insert vào Supabase, real-time subscription sẽ handle update
    // Hoặc update manually:
    set((state) => ({
      messagesBySession: {
        ...state.messagesBySession,
        [sessionId]: state.messagesBySession[sessionId]?.map(m =>
          m.id === tempMessage.id
            ? { ...m, id: response.message_id, status: 'sent' }
            : m
        ) || [],
      },
    }));
  } catch (error) {
    // 4. Rollback on error
    set((state) => ({
      messagesBySession: {
        ...state.messagesBySession,
        [sessionId]: state.messagesBySession[sessionId]?.filter(
          m => m.id !== tempMessage.id
        ) || [],
      },
      error: error.message,
    }));
  }
}
```

### Pattern 3: Pagination + Infinite Scroll

**Use Case**: Loading message history

```typescript
// store/conversationStore.ts
async loadMessages(
  sessionId: string,
  options?: { limit?: number; before?: string }
) {
  const limit = options?.limit || 50;
  const supabase = createSupabaseClient();

  let query = supabase
    .from('conversation_history')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (options?.before) {
    query = query.lt('created_at', options.before);
  }

  const { data, error } = await query;

  if (error) throw error;

  // Append to existing messages (for pagination)
  set((state) => ({
    messagesBySession: {
      ...state.messagesBySession,
      [sessionId]: [
        ...(data || []).reverse(), // Reverse để có chronological order
        ...(state.messagesBySession[sessionId] || []),
      ],
    },
  }));
}
```

## Implementation Examples

### Example 1: SessionSidebar với Supabase

```typescript
// components/organisms/SessionSidebar.tsx
'use client';

import { useEffect, useState } from 'react';
import { createSupabaseClient } from '@/lib/supabase';
import { useSessionsSubscription } from '@/hooks/useSessionsSubscription';

interface Session {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  title: string;
  preview: string;
  message_count: number;
}

export function SessionSidebar({ userId }: { userId: string }) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial sessions
  useEffect(() => {
    async function fetchSessions() {
      const supabase = createSupabaseClient();
      
      const { data, error } = await supabase
        .from('conversation_sessions')
        .select('id, user_id, created_at, updated_at')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching sessions:', error);
        return;
      }

      // Enrich với message count và preview
      const enrichedSessions = await Promise.all(
        (data || []).map(async (session) => {
          // Get last message for preview
          const { data: lastMessage } = await supabase
            .from('conversation_history')
            .select('content')
            .eq('session_id', session.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Get message count
          const { count } = await supabase
            .from('conversation_history')
            .select('*', { count: 'exact', head: true })
            .eq('session_id', session.id);

          return {
            ...session,
            title: lastMessage?.content?.substring(0, 30) || 'New Conversation',
            preview: lastMessage?.content?.substring(0, 50) || '',
            message_count: count || 0,
          };
        })
      );

      setSessions(enrichedSessions);
      setIsLoading(false);
    }

    fetchSessions();
  }, [userId]);

  // Subscribe to new sessions
  useSessionsSubscription(userId);

  // ... render sessions
}
```

### Example 2: ChatWindow với Real-time Messages

```typescript
// components/organisms/ChatWindow.tsx
'use client';

import { useEffect, useRef } from 'react';
import { createSupabaseClient } from '@/lib/supabase';
import { useConversationSubscription } from '@/hooks/useConversationSubscription';
import { useConversationStore } from '@/store/conversationStore';

export function ChatWindow({ sessionId }: { sessionId: string }) {
  const { messages, loadMessages, addMessage } = useConversationStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load initial messages
  useEffect(() => {
    if (sessionId) {
      loadMessages(sessionId);
    }
  }, [sessionId, loadMessages]);

  // Subscribe to real-time updates
  useConversationSubscription(sessionId);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {messages[sessionId]?.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput onSend={handleSend} />
    </div>
  );
}
```

### Example 3: Triage Result Display

```typescript
// components/organisms/EnhancedTriageResult.tsx
'use client';

import { useEffect, useState } from 'react';
import { createSupabaseClient } from '@/lib/supabase';

export function EnhancedTriageResult({ 
  sessionId,
  userId 
}: { 
  sessionId: string;
  userId: string;
}) {
  const [triageResult, setTriageResult] = useState<any>(null);

  useEffect(() => {
    async function fetchTriageResult() {
      const supabase = createSupabaseClient();

      // Find triage session linked to this conversation
      // (có thể match qua user_id + timestamp gần nhất)
      const { data, error } = await supabase
        .from('sessions')
        .select('triage_result, triage_level, input_text')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching triage result:', error);
        return;
      }

      setTriageResult(data);
    }

    fetchTriageResult();
  }, [sessionId, userId]);

  if (!triageResult) return null;

  return (
    <div className="triage-result-card">
      {/* Render triage result */}
    </div>
  );
}
```

## Best Practices

### 1. Error Handling

```typescript
// lib/supabase-utils.ts
export async function safeSupabaseQuery<T>(
  query: Promise<{ data: T | null; error: any }>
) {
  try {
    const { data, error } = await query;
    
    if (error) {
      console.error('Supabase error:', error);
      throw new Error(error.message || 'Database error');
    }
    
    return data;
  } catch (error) {
    console.error('Query failed:', error);
    throw error;
  }
}
```

### 2. Caching Strategy

```typescript
// store/sessionStore.ts
interface SessionStore {
  sessions: ConversationSession[];
  sessionsCache: Map<string, { data: ConversationSession[]; timestamp: number }>;
  cacheTTL: number; // 5 minutes

  fetchSessions: async () => {
    const cacheKey = `sessions:${userId}`;
    const cached = this.sessionsCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data;
    }

    const data = await fetchFromSupabase();
    this.sessionsCache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  };
}
```

### 3. Debouncing Real-time Updates

```typescript
// hooks/useDebouncedSubscription.ts
import { useEffect, useRef } from 'react';

export function useDebouncedSubscription(
  callback: () => void,
  delay: number = 500
) {
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(callback, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [callback, delay]);
}
```

### 4. Connection Status

```typescript
// hooks/useSupabaseConnection.ts
import { useEffect, useState } from 'react';
import { createSupabaseClient } from '@/lib/supabase';

export function useSupabaseConnection() {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const supabase = createSupabaseClient();
    
    const channel = supabase.channel('connection-status')
      .on('system', {}, (payload) => {
        if (payload.status === 'SUBSCRIBED') {
          setIsConnected(true);
        } else if (payload.status === 'CHANNEL_ERROR') {
          setIsConnected(false);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return isConnected;
}
```

## Security & RLS

### Row Level Security Policies

Supabase sử dụng RLS để đảm bảo user chỉ truy cập được dữ liệu của mình.

**Policy Example** (đã được setup ở backend):

```sql
-- conversation_sessions: User chỉ thấy sessions của mình
CREATE POLICY "Users can view own sessions"
ON conversation_sessions
FOR SELECT
USING (auth.uid()::text = user_id);

-- conversation_history: User chỉ thấy messages của sessions mình sở hữu
CREATE POLICY "Users can view own messages"
ON conversation_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM conversation_sessions
    WHERE conversation_sessions.id = conversation_history.session_id
    AND conversation_sessions.user_id = auth.uid()::text
  )
);
```

### Frontend Best Practices

1. **Không hardcode user_id**: Luôn lấy từ Supabase Auth
2. **Validate permissions**: Check RLS policies trước khi query
3. **Handle unauthorized errors**: Gracefully handle 403 errors

```typescript
// lib/supabase-auth.ts
import { createSupabaseClient } from './supabase';

export async function getCurrentUserId(): Promise<string | null> {
  const supabase = createSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

// Usage
const userId = await getCurrentUserId();
if (!userId) {
  // Redirect to login
  return;
}
```

## Migration Plan

### Phase 1: Basic Integration
- [ ] Setup Supabase client trong frontend
- [ ] Fetch conversation_sessions list
- [ ] Fetch conversation_history cho một session
- [ ] Display trong SessionSidebar và ChatWindow

### Phase 2: Real-time Updates
- [ ] Subscribe to new messages
- [ ] Subscribe to new sessions
- [ ] Handle connection status

### Phase 3: Optimistic Updates
- [ ] Optimistic message sending
- [ ] Error handling và rollback
- [ ] Loading states

### Phase 4: Advanced Features
- [ ] Pagination cho message history
- [ ] Search/filter sessions
- [ ] Cache management
- [ ] Offline support (optional)

## Testing

### Unit Tests

```typescript
// __tests__/supabase-integration.test.ts
import { createSupabaseClient } from '@/lib/supabase';

describe('Supabase Integration', () => {
  it('should fetch conversation sessions', async () => {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from('conversation_sessions')
      .select('*')
      .limit(1);

    expect(error).toBeNull();
    expect(data).toBeDefined();
  });
});
```

### Integration Tests

```typescript
// __tests__/conversation-flow.test.ts
describe('Conversation Flow', () => {
  it('should create session, send message, and receive real-time update', async () => {
    // 1. Create session
    // 2. Send message via API
    // 3. Verify real-time subscription receives update
  });
});
```

## Troubleshooting

### Common Issues

1. **RLS Policy Errors**
   - Check user authentication
   - Verify RLS policies are enabled
   - Check user_id matches auth.uid()

2. **Real-time Not Working**
   - Check Supabase project settings (Realtime enabled)
   - Verify channel subscription status
   - Check network connectivity

3. **Type Errors**
   - Generate types từ Supabase CLI
   - Update types khi schema thay đổi

## References

- [Supabase JS Client Docs](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)



