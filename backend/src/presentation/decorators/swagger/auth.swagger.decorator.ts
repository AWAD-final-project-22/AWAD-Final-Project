import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiCookieAuth,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LoginDto } from '../../dtos/request/login.dto';
import { RegisterDto } from '../../dtos/request/register.dto';
import { GoogleTokenDto } from '../../dtos/request/google-token.dto';

export const ApiLogin = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Login with email and password',
      description: 'Authenticate user with email and password, returns JWT tokens',
    }),
    ApiBody({ type: LoginDto }),
    ApiResponse({
      status: 201,
      description: 'Login successful, returns access and refresh tokens',
      schema: {
        example: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          user: {
            id: 'user-uuid',
            email: 'user@example.com',
            name: 'John Doe',
          },
        },
      },
    }),
    ApiResponse({ status: 401, description: 'Invalid credentials - Wrong email or password' }),
    ApiResponse({ status: 400, description: 'Bad request - Validation failed' }),
  );

export const ApiRegister = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Register a new user',
      description: 'Create a new user account with email, password, and name',
    }),
    ApiBody({ type: RegisterDto }),
    ApiResponse({
      status: 201,
      description: 'User registered successfully',
      schema: {
        example: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          user: {
            id: 'user-uuid',
            email: 'newuser@example.com',
            name: 'Jane Doe',
          },
        },
      },
    }),
    ApiResponse({ status: 409, description: 'Conflict - Email already exists' }),
    ApiResponse({ status: 400, description: 'Bad request - Validation failed' }),
  );

export const ApiRefreshToken = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Refresh access token',
      description: 'Get a new access token using refresh token from cookie',
    }),
    ApiCookieAuth('refreshToken'),
    ApiResponse({
      status: 201,
      description: 'Token refreshed successfully, new refresh token set in cookie',
      schema: {
        example: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    }),
    ApiResponse({ status: 401, description: 'Unauthorized - Invalid or expired refresh token' }),
  );

export const ApiGoogleSignIn = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Login with Google ID Token',
      description: 'Authenticate user using Google ID Token from Google Sign-In',
    }),
    ApiBody({ type: GoogleTokenDto }),
    ApiResponse({
      status: 201,
      description: 'Google login successful',
      schema: {
        example: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          user: {
            id: 'user-uuid',
            email: 'google-user@gmail.com',
            name: 'Google User',
          },
        },
      },
    }),
    ApiResponse({ status: 401, description: 'Invalid Google ID token' }),
  );

export const ApiGoogleAuthUrl = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get Google OAuth consent URL',
      description: 'Generate Google OAuth 2.0 consent screen URL for Gmail access',
    }),
    ApiResponse({
      status: 200,
      description: 'Google OAuth consent URL returned',
      schema: {
        example: {
          url: 'https://accounts.google.com/o/oauth2/v2/auth?client_id=...&redirect_uri=...&scope=...',
        },
      },
    }),
  );

export const ApiGoogleCallback = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Exchange Google auth code for tokens',
      description: 'Exchange authorization code from Google OAuth for access tokens and user info',
    }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          code: { type: 'string', example: '4/0AY0e-g7...' },
        },
        required: ['code'],
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Google auth code exchanged successfully, refresh token set in cookie',
      schema: {
        example: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          user: {
            id: 'user-uuid',
            email: 'google-user@gmail.com',
            name: 'Google User',
            googleLinked: true,
          },
        },
      },
    }),
    ApiResponse({ status: 400, description: 'Bad request - Invalid authorization code' }),
    ApiResponse({ status: 500, description: 'Failed to exchange code or fetch user info' }),
  );

export const ApiLogout = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Logout user',
      description: 'Logout user by clearing refresh token cookie',
    }),
    ApiBearerAuth('JWT-auth'),
    ApiResponse({
      status: 200,
      description: 'Logged out successfully, refresh token cookie cleared',
      schema: {
        example: {
          message: 'Logged out successfully',
        },
      },
    }),
    ApiResponse({ status: 401, description: 'Unauthorized - Must be logged in to logout' }),
  );
