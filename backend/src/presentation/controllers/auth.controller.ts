import {
  Body,
  Controller,
  Post,
  HttpException,
  HttpStatus,
  Res,
  Get,
  UseGuards,
} from '@nestjs/common';
import { Cookies } from '../decorators/cookies.decorator';
import { Public } from '../decorators/public.decorator';
import { LoginUseCase } from '../../application/use-cases/auth/login.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/auth/refresh-token.use-case';
import { GoogleSignInUseCase } from '../../application/use-cases/auth/google-signin.use-case';
import { LoginDto } from '../dtos/request/login.dto';
import { RegisterDto } from '../dtos/request/register.dto';
import { RefreshTokenDto } from '../dtos/request/refresh-token.dto';
import { GoogleTokenDto } from '../dtos/request/google-token.dto';
import { RegisterUseCase } from '../../application/use-cases/auth/register.use-case';
import { EmailAlreadyExistsError } from '../../application/errors/email-already-exists.error';
import { InvalidCredentialsError } from '../../application/errors/invalid-credentials.error';
import { GoogleOAuthUseCase } from '../../application/use-cases/auth/google-oauth.use-case';
import type { Response, Request } from 'express';
import { CookieHelper } from '../utils/cookie.helper';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private loginUseCase: LoginUseCase,
    private registerUseCase: RegisterUseCase,
    private refreshTokenUseCase: RefreshTokenUseCase,
    private googleSignInUseCase: GoogleSignInUseCase,
    private googleOAuthUseCase: GoogleOAuthUseCase,
  ) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({
    status: 201,
    description: 'Login successful',
    schema: { example: { accessToken: '...', refreshToken: '...' } },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    return await this.loginUseCase.execute(loginDto.email, loginDto.password);
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async register(@Body() registerDto: RegisterDto) {
    return await this.registerUseCase.execute(
      registerDto.email,
      registerDto.password,
      registerDto.name,
    );
  }

  @Public()
  @Post('refresh-token')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 201, description: 'Token refreshed' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(
    @Cookies('refreshToken') token: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.refreshTokenUseCase.execute(token);
    CookieHelper.setRefreshToken(res, result.refreshToken);
    return { accessToken: result.accessToken };
  }

  @Public()
  @Post('google')
  @ApiOperation({ summary: 'Login with Google ID Token' })
  @ApiResponse({ status: 201, description: 'Google login successful' })
  async googleSignIn(@Body() dto: GoogleTokenDto) {
    return await this.googleSignInUseCase.execute(dto.idToken);
  }

  @Public()
  @Get('google/url')
  @ApiOperation({ summary: 'Get Google OAuth consent URL' })
  @ApiResponse({ status: 200, description: 'Google OAuth consent URL' })
  getGoogleAuthUrl() {
    const url = this.googleOAuthUseCase.getConsentUrl();
    return { url };
  }

  @Public()
  @Post('google/callback')
  @ApiOperation({ summary: 'Exchange Google auth code for tokens' })
  @ApiResponse({
    status: 200,
    description: 'Google auth code exchanged successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid auth code' })
  async googleCallback(
    @Body('code') code: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.googleOAuthUseCase.exchangeCode(code);

    CookieHelper.setRefreshToken(res, result.refreshToken);

    return { accessToken: result.accessToken, user: result.user };
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  @UseGuards(JwtAuthGuard)
  async logout(@Res({ passthrough: true }) res: Response) {
    CookieHelper.clearRefreshToken(res);
    return { message: 'Logged out successfully' };
  }
}
