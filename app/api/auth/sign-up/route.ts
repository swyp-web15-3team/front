import * as Sentry from '@sentry/nextjs';
import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

import type { SignUpRequest, SignUpResponse } from '@/types/auth';

const REFRESH_TOKEN_COOKIE = 'refreshToken';

export async function POST(request: NextRequest) {
  const authorization = request.headers.get('authorization');

  try {
    // 본문 파싱도 try 안에서 한다. 밖에 두면 중복 제출 등으로 본문이 소비된 요청이
    // catch를 못 타고 로그 없는 500으로 새어 나간다.
    const body: SignUpRequest = await request.json();

    const { data } = await axios.post<{ data?: SignUpResponse }>(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/sign-up`,
      body,
      authorization ? { headers: { Authorization: authorization } } : undefined
    );

    const { accessToken, refreshToken } = data?.data ?? {};

    // 토큰을 받았으면 그걸로 세션을 새로 깐다. 아직 안 주는 동안에는
    // 카카오 로그인 때 받아둔 pending accessToken + refreshToken 쿠키로 이어간다.
    if (!accessToken) {
      return new NextResponse(null, { status: 204 });
    }

    const response = NextResponse.json({ accessToken });

    if (refreshToken) {
      response.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
    }

    return response;
  } catch (error) {
    const status = axios.isAxiosError(error)
      ? (error.response?.status ?? 500)
      : 500;

    // 4xx는 예상된 비즈니스 에러라 기록하지 않는다 (인증 만료, 중복 가입 등).
    if (status >= 500) {
      Sentry.captureException(error);
    }

    if (process.env.NODE_ENV !== 'production') {
      // axios 에러가 아닌 경우(응답 파싱 실패 등)도 찍어야 원인이 보인다.
      console.error('[auth/sign-up] 실패', {
        status,
        data: axios.isAxiosError(error) ? error.response?.data : undefined,
        error: axios.isAxiosError(error) ? undefined : error,
      });
    }

    // 백엔드 에러 본문을 그대로 넘겨 화면에서 사유를 구분할 수 있게 한다.
    const data = axios.isAxiosError(error) ? error.response?.data : undefined;

    return NextResponse.json(data ?? { message: '회원가입에 실패했습니다.' }, {
      status,
    });
  }
}
