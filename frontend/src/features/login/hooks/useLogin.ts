import { useAppDispatch } from "@/redux/hooks";
import { setAccessToken } from "@/redux/slices/authSlice";
import apiClient from "@/services/apis/apiClient";
import { App, Form } from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutationLogin } from "./loginAPIs";
import { ILoginParams } from "../interfaces/login.interface";

export const useLogin = () => {
  const { notification, message } = App.useApp();
  const [form] = Form.useForm();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const { mutateAsync: login, isPending: isLoginLoading } = useMutationLogin({
    onSuccess: () => {
      notification.success({
        message: "Login Successful",
        description: "You have successfully logged in.",
      });
    },
    onError: (error) => {
      notification.error({
        message: "Login Failed",
        description:
          (error as Error).message || "An error occurred during login.",
      });
    },
  });

  const onFinish = async (values: ILoginParams) => {
    try {
      const response = await login(values);
      dispatch(setAccessToken(response.data.accessToken));
      router.push("/inbox");
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      // Call Backend API to get Google Consent URL
      const response = await apiClient.get("/auth/google/url");
      const { url } = response.data;

      if (url) {
        // Redirect browser to Google
        window.location.href = url;
      } else {
        message.error("Failed to get authentication URL");
      }
    } catch (error) {
      console.error("Google Login Error:", error);
      message.error("Could not connect to Google login service");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return {
    form,
    onFinish,
    isLoading: isLoginLoading || isGoogleLoading,
    handleGoogleLogin,
  };
};
