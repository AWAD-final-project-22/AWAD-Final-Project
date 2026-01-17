'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  logout as logoutAction,
  selectAccessToken,
} from '@/redux/slices/authSlice';

const LOGOUT_CHANNEL_NAME = 'logout_sync_channel';

export interface UseLogoutSyncOptions {
  onLogoutReceived?: () => void;
}

export const useLogoutSync = (options?: UseLogoutSyncOptions) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector(selectAccessToken);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const onLogoutReceivedRef = useRef(options?.onLogoutReceived);
  onLogoutReceivedRef.current = options?.onLogoutReceived;

  const accessTokenRef = useRef(accessToken);
  accessTokenRef.current = accessToken;

  useEffect(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      channelRef.current = new BroadcastChannel(LOGOUT_CHANNEL_NAME);

      channelRef.current.onmessage = (event) => {
        if (event.data === 'LOGOUT') {
          if (!accessTokenRef.current) return;

          dispatch(logoutAction());
          onLogoutReceivedRef.current?.();
          router.push('/login');
        }
      };
    }

    return () => {
      channelRef.current?.close();
    };
  }, [dispatch, router]);

  const broadcastLogout = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.postMessage('LOGOUT');
    }
  }, []);

  return { broadcastLogout };
};
