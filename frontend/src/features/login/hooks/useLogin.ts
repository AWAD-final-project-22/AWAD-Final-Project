import { useAppDispatch } from '@/redux/hooks';
import { setAccessToken } from '@/redux/slices/authSlice';
import { App, Form } from 'antd';
import { useRouter } from 'next/navigation';
import { LoginFormValues } from '../interfaces';
import { useMutationLogin, useMutationGoogleLogin } from './loginAPI';
import { CredentialResponse } from '@react-oauth/google';

export const useLogin = () => {
  const { notification } = App.useApp();
  const [form] = Form.useForm();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { mutateAsync: login, isPending: isLoading } = useMutationLogin({
    onSuccess: () => {
      notification.success({
        message: 'Login Successful',
        description: 'You have successfully logged in.',
      });
    },
    onError: (error) => {
      notification.error({
        message: 'Login Failed',
        description:
          (error as Error).message || 'An error occurred during login.',
      });
    },
  });

  const { mutateAsync: googleLogin, isPending: isGoogleLoading } =
    useMutationGoogleLogin({
      onSuccess: (response) => {
        dispatch(setAccessToken(response?.data?.accessToken));
        notification.success({
          message: 'Login Successful',
          description: 'You have successfully logged in with Google.',
        });
        router.push('/');
      },
      onError: (error) => {
        notification.error({
          message: 'Google Login Failed',
          description:
            (error as Error).message ||
            'An error occurred during Google login.',
        });
      },
    });

  // const onFinish = async (values: LoginFormValues) => {
  //   try {
  //     const response = await login(values);
  //     // localStorage.setItem('accessToken', response?.data?.accessToken);
  //     dispatch(setAccessToken(response?.data?.accessToken));
  //     // localStorage.setItem('refreshToken', response?.data?.refreshToken);
  //     // document.cookie = `refreshToken=${response?.data?.refreshToken}; path=/; secure; samesite=strict`;
  //   } catch (error) {
  //     console.error('Login error:', error);
  //   } finally {
  //     router.push('/');
  //   }
  // };

  const onFinish = async (values: LoginFormValues) => {
    try {
      const response = await login(values);
      // localStorage.setItem('accessToken', response?.data?.accessToken);
      dispatch(setAccessToken(response?.data?.accessToken));
      // localStorage.setItem('refreshToken', response?.data?.refreshToken);
      // document.cookie = `refreshToken=${response?.data?.refreshToken}; path=/; secure; samesite=strict`;
      router.push('/');
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const onGoogleLoginSuccess = async (
    credentialResponse: CredentialResponse
  ) => {
    if (credentialResponse.credential) {
      try {
        console.log('Calling backend...');
        await googleLogin(credentialResponse.credential);
        console.log('Backend call successful');
      } catch (error) {
        console.error('Google login error:', error);
      }
    } else {
      onGoogleLoginError();
    }
  };

  const onGoogleLoginError = () => {
    notification.error({
      message: 'Google Login Failed',
      description: 'Could not get credential from Google.',
    });
  };

  return {
    form,
    onFinish,
    isLoading: isLoading || isGoogleLoading,
    onGoogleLoginSuccess,
    onGoogleLoginError,
  };
};
