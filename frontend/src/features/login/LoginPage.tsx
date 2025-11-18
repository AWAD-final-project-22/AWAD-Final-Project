'use client';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { Form, Input, Typography, Divider } from 'antd'; // <-- Thêm Divider vào đây
import React from 'react';
import { GoogleLogin } from '@react-oauth/google';

import { useLogin } from './hooks/useLogin';
import {
  FormItem,
  LoginContainer,
  StyledCard,
  SubmitButton,
} from './styles/LoginPage.style';

const { Title } = Typography;

const LoginPage: React.FC = () => {
  const {
    form,
    onFinish,
    isLoading,
    onGoogleLoginSuccess,
    onGoogleLoginError,
  } = useLogin();

  return (
    <LoginContainer>
      <StyledCard>
        <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>
          Welcome Back
        </Title>
        <Form form={form} name="login" layout="vertical" onFinish={onFinish}>
          <FormItem
            name="email"
            label="Email"
            rules={[
              {
                type: 'email',
                message: 'Please enter a valid email address!',
              },
              { required: true, message: 'Please input your email!' },
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Enter your email"
              size="large"
            />
          </FormItem>
          <FormItem
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Enter your password"
              size="large"
            />
          </FormItem>

          <FormItem>
            <SubmitButton type="primary" loading={isLoading} htmlType="submit">
              Login
            </SubmitButton>
          </FormItem>
          {/* XÓA BỎ FormItem thứ 2 chứa Button từ đây đến dưới */}
        </Form>
        <Divider>OR</Divider>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin
            onSuccess={onGoogleLoginSuccess}
            onError={onGoogleLoginError}
            useOneTap
          />
        </div>
      </StyledCard>
    </LoginContainer>
  );
};

export default LoginPage;
