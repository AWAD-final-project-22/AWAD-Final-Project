import { Body, Controller, Post, HttpException, HttpStatus } from '@nestjs/common';
import { Public } from '../decorators/public.decorator';
import { LoginUseCase } from '../../application/use-cases/auth/login.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/auth/refresh-token.use-case';
import { GoogleSignInUseCase } from '../../application/use-cases/auth/google-signin.use-case';
import { LoginDto } from '../dtos/login.dto';
import { RegisterDto } from '../dtos/register.dto';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';
import { GoogleTokenDto } from '../dtos/google-token.dto';
import { RegisterUseCase } from '../../application/use-cases/auth/register.use-case';
import { EmailAlreadyExistsError } from '../../application/errors/email-already-exists.error';
import { InvalidCredentialsError } from '../../application/errors/invalid-credentials.error';


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
    async login(@Body() loginDto: LoginDto){
        try {
            const tokens = await this.loginUseCase.execute(loginDto.email, loginDto.password);
            return tokens;
        }
        catch (error) {
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
    async refreshToken(@Body() dto: RefreshTokenDto) {
        try {
            return await this.refreshTokenUseCase.execute(dto.refreshToken);
        } catch (err) {
            // Map Nest HTTP exceptions to consistent response shape
            if (err instanceof HttpException) {
                const status = err.getStatus();
                const message = (err.getResponse() as any)?.message ?? err.message;
                throw new HttpException({ status: 'error', message, data: null }, status);
            }
            throw err;
        }
    }

    @Public()
    @Post('google')
    async googleSignIn(@Body() dto: GoogleTokenDto) {
        try {
            return await this.googleSignInUseCase.execute(dto.idToken);
        } catch (err) {
            if (err instanceof HttpException) {
                const status = err.getStatus();
                const message = (err.getResponse() as any)?.message ?? err.message;
                throw new HttpException({ status: 'error', message, data: null }, status);
            }
            // map generic errors to 401 for invalid token / account issues
            throw new HttpException({ status: 'error', message: err.message ?? 'Unauthorized', data: null }, HttpStatus.UNAUTHORIZED);
        }
    }
}