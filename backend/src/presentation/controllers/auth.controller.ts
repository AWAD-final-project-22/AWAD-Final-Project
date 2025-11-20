import {
  Body,
  Controller,
  Post,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Auth') // Group endpoints under "Auth" tag in Swagger
@Controller('auth')
export class AuthController {
  constructor(
    private loginUseCase: LoginUseCase,
    private registerUseCase: RegisterUseCase,
    private refreshTokenUseCase: RefreshTokenUseCase,
    private googleSignInUseCase: GoogleSignInUseCase,
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
    try {
      const tokens = await this.loginUseCase.execute(
        loginDto.email,
        loginDto.password,
      );
      return tokens;
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        throw new HttpException(
          { status: 'error', message: error.message, data: null },
          HttpStatus.UNAUTHORIZED,
        );
      }
      throw error;
    }
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async register(@Body() registerDto: RegisterDto) {
    try {
      const user = await this.registerUseCase.execute(
        registerDto.email,
        registerDto.password,
        registerDto.name,
      );
      return user;
    } catch (err) {
      if (err instanceof EmailAlreadyExistsError) {
        throw new HttpException(
          { status: 'error', message: err.message, data: null },
          HttpStatus.CONFLICT,
        );
      }
      throw err;
    }
  }

  @Public()
  @Post('refresh-token')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 201, description: 'Token refreshed' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(@Body() dto: RefreshTokenDto) {
    try {
      return await this.refreshTokenUseCase.execute(dto.refreshToken);
    } catch (err) {
      // Map Nest HTTP exceptions to consistent response shape
      if (err instanceof HttpException) {
        const status = err.getStatus();
        const message = (err.getResponse() as any)?.message ?? err.message;
        throw new HttpException(
          { status: 'error', message, data: null },
          status,
        );
      }
      throw err;
    }
  }

  @Public()
  @Post('google')
  @ApiOperation({ summary: 'Login with Google ID Token' })
  @ApiResponse({ status: 201, description: 'Google login successful' })
  async googleSignIn(@Body() dto: GoogleTokenDto) {
    try {
      return await this.googleSignInUseCase.execute(dto.idToken);
    } catch (err) {
      if (err instanceof HttpException) {
        const status = err.getStatus();
        const message = (err.getResponse() as any)?.message ?? err.message;
        throw new HttpException(
          { status: 'error', message, data: null },
          status,
        );
      }
      throw new HttpException(
        { status: 'error', message: err.message ?? 'Unauthorized', data: null },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
