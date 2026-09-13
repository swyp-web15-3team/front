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
    const { data } = await axios.post<{ data: KakaoLoginResponse }>(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/kakao`,
      { code }
    );

    const { accessToken, refreshToken, isNewUser } = data.data;

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
    if (process.env.NODE_ENV !== 'production') {
      // ponytail: 백엔드 /auth/kakao 미연동 상태에서 회원가입 플로우를 확인하기 위한 mock 우회.
      // 백엔드 연동되면 이 분기는 삭제한다.
      const redirectUrl = new URL('/login/callback', request.url);
      redirectUrl.searchParams.set('accessToken', 'mock-access-token');
      redirectUrl.searchParams.set('isNewUser', 'true');
      return NextResponse.redirect(redirectUrl);
    }

    Sentry.captureException(error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}
