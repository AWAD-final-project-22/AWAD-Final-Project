import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService, private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest();

    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (!authHeader) throw new UnauthorizedException('Missing Authorization header');

    const parts = authHeader.split(' ');
    const token = parts.length === 2 ? parts[1] : null; // Bearer <token>
    if (!token) throw new UnauthorizedException('Invalid Authorization header');

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_ACCESS_SECRET || process.env.JWT_ACCESS_SECRET || 'changeme',
      });

      req.user = payload; 

      return true;
    } catch (err) {
      throw new UnauthorizedException('Access token expired or invalid');
    }
  }
}