import * as Sentry from '@sentry/nextjs';
import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

// import type { WithdrawRequest } from '@/lib/api/auth';

const REFRESH_TOKEN_COOKIE = 'refreshToken';

export async function POST(request: NextRequest) {
  // const body: WithdrawRequest = await request.json();
  const authorization = request.headers.get('authorization');

  try {
    await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/auth/withdrawal`, {
      headers: authorization ? { Authorization: authorization } : undefined,
    });

    const response = NextResponse.json({ success: true });
    response.cookies.delete(REFRESH_TOKEN_COOKIE);
    return response;
  } catch (error) {
    Sentry.captureException(error);
    const status = axios.isAxiosError(error)
      ? (error.response?.status ?? 500)
      : 500;

    if (process.env.NODE_ENV !== 'production' && axios.isAxiosError(error)) {
      console.error('[withdraw] upstream', {
        url: error.config?.url,
        method: error.config?.method,
        status,
        data: error.response?.data,
        allow: error.response?.headers?.allow,
      });
    }

    return NextResponse.json(
      { message: '회원 탈퇴에 실패했습니다.' },
      { status }
    );
  }
}
