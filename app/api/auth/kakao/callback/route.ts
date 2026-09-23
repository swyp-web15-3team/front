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

  if (process.env.NODE_ENV !== 'production') {
    console.log('[kakao/callback] 진입', {
      code: code && `${code.slice(0, 8)}...`,
      error: request.nextUrl.searchParams.get('error'),
      errorDescription: request.nextUrl.searchParams.get('error_description'),
      redirectUri: process.env.KAKAO_REDIRECT_URI,
    });
  }

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

    if (process.env.NODE_ENV !== 'production') {
      console.log('[kakao/callback] 백엔드 응답', {
        ...data.data,
        accessToken: accessToken && `${accessToken.slice(0, 12)}...`,
        refreshToken: refreshToken && `${refreshToken.slice(0, 12)}...`,
      });
    }

    const redirectUrl = new URL('/login/callback', baseUrl);
    redirectUrl.searchParams.set('accessToken', accessToken);
    redirectUrl.searchParams.set('isNewUser', String(isNewUser));

    const response = NextResponse.redirect(redirectUrl);

    // 신규 유저도 refreshToken은 심는다. 약관 동의까지 가는 동안 새로고침/토큰 만료를
    // 견뎌야 하기 때문. 로그인 여부는 쿠키가 아니라 isNewUser로 구분한다.
    // redirect 응답에는 cookies()가 아니라 response.cookies로 심어야 헤더에 실린다.
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

    // 탈퇴 계정 등 4xx는 예상된 비즈니스 에러라 기록하지 않는다.
    if (status >= 500) {
      Sentry.captureException(error);
    }

    if (process.env.NODE_ENV !== 'production') {
      if (axios.isAxiosError(error)) {
        console.error('[kakao/callback] 실패', {
          url: error.config?.url,
          params: error.config?.params,
          status,
          data: error.response?.data,
        });
      } else {
        console.error('[kakao/callback] 실패', error);
      }
    }

    const loginUrl = new URL('/login', baseUrl);

    // 백엔드 에러 코드만 넘긴다. detail 문구를 그대로 실으면 외부에서 조작한
    // 텍스트가 우리 로그인 화면에 그대로 뜨게 되므로, 문구는 클라이언트에서 매핑한다.
    const code = axios.isAxiosError(error)
      ? error.response?.data?.code
      : undefined;

    if (typeof code === 'string' && /^[A-Z]+_\d+$/.test(code)) {
      loginUrl.searchParams.set('error', code);
    }

    return NextResponse.redirect(loginUrl);
  }
}
