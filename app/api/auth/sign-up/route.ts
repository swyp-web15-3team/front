import * as Sentry from '@sentry/nextjs';
import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

import type { SignUpRequest, SignUpResponse } from '@/types/auth';

const REFRESH_TOKEN_COOKIE = 'refreshToken';

export async function POST(request: NextRequest) {
  const body: SignUpRequest = await request.json();

  try {
    // TODO: 카카오 신규 유저 식별 방식(임시 토큰 등) 스펙 확정되면 인증 정보 추가 전달
    const { data } = await axios.post<{ data: SignUpResponse }>(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/sign-up`,
      body
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
    if (process.env.NODE_ENV !== 'production') {
      // ponytail: 백엔드 /auth/sign-up 미연동 상태에서 회원가입 플로우를 확인하기 위한 mock 우회.
      // 백엔드 연동되면 이 분기는 삭제한다.
      const response = NextResponse.json({ accessToken: 'mock-access-token' });
      response.cookies.set(REFRESH_TOKEN_COOKIE, 'mock-refresh-token', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
      });
      return response;
    }

    Sentry.captureException(error);
    return NextResponse.json(
      { message: '회원가입에 실패했습니다.' },
      { status: 500 }
    );
  }
}
