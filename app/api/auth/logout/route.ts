import axios from 'axios';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const REFRESH_TOKEN_COOKIE = 'refreshToken';

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

  if (refreshToken) {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        refreshToken,
      });
    } catch {
      // 백엔드 로그아웃 실패와 무관하게 로컬 쿠키는 정리한다
    }
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete(REFRESH_TOKEN_COOKIE);
  return response;
}
