// lib/cookie-manager.ts
import { NextResponse } from 'next/server';

export class CookieManager {
  static setAuthCookies(response: NextResponse, tokens: any) {
    response.cookies.set('auth-token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 // 15分钟
    });

    response.cookies.set('user-id', tokens.userinfo.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 // 15分钟
    });

    if (tokens.refresh_token) {
      response.cookies.set('refresh-token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7天
      });
    }

  }

  static clearAuthCookies(response: NextResponse) {
    response.cookies.delete('auth-token');
    response.cookies.delete('refresh-token');
    response.cookies.delete('user-id');
  }
}
