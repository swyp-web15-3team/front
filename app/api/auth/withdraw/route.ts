import * as Sentry from '@sentry/nextjs';
import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

const REFRESH_TOKEN_COOKIE = 'refreshToken';

export async function POST(request: NextRequest) {
  const authorization = request.headers.get('authorization');

  try {
    const body = await request.json().catch(() => ({}));

    await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/withdrawal`,
      body,
      { headers: authorization ? { Authorization: authorization } : undefined }
    );

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
