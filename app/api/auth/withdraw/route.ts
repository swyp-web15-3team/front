import * as Sentry from '@sentry/nextjs';
import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

import type { WithdrawRequest } from '@/lib/api/auth';

const REFRESH_TOKEN_COOKIE = 'refreshToken';

export async function POST(request: NextRequest) {
  const body: WithdrawRequest = await request.json();
  const authorization = request.headers.get('authorization');

  try {
    await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/withdrawal`,
      body,
      {
        headers: authorization ? { Authorization: authorization } : undefined,
      }
    );

    const response = NextResponse.json({ success: true });
    response.cookies.delete(REFRESH_TOKEN_COOKIE);
    return response;
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      { message: '회원 탈퇴에 실패했습니다.' },
      { status: 500 }
    );
  }
}
