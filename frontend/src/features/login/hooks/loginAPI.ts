import { API_PATH } from '@/constants/apis.constant';
import { UseMutationLoginOptions } from '@/interfaces/query';
import { useMutation } from '@tanstack/react-query';
import { loginUser, loginWithGoogle } from '../services/loginQueries';

export const useMutationLogin = ({
  onSuccess,
  onError,
}: UseMutationLoginOptions) => {
  return useMutation({
    mutationKey: [API_PATH.AUTHENTICATE.LOGIN.API_KEY],
    mutationFn: loginUser,
    onSuccess,
    onError,
  });
};

export const useMutationGoogleLogin = ({
  onSuccess,
  onError,
}: UseMutationLoginOptions) => {
  return useMutation({
    mutationKey: [API_PATH.AUTHENTICATE.GOOGLE_LOGIN.API_KEY],
    mutationFn: (idToken: string) => loginWithGoogle(idToken),
    onSuccess,
    onError,
  });
};
