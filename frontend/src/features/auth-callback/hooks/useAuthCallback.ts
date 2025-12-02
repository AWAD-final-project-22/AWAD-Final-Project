import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/redux/slices/authSlice";
import apiClient from "@/services/apis/apiClient";

export const useAuthCallback = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const processedRef = useRef(false);

  useEffect(() => {
    const code = searchParams.get("code");

    if (code && !processedRef.current) {
      processedRef.current = true;

      const exchangeCode = async () => {
        try {
          const response = await apiClient.post("/auth/google/callback", {
            code,
          });
          const { accessToken, user } = response.data;

          dispatch(setCredentials({ accessToken, user }));

          router.push("/inbox");
        } catch (error) {
          console.error("Google OAuth failed:", error);
          router.push("/login?error=oauth_failed");
        }
      };

      exchangeCode();
    } else if (!code) {
      router.push("/login");
    }
  }, [searchParams, router, dispatch]);

  return {};
};
