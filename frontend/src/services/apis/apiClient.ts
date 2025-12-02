import { API_PATH } from "@/constants/apis.constant";
import { notification } from "antd";
import axios from "axios";
import { store } from "@/redux/store";
import { setAccessToken } from "@/redux/slices/authSlice";

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_END_POINT,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  // timeout: 10000,
});

axiosClient.interceptors.request.use((config) => {
  const state = store.getState();
  const accessToken = state.auth.accessToken;
  if (accessToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error?.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await axiosClient.post<{ accessToken: string }>(
          API_PATH.AUTHENTICATE.REFRESH_TOKEN.API_PATH
        );

        const { accessToken } = refreshResponse.data;

        // Update Redux with new access token
        store.dispatch(setAccessToken(accessToken));

        // Update header for original request and retry
        axiosClient.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${accessToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;

        return axiosClient(originalRequest);
      } catch (err) {
        console.error("Refresh Token Failed:", err);
        notification.error({
          message: "Session Expired",
          description: "Your session has expired. Please log in again.",
        });
        // Clear auth state
        store.dispatch(setAccessToken(null));
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    return Promise.reject(
      new Error(
        error.response?.data?.message || error.response?.data?.Message || ""
      )
    );
  }
);

export default axiosClient;
