'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/redux/hooks';
import { logout as logoutAction } from '@/redux/slices/authSlice';

const LOGOUT_CHANNEL_NAME = 'logout_sync_channel';

export interface UseLogoutSyncOptions {
  onLogoutReceived?: () => void;
}

export const useLogoutSync = (options?: UseLogoutSyncOptions) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      channelRef.current = new BroadcastChannel(LOGOUT_CHANNEL_NAME);

      channelRef.current.onmessage = (event) => {
        if (event.data === 'LOGOUT') {
          dispatch(logoutAction());
          document.cookie =
            'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax';
          options?.onLogoutReceived?.();
          router.push('/login');
        }
      };
    }

    return () => {
      channelRef.current?.close();
    };
  }, [dispatch, router, options]);

  const broadcastLogout = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.postMessage('LOGOUT');
    }
  }, []);

  return { broadcastLogout };
};
