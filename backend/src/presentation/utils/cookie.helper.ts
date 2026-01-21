import { Response } from 'express';

export class CookieHelper {
  static setRefreshToken(res: Response, token: string) {
    const cookieDomain = process.env.COOKIE_DOMAIN?.trim();
    res.cookie('refreshToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      ...(cookieDomain ? { domain: cookieDomain } : {}),
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  static clearRefreshToken(res: Response) {
    const cookieDomain = process.env.COOKIE_DOMAIN?.trim();
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      ...(cookieDomain ? { domain: cookieDomain } : {}),
    });
  }
}
