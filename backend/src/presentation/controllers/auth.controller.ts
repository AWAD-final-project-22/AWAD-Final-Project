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
import { ApiTags } from '@nestjs/swagger';
import { Cookies } from '../decorators/cookies.decorator';
import { Public } from '../decorators/public.decorator';
import {
  ApiLogin,
  ApiRegister,
  ApiRefreshToken,
  ApiGoogleSignIn,
  ApiGoogleAuthUrl,
  ApiGoogleCallback,
  ApiLogout,
} from '../decorators/swagger/auth.swagger.decorator';
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
  @ApiLogin()
  async login(@Body() loginDto: LoginDto) {
    const result = await this.loginUseCase.execute(loginDto.email, loginDto.password);
    
    return result;
  }

  @Public()
  @Post('register')
  @ApiRegister()
  async register(@Body() registerDto: RegisterDto) {
    const result = await this.registerUseCase.execute(
      registerDto.email,
      registerDto.password,
      registerDto.name,
    );
    
    return result;
  }

  @Public()
  @Post('refresh-token')
  @ApiRefreshToken()
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
  @ApiGoogleSignIn()
  async googleSignIn(@Body() dto: GoogleTokenDto) {
    return await this.googleSignInUseCase.execute(dto.idToken);
  }

  @Public()
  @Get('google/url')
  @ApiGoogleAuthUrl()
  getGoogleAuthtUrl() {
    const url = this.googleOAuthUseCase.getConsentUrl();
    return { url };
  }

  @Public()
  @Post('google/callback')
  @ApiGoogleCallback()
  async googleCallback(
    @Body('code') code: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.googleOAuthUseCase.exchangeCode(code);

    // Using Helper
    CookieHelper.setRefreshToken(res, result.refreshToken);

    console.log('=== Google OAuth Callback Success ===');
    console.log('Access Token:', result.accessToken);
    console.log('User:', result.user.email);
    console.log('====================================');

    return { accessToken: result.accessToken, user: result.user };
  }

  @Post('logout')
  @ApiLogout()
  @UseGuards(JwtAuthGuard)
  async logout(@Res({ passthrough: true }) res: Response) {
    CookieHelper.clearRefreshToken(res);
    return { message: 'Logged out successfully' };
  }
}
