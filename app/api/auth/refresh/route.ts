import * as Sentry from '@sentry/nextjs';
import axios from 'axios';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import type { TokenPair } from '@/types/auth';

const REFRESH_TOKEN_COOKIE = 'refreshToken';

// TODO: 백엔드 /auth/refresh 연동 완료 후 응답 형식(TokenPair) 재확인
export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!refreshToken) {
    return NextResponse.json(
      { message: 'refreshToken이 없습니다.' },
      { status: 401 }
    );
  }

  try {
    const { data } = await axios.post<TokenPair>(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
      { refreshToken }
    );

    const { refreshToken: newRefreshToken, ...tokenResponse } = data;
    const response = NextResponse.json(tokenResponse);
    response.cookies.set(REFRESH_TOKEN_COOKIE, newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return response;
  } catch (error) {
    Sentry.captureException(error);

    const response = NextResponse.json(
      { message: '토큰 재발급에 실패했습니다.' },
      { status: 401 }
    );
    response.cookies.delete(REFRESH_TOKEN_COOKIE);
    return response;
  }
}
