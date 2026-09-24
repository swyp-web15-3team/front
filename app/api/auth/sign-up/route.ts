import * as Sentry from '@sentry/nextjs';
import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

import type { SignUpRequest, SignUpResponse } from '@/types/auth';

const REFRESH_TOKEN_COOKIE = 'refreshToken';

export async function POST(request: NextRequest) {
  const body: SignUpRequest = await request.json();
  const authorization = request.headers.get('authorization');

  try {
    const { data } = await axios.post<{ data: SignUpResponse }>(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/sign-up`,
      body,
      authorization ? { headers: { Authorization: authorization } } : undefined
    );

    const { accessToken, refreshToken } = data.data;
    const response = NextResponse.json({ accessToken });
    response.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return response;
  } catch (error) {
    const status = axios.isAxiosError(error)
      ? (error.response?.status ?? 500)
      : 500;

    // 4xx는 예상된 비즈니스 에러라 기록하지 않는다 (인증 만료, 중복 가입 등).
    if (status >= 500) {
      Sentry.captureException(error);
    }

    if (process.env.NODE_ENV !== 'production' && axios.isAxiosError(error)) {
      console.error('[auth/sign-up] 실패', {
        status,
        data: error.response?.data,
      });
    }

    // 백엔드 에러 본문을 그대로 넘겨 화면에서 사유를 구분할 수 있게 한다.
    const data = axios.isAxiosError(error) ? error.response?.data : undefined;

    return NextResponse.json(data ?? { message: '회원가입에 실패했습니다.' }, {
      status,
    });
  }
}
