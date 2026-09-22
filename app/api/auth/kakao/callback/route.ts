import * as Sentry from '@sentry/nextjs';
import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

import type { KakaoLoginResponse } from '@/types/auth';

const REFRESH_TOKEN_COOKIE = 'refreshToken';

function getBaseUrl(request: NextRequest) {
  return process.env.NEXT_PUBLIC_APP_URL ?? request.url;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const baseUrl = getBaseUrl(request);

  if (!code) {
    return NextResponse.redirect(new URL('/login', baseUrl));
  }

  try {
    const { data } = await axios.post<{ data: KakaoLoginResponse }>(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/kakao`,
      { code },
      { params: { redirectUri: process.env.KAKAO_REDIRECT_URI } }
    );

    const { accessToken, refreshToken, isNewUser } = data.data;

    const redirectUrl = new URL('/login/callback', baseUrl);
    redirectUrl.searchParams.set('accessToken', accessToken);
    redirectUrl.searchParams.set('isNewUser', String(isNewUser));

    const response = NextResponse.redirect(redirectUrl);

    // 신규 유저는 회원가입(sign-up) 완료 전까지 로그인 상태로 만들지 않는다.
    if (!isNewUser) {
      response.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
    }

    return response;
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.redirect(new URL('/login', baseUrl));
  }
}
