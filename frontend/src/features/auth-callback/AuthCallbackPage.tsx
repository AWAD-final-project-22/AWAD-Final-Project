import React from "react";
import { useAuthCallback } from "./hooks/useAuthCallback";
import { Spin } from "antd";
import { CallbackContainer } from "./styles/AuthCallbackPage.style";

export const AuthCallbackPage: React.FC = () => {
  useAuthCallback();

  return (
    <CallbackContainer>
      <Spin size="large" tip="Processing login..." />
    </CallbackContainer>
  );
};
