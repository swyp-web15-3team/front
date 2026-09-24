import * as Sentry from '@sentry/nextjs';
import axios from 'axios';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import type { TokenPair } from '@/types/auth';

const REFRESH_TOKEN_COOKIE = 'refreshToken';

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
    const { data } = await axios.post<{ data: TokenPair }>(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
      { refreshToken }
    );

    const { refreshToken: newRefreshToken, ...tokenResponse } = data.data;

    cookieStore.set(REFRESH_TOKEN_COOKIE, newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return NextResponse.json(tokenResponse);
  } catch (error) {
    Sentry.captureException(error);

    const status = axios.isAxiosError(error)
      ? (error.response?.status ?? 500)
      : 500;

    // 백엔드가 토큰 자체를 거부한 경우에만 쿠키를 지운다.
    // 네트워크 오류/5xx로 지우면 멀쩡한 refreshToken이 날아간다.
    if (status === 401 || status === 403) {
      cookieStore.delete(REFRESH_TOKEN_COOKIE);
    }

    return NextResponse.json(
      { message: '토큰 재발급에 실패했습니다.' },
      { status }
    );
  }
}
