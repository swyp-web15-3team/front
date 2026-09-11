import * as Sentry from '@sentry/nextjs';
import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

import type { KakaoLoginResponse } from '@/types/auth';

const REFRESH_TOKEN_COOKIE = 'refreshToken';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const { data } = await axios.post<KakaoLoginResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/kakao`,
      { code }
    );

    const { accessToken, refreshToken, isNewUser } = data;

    const redirectUrl = new URL('/login/callback', request.url);
    redirectUrl.searchParams.set('accessToken', accessToken);
    redirectUrl.searchParams.set('isNewUser', String(isNewUser));

    const response = NextResponse.redirect(redirectUrl);
    response.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return response;
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}
