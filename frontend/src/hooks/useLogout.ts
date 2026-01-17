'use client';

import { useRouter } from 'next/navigation';
import { App } from 'antd';
import { useAppDispatch } from '@/redux/hooks';
import { setAccessToken } from '@/redux/slices/authSlice';
import { useMutationLogout } from '@/hooks/apis/authenAPIs';
import { useLogoutSync } from '@/hooks/useLogoutSync';

export const useLogout = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { notification } = App.useApp();
  const { broadcastLogout } = useLogoutSync();

  const { mutate: logout, isPending: isLoggingOut } = useMutationLogout({
    onSuccess: () => {
      notification.success({ message: 'Logged out successfully' });
      dispatch(setAccessToken(null));
      broadcastLogout();
      router.push('/login');
    },
    onError: (error) => {
      console.error('Logout failed:', error);
      notification.error({ message: 'Logout failed' });
    },
  });

  const handleLogout = () => {
    logout();
  };

  return { handleLogout, isLoggingOut };
};
