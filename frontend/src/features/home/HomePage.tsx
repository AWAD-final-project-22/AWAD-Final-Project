'use client';

import { useMutationLogout } from '@/hooks/apis/authenAPIs';
import { useAppDispatch } from '@/redux/hooks';
import { setAccessToken } from '@/redux/slices/authSlice';
import { App, Button } from 'antd';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  gap: 24px;
`;

const WelcomeText = styled.h1`
  font-size: 32px;
  font-weight: 600;
  color: #1890ff;
  margin: 0;
`;

export const HomePage: React.FC = () => {
  const router = useRouter();
  const { notification } = App.useApp();
  const dispatch = useAppDispatch();

  const { mutate: logout, isPending } = useMutationLogout({
    onSuccess: () => {
      notification.success({ message: 'Logged out successfully' });
      dispatch(setAccessToken(null));
      document.cookie =
        'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax';
      router.push('/login');
    },
    onError: (error) => {
      console.error('Logout failed:', error);
    },
  });

  const handleLogout = () => {
    logout();
  };

  return (
    <Container>
      <WelcomeText>Welcome AWAD Project</WelcomeText>
      <Button
        type='primary'
        size='large'
        onClick={handleLogout}
        loading={isPending}
      >
        Log out
      </Button>
    </Container>
  );
};
