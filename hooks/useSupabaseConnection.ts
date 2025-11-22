'use client';

import { useEffect, useState } from 'react';
import { createSupabaseClient } from '@/lib/supabase';

/**
 * Monitor Supabase real-time connection status
 */
export function useSupabaseConnection() {
  const [isConnected, setIsConnected] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseClient();

    const channel = supabase
      .channel('connection-status')
      .on('system', {}, (payload: any) => {
        switch (payload.status) {
          case 'SUBSCRIBED':
            setIsConnected(true);
            setIsConnecting(false);
            break;
          case 'CHANNEL_ERROR':
          case 'TIMED_OUT':
          case 'CLOSED':
            setIsConnected(false);
            setIsConnecting(false);
            break;
          case 'CONNECTING':
            setIsConnecting(true);
            break;
          default:
            break;
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { isConnected, isConnecting };
}
